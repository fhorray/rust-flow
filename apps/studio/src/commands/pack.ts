
import { Command } from "commander";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { logger, CourseContainer, SyncManager, CourseLoader } from "@progy/core";
import { prepareOptimizedTempDir } from "../utils/optimize";

export function pack(program: Command) {
  program
    .command("pack")
    .description("Pack the current course into a .progy archive")
    .argument("[dir]", "Course directory (default: current directory)")
    .option("-o, --output <path>", "Output file path")
    .action(async (dir, options) => {
      const cwd = resolve(dir || process.cwd());

      const hasProgyToml = existsSync(join(cwd, "progy.toml"));
      const hasCourseJson = existsSync(join(cwd, "course.json"));

      if (!existsSync(join(cwd, "progy.toml")) && !existsSync(join(cwd, "course.json"))) {
        logger.error("Not a valid Progy course directory (missing progy.toml or course.json)");
        process.exit(1);
      }

      // Validate Course Schema
      try {
        await CourseLoader.validateCourse(cwd);
      } catch (e: any) {
        logger.error(e.message);
        process.exit(1);
      }

      try {
        logger.info(`📦 Packing course from ${cwd}...`);

        // Load config to get course ID for default filename
        let courseId = "course";

        if (hasProgyToml) {
          const config = await SyncManager.loadConfig(cwd);
          if (config?.course?.id) courseId = config.course.id;
        } else if (hasCourseJson) {
          try {
            const courseJsonRef = Bun.file(join(cwd, "course.json"));
            const courseJson = await courseJsonRef.json();
            if (courseJson.id) courseId = courseJson.id;
          } catch (e) { }
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        // Instructor mode: if course.json exists, we might want to include version in filename?
        // For now default name is just id.progy

        const defaultName = `${courseId}.progy`;
        const outputPath = resolve(options.output || defaultName);

        const optimizedDir = await prepareOptimizedTempDir(cwd);
        await CourseContainer.pack(optimizedDir, outputPath);
        await rm(optimizedDir, { recursive: true, force: true });

        logger.success(`Course packed successfully to: ${outputPath}`);
      } catch (e: any) {
        logger.error("Failed to pack course", e.message);
        process.exit(1);
      }
    });
}
