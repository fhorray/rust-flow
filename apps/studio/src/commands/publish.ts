
import { Command } from "commander";
import { resolve, join } from "node:path";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { logger, CourseContainer, SyncManager, CoursePublisher, getUser } from "@progy/core";
import { prepareOptimizedTempDir } from "../utils/optimize";
import { generateGuardSnapshot } from "../utils/scanner";

export function publish(program: Command) {
  program
    .command("publish")
    .description("Publish the course to the registry")
    .argument("[dir]", "Course directory (default: current directory)")
    .option("--major", "Bump major version")
    .option("--minor", "Bump minor version")
    .option("--patch", "Bump patch version")
    .action(async (dir, options) => {
      const cwd = resolve(dir || process.cwd());

      const hasProgyToml = existsSync(join(cwd, "progy.toml"));
      const hasCourseJson = existsSync(join(cwd, "course.json"));

      if (!existsSync(join(cwd, "progy.toml")) && !existsSync(join(cwd, "course.json"))) {
        logger.error("Not a valid Progy course directory");
        process.exit(1);
      }

      let courseId = "";
      let currentVersion = "0.0.1";
      let config: any = null; // TODO: implement a proper type here, maybe get it from the core/types?
      let metadata: any = {};

      // Load Config & Metadata
      if (hasProgyToml) {
        config = await SyncManager.loadConfig(cwd);
        if (config?.course?.id) {
          courseId = config.course.id;
          currentVersion = config.course.version || "0.0.1";
          metadata = {
            title: config.course.name || courseId,
            description: config.course.description,
            tags: config.course.tags,
            runners: config.runners
          };
        }
      } else if (hasCourseJson) {
        try {
          const courseJsonRef = Bun.file(join(cwd, "course.json"));
          config = await courseJsonRef.json();
          if (config.id) courseId = config.id;
          if (config.version) currentVersion = config.version;
          metadata = {
            title: config.title || config.name || courseId,
            description: config.description || "",
            tags: config.tags || [],
            runners: config.runners || []
          };
        } catch (e) { }
      }

      // Auth & User check moved up or integrated
      const user = await getUser();
      if (!user) {
        logger.error("Not authenticated", "Please run 'progy login' first.");
        process.exit(1);
      }


      // 2. Derive Slug & Final Name
      const courseTitle = config.title || config.name || config.course?.name;
      if (!courseTitle) {
        logger.error("Could not determine Course Name. Please add a 'name' or 'title' to your config.");
        process.exit(1);
      }

      const { slugify } = await import("@progy/core");
      const slug = slugify(courseTitle);
      const finalName = `@${user.username}/${slug}`;

      logger.info(`Source course: ${courseId || "local"}`);
      logger.info(`Final registry name: ${finalName}`);


      let newVersion = currentVersion;

      // Calculate New Version
      if (options.major || options.minor || options.patch) {
        try {
          const parts = currentVersion.split(".").map(Number);
          if (parts.length !== 3 || parts.some(isNaN)) {
            logger.warn(`Current version '${currentVersion}' is not valid semantic versioning (x.y.z). Defaulting to simple increment.`);
          }

          let [major, minor, patch] = parts;
          if (options.major) {
            major++;
            minor = 0;
            patch = 0;
          } else if (options.minor) {
            minor++;
            patch = 0;
          } else if (options.patch) {
            patch++;
          }
          newVersion = `${major}.${minor}.${patch}`;
          logger.info(`Bumping version: ${currentVersion} -> ${newVersion}`);
        } catch (e: any) {
          logger.error("Failed to parse/bump version", e.message);
          process.exit(1);
        }
      }

      // Update Config File with New Version if changed
      if (newVersion !== currentVersion) {
        try {
          if (hasProgyToml && config) {
            config.course.version = newVersion;
            await SyncManager.saveConfig(cwd, config);
          } else if (hasCourseJson && config) {
            config.version = newVersion;
            await Bun.write(join(cwd, "course.json"), JSON.stringify(config, null, 2));
          }
          logger.info(`Updated config: Version=${newVersion}`);
        } catch (e: any) {
          logger.error("Failed to update config file", e.message);
          process.exit(1);
        }
      }

      logger.info(`🚀 Publishing ${finalName} v${newVersion}...`); // Use finalName in log

      const tempFile = join(cwd, `temp-publish-${Date.now()}.progy`);

      try {
        // 1. Pack
        logger.info("📦 Packing course...");
        const optimizedDir = await prepareOptimizedTempDir(cwd);
        await CourseContainer.pack(optimizedDir, tempFile);

        // 1.5 Generate Guard Snapshot (from optimized dir to exclude heavy assets)
        const guardSnapshot = await generateGuardSnapshot(optimizedDir);

        await rm(optimizedDir, { recursive: true, force: true });

        // 2. Publish
        logger.info("Uploading to registry...");

        // Ensure metadata is never null/undefined
        if (!metadata) metadata = {};

        // CRITICAL: Backend expects 'name' (scoped) and 'version' in metadata
        metadata.name = finalName;
        metadata.version = newVersion;
        if (!metadata.title) metadata.title = courseTitle || finalName;


        // We pass 'finalName' as courseId to print it correctly or use it if publisher uses it
        // Publisher uses metadata mainly, but we pass finalName as 1st arg just in case
        const result = await CoursePublisher.publish(finalName, newVersion, tempFile, metadata, JSON.parse(guardSnapshot));

        if (result.success) {
          logger.success(`Successfully published ${finalName}@${newVersion}!`);
        } else {
          logger.error(result.message || "Unknown error during publish");
        }

      } catch (e: any) {
        logger.error("Publish failed", e.message);
      } finally {
        // Cleanup
        if (existsSync(tempFile)) {
          await rm(tempFile);
        }
      }
    });
}
