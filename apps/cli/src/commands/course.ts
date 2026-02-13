import { join, resolve, basename, dirname } from "node:path";
import { mkdir, writeFile, readFile, readdir, stat, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import pkg from "../../package.json";
import { GitUtils, SyncManager, CourseLoader, CourseContainer, RegistryCache, loadToken, getCourseCachePath, BACKEND_URL, COURSE_CONFIG_NAME, TEMPLATES, RUNNER_README, logger, exists, detectEnvironment } from "@progy/core";

async function runServer(
  runtimeCwd: string,
  isOffline: boolean,
  containerFile: string | null,
  bypass: boolean = false,
  isEditor: boolean = false,
  cliEnv: "student" | "instructor" = "student",
  courseIdForSync: string | null = null
) {
  const isTs = import.meta.file.endsWith(".ts");
  const serverExt = isTs ? "ts" : "js";
  const serverPath = isTs
    ? join(import.meta.dir, "..", "backend", `server.${serverExt}`)
    : join(import.meta.dir, "backend", `server.${serverExt}`);

  const child = spawn("bun", ["run", serverPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      PROG_CWD: runtimeCwd,
      PROGY_OFFLINE: isOffline ? "true" : "false",
      PROGY_BYPASS_MODE: bypass ? "true" : "false",
      PROGY_EDITOR_MODE: isEditor ? "true" : "false",
      PROGY_CLI_ENV: cliEnv
    },
  });

  if (containerFile) {
    logger.info("💾 Auto-save: Monitoring changes in the background...", "SYNC");
    const { watch } = await import("node:fs");
    let debounceTimer: any = null;

    const watcher = watch(runtimeCwd, { recursive: true }, (event, filename) => {
      if (!filename || filename.includes(".git") || filename.includes("node_modules")) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          await CourseContainer.sync(runtimeCwd, containerFile);
        } catch (e) {
          logger.error(`Failed to save progress`, String(e));
        }
      }, 1000);
    });

    child.on("close", () => {
      watcher.close();
      CourseContainer.sync(runtimeCwd, containerFile).then(() => process.exit(0));
    });
  } else if (courseIdForSync) {
     logger.info("☁️  Cloud Sync: Active (every 2m & on exit)", "SYNC");
     const { watch } = await import("node:fs");
     let hasChanges = false;

     const watcher = watch(runtimeCwd, { recursive: true }, (event, filename) => {
        if (!filename || filename.includes(".git") || filename.includes("node_modules") || filename.includes(".DS_Store")) return;
        hasChanges = true;
     });

     const syncInterval = setInterval(async () => {
         if (hasChanges) {
             logger.info("Auto-syncing to cloud...", "SYNC");
             const buffer = await SyncManager.packProgress(runtimeCwd);
             await SyncManager.uploadProgress(courseIdForSync, buffer);
             hasChanges = false;
         }
     }, 2 * 60 * 1000); // 2 minutes

     child.on("close", async (code) => {
         clearInterval(syncInterval);
         watcher.close();
         logger.info("Saving final progress...", "SYNC");
         const buffer = await SyncManager.packProgress(runtimeCwd);
         await SyncManager.uploadProgress(courseIdForSync, buffer);
         process.exit(code ?? 0);
     });
  } else {
    child.on("close", (code) => process.exit(code ?? 0));
  }
}

export async function init(options: { course?: string; offline?: boolean }) {
  const cwd = process.cwd();
  const isOffline = !!options.offline;
  let courseId = options.course;

  if (!courseId && !isOffline) {
    courseId = "generic";
  }

  if (isOffline) {
    logger.warn("Offline init not supported yet.");
    return;
  }

  const token = await loadToken();
  if (!token) {
    logger.error("Authentication required.", "Run 'progy login' first.");
    process.exit(1);
  }

  try {
    const source = await CourseLoader.resolveSource(courseId!);

    if (source.isRegistry) {
      logger.info(`Resolving ${courseId} from Registry...`, "REGISTRY");

      // 0. Check for Cloud Progress
      logger.info(`Checking for existing progress...`, "SYNC");
      const progressBuffer = await SyncManager.downloadProgress(courseId!);

      if (progressBuffer) {
        logger.info(`Progress found! Restoring...`, "SYNC");
        await SyncManager.restoreProgress(progressBuffer, cwd);
        logger.success("Resumed course from cloud progress!");
        logger.info(`Run 'progy' to continue learning.`, "INFO");
        return;
      }

      // 1. If no progress, Download Course Artifact to Cache
      const artifactName = `${basename(courseId!)}.progy`;
      const cacheDir = getCourseCachePath(courseId!);
      await mkdir(cacheDir, { recursive: true });
      const artifactPath = join(cacheDir, artifactName);

      logger.info(`Downloading course content...`, "SYNC");
      const resp = await fetch(source.url);
      if (!resp.ok) throw new Error(`Download failed: ${resp.statusText}`);
      await writeFile(artifactPath, Buffer.from(await resp.arrayBuffer()));

      // 2. Provisioning: Extract only 'content/' to local CWD if not present
      logger.info(`Provisioning workspace...`, "LAYER");
      const tempDir = join(tmpdir(), `progy-init-${Date.now()}`);
      await CourseContainer.unpackTo(artifactPath, tempDir);

      const contentSrc = join(tempDir, "content");
      if (await exists(contentSrc)) {
        const localContent = join(cwd, "content");
        await SyncManager.applyLayering(localContent, tempDir, false, "content");
      }

      await rm(tempDir, { recursive: true, force: true });

      // 3. Save progy.toml pointing to this course ID
      await SyncManager.saveConfig(cwd, {
        course: {
          id: courseId!,
          repo: courseId!, // Store ID instead of absolute path for portability
          branch: "registry",
          path: "."
        }
      });

      await SyncManager.generateGitIgnore(cwd, courseId!);
      logger.success("Course initialized successfully!");
      logger.info(`Run 'progy' to start learning.`, "INFO");

    } else {
       logger.error("Git-based init is removed. Please use official registry packages (e.g. @scope/course).");
       process.exit(1);
    }
  } catch (e: any) {
    logger.error(`Init failed`, e.message);
    process.exit(1);
  }
}

export async function createCourse(options: { name: string; course: string }) {
  const cwd = process.cwd();
  const courseDir = join(cwd, options.name);
  const lang = options.course.toLowerCase();

  if (options.name !== "." && await exists(courseDir)) {
    logger.error(`Directory '${options.name}' already exists.`);
    process.exit(1);
  }

  const template = TEMPLATES[lang as keyof typeof TEMPLATES];
  if (!template) {
    logger.error(`Unsupported language '${lang}'.`);
    process.exit(1);
  }

  await mkdir(courseDir, { recursive: true });
  await mkdir(join(courseDir, "content", "01_intro"), { recursive: true });
  await mkdir(join(courseDir, "runner"), { recursive: true });

  const configStr = JSON.stringify(template.courseJson, null, 2)
    .replace(/{{id}}/g, options.name)
    .replace(/{{name}}/g, options.name);
  await writeFile(join(courseDir, "course.json"), configStr);
  await writeFile(join(courseDir, "SETUP.md"), template.setupMd);
  await writeFile(join(courseDir, "runner", "README.md"), RUNNER_README);
  await writeFile(join(courseDir, "content", "01_intro", "README.md"), template.introReadme);
  await writeFile(join(courseDir, "content", "01_intro", template.introFilename), template.introCode);

  logger.success(`Course created in ${options.name}`);
}

export async function validate(path: string) {
  const target = resolve(path);
  try {
    const config = await CourseLoader.validateCourse(target);
    logger.success(`Course Valid: ${config.name} (${config.id})`);
  } catch (e: any) {
    logger.error(`Validation Failed`, e.message);
    process.exit(1);
  }
}

export async function pack(options: { out?: string }) {
  const cwd = process.cwd();
  try {
    const config = await CourseLoader.validateCourse(cwd);
    const filename = options.out || `${config.id}.progy`;
    const destPath = resolve(filename);

    logger.info(`📦 Preparing package for ${config.id}...`, "PACK");

    // 1. Create a temporary packaging directory
    const tempPackDir = join(tmpdir(), `progy-pack-${Date.now()}`);
    await mkdir(tempPackDir, { recursive: true });

    // 2. Copy the whole course to temp (native Bun.write / cp is better here)
    // We'll use a simplified copy for now, including only what's needed
    const filesToCopy = await readdir(cwd);
    for (const file of filesToCopy) {
      if (file === ".progy" || file.endsWith(".progy") || file === "node_modules" || file === ".git") continue;

      const src = join(cwd, file);
      const dst = join(tempPackDir, file);
      const s = await stat(src);

      if (s.isDirectory()) {
        // Simple recursive copy (native on modern node, but let's be safe or use a helper)
        await cpRecursive(src, dst);
      } else {
        await Bun.write(dst, await Bun.file(src).arrayBuffer());
      }
    }

    // 3. Optimize Assets in the Temp Directory
    const tempAssetsDir = join(tempPackDir, "assets");
    if (await exists(tempAssetsDir)) {
      const { optimizeDirectory, updateAssetReferences } = await import("../utils/optimize");
      logger.info("🎨 Optimizing assets...", "ASSETS");
      const result = await optimizeDirectory(tempAssetsDir, tempAssetsDir);
      if (result.filesProcessed > 0) {
        const savedMb = (result.saved / 1024 / 1024).toFixed(2);
        logger.success(`Optimized ${result.filesProcessed} images. Saved ${savedMb}MB.`);

        // Update references in the temp directory files
        await updateAssetReferences(tempPackDir);
      }
    }


    // 4. Pack from Temp Directory
    await CourseContainer.pack(tempPackDir, destPath);

    // 5. Cleanup
    await rm(tempPackDir, { recursive: true, force: true });

    logger.success(`Created: ${filename}`);
  } catch (e: any) {
    logger.error(`Packaging Failed`, e.message);
    process.exit(1);
  }
}

async function cpRecursive(src: string, dst: string) {
  await mkdir(dst, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const dstPath = join(dst, entry.name);
    if (entry.isDirectory()) {
      await cpRecursive(srcPath, dstPath);
    } else {
      await Bun.write(dstPath, await Bun.file(srcPath).arrayBuffer());
    }
  }
}


export async function dev(options: { offline?: boolean; bypass?: boolean }) {
  const cwd = process.cwd();
  const env = await detectEnvironment(cwd);
  if (env === "student") {
    logger.error("'progy dev' is for course development only.", "Use 'progy start' to learn.");
    process.exit(1);
  }

  try {
    await CourseLoader.validateCourse(cwd);
    logger.banner(pkg.version, "instructor", "offline");
    logger.brand("✨ Development Mode: Running as GUEST (progress will not be persistent).");
    if (options.bypass) logger.info("🔓 Progression Bypass Mode active.");
    await runServer(cwd, true, null, !!options.bypass, false, "instructor");
  } catch (e: any) {
    logger.error(`Not a valid course`, e.message);
    process.exit(1);
  }
}

export async function start(file: string | undefined, options: { offline?: boolean }) {
  const cwd = process.cwd();
  let runtimeCwd = cwd;
  let containerFile: string | null = null;
  let isOffline = !!options.offline;
  let courseIdForSync: string | null = null;

  const env = await detectEnvironment(cwd);
  const config = await SyncManager.loadConfig(cwd);

  // 1. Determine if we are running from an artifact (.progy)
  if (file && file.endsWith(".progy") && await exists(file)) {
    // Manually opening a .progy file
    containerFile = resolve(file);
    runtimeCwd = await CourseContainer.unpack(containerFile);
  } else if (config && config.course.id) {
    // Running a managed course (Cloud Flow)
    courseIdForSync = config.course.id;
    let artifactPath = "";

    // Resolve cache path
    // IMPORTANT: Distinguish between registry IDs (@scope/pkg) and local paths
    const { isAbsolute } = await import("node:path");
    const isLocalPath = config.course.repo.endsWith(".progy") ||
                        config.course.repo.startsWith("./") ||
                        config.course.repo.startsWith("../") ||
                        isAbsolute(config.course.repo);

    if (isLocalPath) {
         // Explicit local path
         artifactPath = resolve(cwd, config.course.repo);
    } else {
         // Registry ID (e.g. "python-basics", "@scope/course")
         const artifactName = `${basename(config.course.id)}.progy`;
         artifactPath = join(getCourseCachePath(config.course.id), artifactName);
    }

    // Hydration Check
    if (!(await exists(artifactPath))) {
        logger.info(`Course assets missing. Redownloading...`, "SYNC");
        try {
            const source = await CourseLoader.resolveSource(config.course.id);
            const resp = await fetch(source.url);
            if (!resp.ok) throw new Error(`Download failed: ${resp.statusText}`);
            await mkdir(dirname(artifactPath), { recursive: true });
            await writeFile(artifactPath, Buffer.from(await resp.arrayBuffer()));
            logger.success("Course assets restored.");
        } catch (e: any) {
            logger.error(`Failed to restore course assets`, e.message);
            process.exit(1);
        }
    }

    if (await exists(artifactPath)) {
      logger.info(`Extracting course artifact...`, "RUNTIME");
      const runtimeRoot = await CourseContainer.unpack(artifactPath);

      // CRITICAL: Set PROG_RUNTIME_ROOT so the backend knows where to find supplemental files (course.json, etc)
      process.env.PROG_RUNTIME_ROOT = runtimeRoot;
      // Keep PROG_CWD as the original folder so resolveFile sees local edits first
      runtimeCwd = cwd;
      logger.success(`Runtime environment ready.`);
    }
  } else if (env === "instructor") {
    isOffline = true;
  } else {
    // Auto-detect local .progy file
    const files = await readdir(cwd);
    const progyFile = files.find(f => f.endsWith(".progy") && f !== ".progy");
    if (progyFile) {
      containerFile = join(cwd, progyFile);
      runtimeCwd = await CourseContainer.unpack(containerFile);
    }
  }

  logger.banner(pkg.version, env, isOffline ? "offline" : "online");
  if (env === "instructor") {
    logger.brand("✨ Instructor Environment: Running in persistent GUEST mode.");
  }

  await runServer(runtimeCwd, isOffline, containerFile, false, false, env, courseIdForSync);
}

export async function testExercise(path: string) {
  const cwd = process.cwd();
  const env = await detectEnvironment(cwd);
  if (env === "student") {
    logger.error("'progy test' is for course development only.");
    process.exit(1);
  }

  try {
    await CourseLoader.validateCourse(cwd);
    logger.info(`Running exercise: ${path}`, "TEST");
    const exercisePath = join(cwd, path);
    if (!await exists(exercisePath)) {
      logger.error(`Exercise not found: ${path}`);
      process.exit(1);
    }
    logger.success(`Exercise path exists: ${path}`);
  } catch (e: any) {
    logger.error(e.message);
    process.exit(1);
  }
}
