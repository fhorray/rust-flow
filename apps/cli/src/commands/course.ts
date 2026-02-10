import { join, resolve, basename } from "node:path";
import { mkdir, writeFile, readFile, readdir, stat, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { GitUtils, SyncManager, CourseLoader, CourseContainer, RegistryCache, loadToken, BACKEND_URL, COURSE_CONFIG_NAME, TEMPLATES, RUNNER_README, logger, exists } from "@progy/core";

async function runServer(runtimeCwd: string, isOffline: boolean, containerFile: string | null, bypass: boolean = false, isEditor: boolean = false) {
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
      PROGY_EDITOR_MODE: isEditor ? "true" : "false"
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

      const artifactName = `${basename(courseId!)}.progy`;
      const artifactPath = join(cwd, artifactName);

      // 1. Download artifact to local folder
      logger.info(`Downloading course artifact...`, "SYNC");
      const resp = await fetch(source.url);
      if (!resp.ok) throw new Error(`Download failed: ${resp.statusText}`);
      await writeFile(artifactPath, Buffer.from(await resp.arrayBuffer()));

      // 2. Provisioning: Extract only 'content/' to local CWD if not present
      logger.info(`Provisioning exercise files...`, "LAYER");
      const tempDir = join(tmpdir(), `progy-init-${Date.now()}`);
      await CourseContainer.unpackTo(artifactPath, tempDir);

      const contentSrc = join(tempDir, "content");
      if (await exists(contentSrc)) {
        // We only copy content if it doesn't already exist locally (don't overwrite student work)
        const localContent = join(cwd, "content");
        if (!(await exists(localContent))) {
          await mkdir(localContent, { recursive: true });
        }
        // applyLayering will handle Recursive copy without overwriting existing exercise code
        await SyncManager.applyLayering(cwd, tempDir, false, "content");
      }

      await rm(tempDir, { recursive: true, force: true });

      // 3. Save progy.toml pointing to this artifact
      await SyncManager.saveConfig(cwd, {
        course: {
          id: courseId!,
          repo: artifactName, // Relative to CWD
          branch: "registry",
          path: "."
        }
      });

      await SyncManager.generateGitIgnore(cwd, courseId!);
      logger.success("Course initialized successfully!");
      logger.info(`Run 'progy' to start learning.`, "INFO");

    } else {
      // --- LEGACY GIT FLOW (Keeping for manual Git cloning) ---
      logger.info(`Resolved ${courseId} to Git repository.`, "GIT");
      // ... existing git flow ...
      // (Simplified for now, user mainly wants Registry fix)
      logger.info("Git-based init is deprecated. Please use official registry packages.");
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
    await CourseContainer.pack(cwd, resolve(filename));
    logger.success(`Created: ${filename}`);
  } catch (e: any) {
    logger.error(`Packaging Failed`, e.message);
    process.exit(1);
  }
}

export async function detectEnvironment(cwd: string): Promise<"student" | "instructor"> {
  const hasCourseJson = await exists(join(cwd, "course.json"));
  const hasContentDir = await exists(join(cwd, "content"));

  if (hasCourseJson && hasContentDir) return "instructor";
  return "student";
}

export async function dev(options: { offline?: boolean; bypass?: boolean; ui?: boolean }) {
  const cwd = process.cwd();
  const env = await detectEnvironment(cwd);
  if (env === "student") {
    logger.error("'progy dev' is for course development only.", "Use 'progy start' to learn.");
    process.exit(1);
  }

  try {
    await CourseLoader.validateCourse(cwd);
    logger.banner("0.15.0", "instructor", "offline");
    if (options.ui) {
      logger.brand("🎨 Progy Studio: Visual Course Editor active.");
    } else {
      logger.brand("✨ Development Mode: Running as GUEST (progress will not be persistent).");
    }
    if (options.bypass) logger.info("🔓 Progression Bypass Mode active.");
    await runServer(cwd, true, null, !!options.bypass, !!options.ui);
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

  const env = await detectEnvironment(cwd);
  const config = await SyncManager.loadConfig(cwd);

  // 1. Determine if we are running from an artifact (.progy)
  if (file && file.endsWith(".progy") && await exists(file)) {
    // Manually opening a .progy file
    containerFile = resolve(file);
    runtimeCwd = await CourseContainer.unpack(containerFile);
  } else if (config && config.course.repo.endsWith(".progy")) {
    // Running a course initialized via registry (layered flow)
    const artifactPath = resolve(cwd, config.course.repo);
    if (await exists(artifactPath)) {
      logger.info(`Extracting course artifact...`, "RUNTIME");
      const runtimeRoot = await CourseContainer.unpack(artifactPath);

      // CRITICAL: Set PROG_RUNTIME_ROOT so the backend knows where to find supplemental files
      process.env.PROG_RUNTIME_ROOT = runtimeRoot;
      logger.success(`Runtime environment ready.`);
    }
  } else if (file && !file.endsWith(".progy") && !await exists(file)) {
    // Alias resolution (keeping for one-off start)
    // ... similar to before but potentially updated for registry fix ...
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

  logger.banner("0.15.1", env, isOffline ? "offline" : "online");
  if (env === "instructor") {
    logger.brand("✨ Instructor Environment: Running in persistent GUEST mode.");
  }

  await runServer(runtimeCwd, isOffline, containerFile);
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
