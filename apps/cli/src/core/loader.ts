import { z } from "zod";
import { cp, mkdir, readFile, rm, stat, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { CONFIG_DIR, COURSE_CONFIG_NAME, BACKEND_URL as DEFAULT_BACKEND_URL } from "./paths";

const getBackendUrl = () => process.env.PROGY_API_URL || DEFAULT_BACKEND_URL;

const CourseConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  runner: z.object({
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
});

export type CourseConfig = z.infer<typeof CourseConfigSchema>;

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export class CourseLoader {
  static async resolveSource(courseInput: string): Promise<{ url: string; branch?: string; path?: string }> {
    if (courseInput.startsWith("http://") || courseInput.startsWith("https://") || courseInput.startsWith("git@")) {
      const parts = courseInput.split("#");
      const url = parts[0] as string;
      const branch = parts[1];
      return { url, branch };
    }

    const resolvedLocal = resolve(courseInput);
    if (await exists(resolvedLocal)) {
      return { url: resolvedLocal };
    }

    console.log(`[INFO] Resolving alias '${courseInput}'...`);
    try {
      const url = `${getBackendUrl()}/registry`;
      const response = await fetch(url);
      if (response.ok) {
        const data: any = await response.json();
        const course = data.courses[courseInput];
        if (course) {
          return { url: course.repo, branch: course.branch, path: course.path };
        }
      }
    } catch (e) {
      // Registry failed, fallback to default organization
    }

    // Default to progy-dev organization for official courses
    return { url: `https://github.com/progy-dev/${courseInput}.git` };
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

    const setupGuide = join(path, result.data.setup.guide);
    if (!(await exists(setupGuide))) {
      throw new Error(`Setup guide '${result.data.setup.guide}' not found.`);
    }

    // --- Content Naming Validation ---
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
      }
    }

    return result.data;
  }
}

function spawnPromise(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
