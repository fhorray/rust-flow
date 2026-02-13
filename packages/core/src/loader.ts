import { z } from "zod";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { CONFIG_DIR, COURSE_CONFIG_NAME, BACKEND_URL as DEFAULT_BACKEND_URL } from "./paths.ts";
import { exists } from "./utils.ts";
import { CourseConfigSchema, ModuleInfoSchema, QuizSchema, type CourseConfig, } from "./types.ts";

const getBackendUrl = () => process.env.PROGY_API_URL || DEFAULT_BACKEND_URL;




export class CourseLoader {
  static async resolveSource(courseInput: string): Promise<{ url: string; branch?: string; path?: string; isRegistry?: boolean; id?: string; scope?: string; name?: string }> {
    // 1. Local Paths
    const resolvedLocal = resolve(courseInput);
    if (await exists(resolvedLocal)) {
      return { url: resolvedLocal };
    }

    // 2. Registry Packages (@scope/slug or simple slug)
    // We implicitly treat anything else as a registry package request.
    let query = courseInput;

    // If no scope is provided, default to official username
    if (!courseInput.startsWith("@") && !courseInput.includes("/")) {
      const { OFICIAL_USERNAME } = await import("./paths.ts");
      query = `${OFICIAL_USERNAME}/${courseInput}`;
      console.log(`[INFO] Resolving official course '${courseInput}' as '${query}'...`);
    } else {
      console.log(`[INFO] Resolving registry package '${courseInput}'...`);
    }

    try {
      const url = `${getBackendUrl()}/registry/resolve/${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data: any = await response.json();
        // Registry packages point to download endpoint
        return {
          id: query,
          scope: data.scope,
          name: data.name,
          url: data.downloadUrl || `${getBackendUrl()}/registry/download/${data.scope}/${data.slug}/${data.latest}`,
          isRegistry: true
        };
      } else {
        throw new Error(`Registry resolution failed: ${response.status} ${response.statusText}`);
      }
    } catch (e) {
      console.warn(`[WARN] Registry resolution failed for ${query}:`, (e as Error).message);
      throw new Error(`Could not resolve course '${courseInput}'. Git URLs are no longer supported. Please use a valid registry package (e.g. @scope/course).`);
    }
  }

  static async validateCourse(path: string): Promise<CourseConfig> {
    const configPath = join(path, COURSE_CONFIG_NAME);

    if (!(await exists(configPath))) {
      throw new Error(`Missing ${COURSE_CONFIG_NAME} in course directory.`);
    }

    const configStr = await readFile(configPath, "utf-8");
    let configJson;
    try {
      configJson = JSON.parse(configStr);
    } catch (e) {
      throw new Error(`Invalid JSON in ${COURSE_CONFIG_NAME}`);
    }

    if ("repo" in configJson) {
      throw new Error(`Security Error: Pre-configured 'repo' field in ${COURSE_CONFIG_NAME} is forbidden.`);
    }

    const result = CourseConfigSchema.safeParse(configJson);
    if (!result.success) {
      const issues = result.error.issues.map((e: any) => `- ${e.path.join('.')}: ${e.message}`).join("\n");
      throw new Error(`Invalid course configuration in ${COURSE_CONFIG_NAME}:\n${issues}`);
    }

    const contentRoot = join(path, result.data.content.root);
    if (!(await exists(contentRoot))) {
      throw new Error(`Content root '${result.data.content.root}' not found.`);
    }

    const exercisesDir = join(path, result.data.content.exercises);
    if (!(await exists(exercisesDir))) {
      throw new Error(`Exercises directory '${result.data.content.exercises}' not found.`);
    }

    if (result.data.content.exercises !== "content") {
      throw new Error(`Invalid structure: Exercises directory must be named 'content' (got '${result.data.content.exercises}').`);
    }

    const setupGuide = result.data.setup?.guide ? join(path, result.data.setup.guide) : undefined;
    if (setupGuide && !(await exists(setupGuide))) {
      throw new Error(`Setup guide '${result.data.setup?.guide}' not found.`);
    }

    // --- Strict Requirement: Runner & Docker ---
    const runnerDir = join(path, "runner");
    if (!(await exists(runnerDir))) {
      throw new Error("Missing required 'runner/' directory at course root.");
    }

    for (const runner of result.data.runners) {
      const runnerType = runner.type || "process";
      const runnerName = runner.name || runner.id || "Default Runner";

      if (runnerType === "docker-file") {
        const hasDockerfile = await exists(join(path, runner.dockerfile || "Dockerfile"));
        if (!hasDockerfile) {
          throw new Error(`[${runnerName}] Missing required '${runner.dockerfile || "Dockerfile"}' at the root for 'docker-file' runner.`);
        }
      } else if (runnerType === "docker-compose") {
        const hasCompose = await exists(join(path, runner.compose_file || "docker-compose.yml"));
        if (!hasCompose) {
          throw new Error(`[${runnerName}] Missing required '${runner.compose_file || "docker-compose.yml"}' at the root for 'docker-compose' runner.`);
        }
      } else if (runnerType === "process") {
        // Process runner validation: requires runner directory and main/index/runner script
        const runnerFiles = await readdir(runnerDir);
        const validEntryPoints = ["main", "index", "runner"];
        const hasEntryPoint = runnerFiles.some(file => {
          const name = file.split(".")[0];
          return validEntryPoints.includes(name || "");
        });

        if (!hasEntryPoint) {
          throw new Error(`[${runnerName}] Missing required entry point (main.*, index.*, or runner.*) in 'runner/' directory for 'process' runner.`);
        }
      }
    }

    // --- Content Naming & Completeness Validation ---
    const readdirWithTypes = async (dir: string) => {
      const entries = await readdir(dir, { withFileTypes: true });
      return entries.filter(e => e.isDirectory()).map(e => e.name);
    };

    const modules = await readdirWithTypes(exercisesDir);
    for (const moduleName of modules) {
      if (!/^\d{2}_/.test(moduleName)) {
        throw new Error(`Invalid module name: "${moduleName}" at ${exercisesDir}. Modules must start with two digits followed by an underscore (e.g., 01_intro).`);
      }

      const modulePath = join(exercisesDir, moduleName);
      const exercises = await readdirWithTypes(modulePath);
      for (const exerciseName of exercises) {
        if (!/^\d{2}_/.test(exerciseName)) {
          throw new Error(`Invalid exercise name: "${exerciseName}" at ${modulePath}. Exercises must start with two digits followed by an underscore (e.g., 01_hello).`);
        }

        const exercisePath = join(modulePath, exerciseName);
        const readmePath = join(exercisePath, "README.md");
        if (!(await exists(readmePath))) {
          throw new Error(`Missing README.md in exercise: ${moduleName}/${exerciseName}`);
        }

        // Check for exercise.* file
        const exFiles = await readdir(exercisePath);
        const hasExerciseFile = exFiles.some(f => f.startsWith("exercise.") || f.startsWith("main."));
        if (!hasExerciseFile) {
          throw new Error(`Missing entry point file (exercise.* or main.*) in: ${moduleName}/${exerciseName}`);
        }

        // Validate quiz.json if present
        const quizPath = join(exercisePath, "quiz.json");
        if (await exists(quizPath)) {
          try {
            const quizContent = await readFile(quizPath, "utf-8");
            const quizJson = JSON.parse(quizContent);
            const quizResult = QuizSchema.safeParse(quizJson);
            if (!quizResult.success) {
              const issues = quizResult.error.issues.map((e: any) => `- ${e.path.join('.')}: ${e.message}`).join("\n");
              throw new Error(`Invalid quiz.json in ${moduleName}/${exerciseName}:\n${issues}`);
            }
          } catch (e: any) {
            throw new Error(`Failed to validate quiz.json in ${moduleName}/${exerciseName}: ${e.message}`);
          }
        }
      }

      // Validate info.toml if present
      const infoPath = join(modulePath, "info.toml");
      if (await exists(infoPath)) {
        try {
          const infoContent = await readFile(infoPath, "utf-8");
          // Handle potential issues with raw numeric keys in TOML
          const fixedContent = infoContent.replace(/^(\s*)(\d+[\w-]*)\s*=/gm, '$1"$2" =');
          const parsed = Bun.TOML.parse(fixedContent);
          const infoResult = ModuleInfoSchema.safeParse(parsed);
          if (!infoResult.success) {
            const issues = infoResult.error.issues.map((e: any) => `- ${e.path.join('.')}: ${e.message}`).join("\n");
            throw new Error(`Invalid info.toml in ${moduleName}:\n${issues}`);
          }
        } catch (e: any) {
          throw new Error(`Failed to validate info.toml in ${moduleName}: ${e.message}`);
        }
      }
    }

    return result.data;
  }

  static async getCourseFlow(path: string) {
    const config = await this.validateCourse(path);
    const exercisesDir = join(path, config.content.exercises);

    const modules: any[] = [];
    const entries = await readdir(exercisesDir, { withFileTypes: true });

    // Sort modules by prefix
    const sortedEntries = entries
      .filter(e => e.isDirectory() && /^\d{2}_/.test(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of sortedEntries) {
      const modulePath = join(exercisesDir, entry.name);
      const moduleInfoPath = join(modulePath, "info.toml");
      let moduleTitle = entry.name.replace(/^\d{2}_/, "");
      let exMetadata: Record<string, any> = {};

      if (await exists(moduleInfoPath)) {
        try {
          const content = await readFile(moduleInfoPath, "utf-8");
          const fixedContent = content.replace(/^(\s*)(\d+[\w-]*)\s*=/gm, '$1"$2" =');
          const parsed = Bun.TOML.parse(fixedContent) as any;

          if (parsed.module?.title) moduleTitle = parsed.module.title;

          if (parsed.exercises && typeof parsed.exercises === 'object') {
            for (const [name, meta] of Object.entries(parsed.exercises)) {
              exMetadata[name] = typeof meta === 'string' ? { title: meta } : meta;
            }
          }
        } catch (e) {
          console.warn(`[WARN] Failed to parse info.toml in ${modulePath}: ${e}`);
        }
      }

      const exercises: any[] = [];
      const exEntries = await readdir(modulePath, { withFileTypes: true });
      const sortedExEntries = exEntries
        .filter(e => e.isDirectory() && /^\d{2}_/.test(e.name))
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const exEntry of sortedExEntries) {
        const meta = exMetadata[exEntry.name] || {};
        exercises.push({
          id: exEntry.name,
          name: exEntry.name.replace(/^\d{2}_/, ""),
          title: meta.title || exEntry.name.replace(/^\d{2}_/, ""),
          tags: meta.tags,
          difficulty: meta.difficulty,
          xp: meta.xp,
          path: join(config.content.exercises, entry.name, exEntry.name)
        });
      }

      modules.push({
        id: entry.name,
        title: moduleTitle,
        exercises
      });
    }

    return modules;
  }
}

export function spawnPromise(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
