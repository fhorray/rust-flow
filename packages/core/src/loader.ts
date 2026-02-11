import { z } from "zod";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { CONFIG_DIR, COURSE_CONFIG_NAME, BACKEND_URL as DEFAULT_BACKEND_URL } from "./paths.ts";
import { exists } from "./utils.ts";

const getBackendUrl = () => process.env.PROGY_API_URL || DEFAULT_BACKEND_URL;

const CourseConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().optional().default("1.0.0"), // Add versioning
  runner: z.object({
    type: z.string().optional().default("process"),
    command: z.string(),
    args: z.array(z.string()),
    cwd: z.string(),
  }),
  content: z.object({
    root: z.string(),
    exercises: z.string(),
  }),
  setup: z.object({
    checks: z.array(z.object({
      name: z.string(),
      type: z.string(),
      command: z.string(),
    })),
    guide: z.string(),
  }),
  branding: z.object({
    coverImage: z.string().optional(),
    primaryColor: z.string().optional(),
    layout: z.string().optional().default("grid"),
  }).optional(),
  progression: z.object({
    mode: z.string().optional().default("open"),
  }).optional(),
});

export type LoaderCourseConfig = z.infer<typeof CourseConfigSchema>;

export class CourseLoader {
  static async resolveSource(courseInput: string): Promise<{ url: string; branch?: string; path?: string; isRegistry?: boolean }> {
    // 1. Direct URLs
    if (courseInput.startsWith("http://") || courseInput.startsWith("https://") || courseInput.startsWith("git@")) {
      const parts = courseInput.split("#");
      const url = parts[0] as string;
      const branch = parts[1];
      return { url, branch };
    }

    // 2. Local Paths
    const resolvedLocal = resolve(courseInput);
    if (await exists(resolvedLocal)) {
      return { url: resolvedLocal };
    }

    // 3. Registry Packages (@scope/slug or simple slug)
    if (courseInput.startsWith("@") || !courseInput.includes("/")) {
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
            url: data.downloadUrl || `${getBackendUrl()}/registry/download/${data.scope}/${data.slug}/${data.latest}`,
            isRegistry: true
          };
        }
      } catch (e) {
        console.warn(`[WARN] Registry resolution failed for ${query}:`, (e as Error).message);
      }
    }

    // 4. Legacy/Alias Fallback (keeping for compatibility)
    console.log(`[INFO] Resolving alias '${courseInput}'...`);
    try {
      const url = `${getBackendUrl()}/registry`;
      const response = await fetch(url);
      if (response.ok) {
        const data: any = await response.json();
        const course = data.courses?.[courseInput];
        if (course) {
          return { url: course.repo, branch: course.branch, path: course.path };
        }
      }
    } catch (e) {
      // Legacy alias lookup failed
    }

    // 5. Default Organization Fallback
    return { url: `https://github.com/progy-dev/${courseInput}.git` };
  }

  static async validateCourse(path: string): Promise<LoaderCourseConfig> {
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

    const setupGuide = join(path, result.data.setup.guide);
    if (!(await exists(setupGuide))) {
      throw new Error(`Setup guide '${result.data.setup.guide}' not found.`);
    }

    // --- Strict Requirement: Runner & Docker ---
    const runnerDir = join(path, "runner");
    if (!(await exists(runnerDir))) {
      throw new Error("Missing required 'runner/' directory at course root.");
    }

    const isProcessRunner = result.data.runner?.type === "process";
    if (!isProcessRunner) {
      const hasDocker = (await exists(join(path, "Dockerfile"))) || (await exists(join(path, "docker-compose.yml")));
      if (!hasDocker) {
        throw new Error("Missing required Docker configuration. Course must have either a 'Dockerfile' or 'docker-compose.yml' at the root for non-process runners.");
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

      if (await exists(moduleInfoPath)) {
        const content = await readFile(moduleInfoPath, "utf-8");
        const titleMatch = content.match(/title\s*=\s*"([^"]+)"/);
        if (titleMatch) moduleTitle = titleMatch[1]!;
      }

      const exercises: any[] = [];
      const exEntries = await readdir(modulePath, { withFileTypes: true });
      const sortedExEntries = exEntries
        .filter(e => e.isDirectory() && /^\d{2}_/.test(e.name))
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const exEntry of sortedExEntries) {
        exercises.push({
          id: exEntry.name,
          name: exEntry.name.replace(/^\d{2}_/, ""),
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
