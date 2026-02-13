import { join, resolve, basename, dirname } from "node:path";
import { mkdir, writeFile, readdir, stat, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import pkg from "../../package.json";
import { SyncManager, CourseLoader, CourseContainer, loadToken, getCourseCachePath, logger, exists } from "@progy/core";

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
        await SyncManager.uploadProgress(courseIdForSync, buffer.buffer as ArrayBuffer);
        hasChanges = false;
      }
    }, 2 * 60 * 1000); // 2 minutes

    child.on("close", async (code) => {
      clearInterval(syncInterval);
      watcher.close();
      logger.info("Saving final progress...", "SYNC");
      const buffer = await SyncManager.packProgress(runtimeCwd);
      await SyncManager.uploadProgress(courseIdForSync, buffer.buffer as ArrayBuffer);
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

    // FIX: Use canonical ID from registry if available
    if (source.id) {
      courseId = source.id;
    }

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
      const artifactName = `${courseId!.replace(/\//g, "-")}.progy`;
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



export async function detectEnvironment(cwd: string): Promise<"student" | "instructor"> {
  const hasCourseJson = await exists(join(cwd, "course.json"));

  if (hasCourseJson) return "instructor";
  return "student";
}


// Helper for download progress
async function downloadWithProgress(url: string, dest: string, label: string) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.statusText}`);

  const total = Number(resp.headers.get("content-length")) || 0;
  const reader = resp.body?.getReader();
  const file = Bun.file(dest).writer();

  if (!reader) throw new Error("Failed to start download");

  let received = 0;
  logger.info(`${label}...`, "SYNC");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    file.write(value);

    // Simple textual progress
    if (total > 0 && process.stdout.isTTY) {
      const percent = Math.floor((received / total) * 100);
      process.stdout.write(`\rDownload: ${percent}%`);
    }
  }
  file.end();
  if (process.stdout.isTTY) process.stdout.write("\n");
  logger.success("Download complete.");
}

export async function start(file: string | undefined, options: { offline?: boolean }) {
  const cwd = process.cwd();
  let runtimeCwd = cwd;
  let containerFile: string | null = null;
  let isOffline = !!options.offline;
  let courseIdForSync: string | null = null;

  const env = await detectEnvironment(cwd);
  const config = await SyncManager.loadConfig(cwd);

  // --- Environment Check ---
  if (env === "instructor") {
    // If running in an instructor directory (course.json present)
    // Run in instructor mode (persistent guest)
    logger.banner(pkg.version, "instructor", isOffline ? "offline" : "online");
    logger.brand("✨ Instructor Environment: Running in persistent GUEST mode.");
    await runServer(cwd, isOffline, null, false, false, "instructor");
    return;
  }

  // --- Student Flow ---
  if (!isOffline) {
    const token = await loadToken();
    if (!token) {
      logger.error("Authentication required.", "Run 'progy login' to sync your progress to the cloud, or use '--offline' to learn without an account.");
      process.exit(1);
    }
  }

  try {
    // Case 1: Manual .progy File
    if (file && file.endsWith(".progy") && await exists(file)) {
      containerFile = resolve(file);
      logger.info(`Opening ${basename(containerFile)}...`, "RUNTIME");
      runtimeCwd = await CourseContainer.unpack(containerFile);
    }
    // Case 2: Managed Course (via progy.toml)
    else if (config && config.course.id) {
      courseIdForSync = config.course.id;

      const { isAbsolute } = await import("node:path");
      const isLocalPath = config.course.repo.endsWith(".progy") ||
        config.course.repo.startsWith("./") ||
        config.course.repo.startsWith("../") ||
        isAbsolute(config.course.repo);

      let artifactPath = "";

      if (isLocalPath) {
        artifactPath = resolve(cwd, config.course.repo);
      } else {
        // Registry ID
        const artifactName = `${config.course.id.replace(/\//g, "-")}.progy`;
        artifactPath = join(getCourseCachePath(config.course.id), artifactName);
      }

      // Check if we need to download/restore assets
      if (!(await exists(artifactPath))) {
        if (isOffline) {
          logger.error("Course assets missing and offline mode is enabled.");
          process.exit(1);
        }

        try {
          const source = await CourseLoader.resolveSource(config.course.id);
          await mkdir(dirname(artifactPath), { recursive: true });

          // USE NEW PROGRESS HELPER
          await downloadWithProgress(source.url, artifactPath, "Restoring course assets");
        } catch (e: any) {
          logger.error(`Failed to restore course assets`, e.message);
          process.exit(1);
        }
      }

      if (await exists(artifactPath)) {
        logger.info(`Extracting course artifact...`, "RUNTIME");
        const runtimeRoot = await CourseContainer.unpack(artifactPath);

        process.env.PROG_RUNTIME_ROOT = runtimeRoot;
        runtimeCwd = cwd; // User workspace remains cwd
      }
    }
    // Case 3: Auto-detect local .progy file in CWD
    else {
      const files = await readdir(cwd);
      const progyFile = files.find(f => f.endsWith(".progy") && f !== ".progy");
      if (progyFile) {
        containerFile = join(cwd, progyFile);
        logger.info(`Auto-detected ${progyFile}`, "RUNTIME");
        runtimeCwd = await CourseContainer.unpack(containerFile);
      }
    }

    logger.banner(pkg.version, "student", isOffline ? "offline" : "online");
    await runServer(runtimeCwd, isOffline, containerFile, false, false, "student", courseIdForSync);
  } catch (e: any) {
    logger.error("Startup failed", e.message);
    process.exit(1);
  }
}
