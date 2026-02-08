import { z } from "zod";
import { cp, exists, mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { homedir } from "node:os";

const CONFIG_NAME = "course.json";
const getBackendUrl = () => process.env.PROGY_API_URL || "https://api.progy.dev";

// Zod Mini schema for validation
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

export class CourseLoader {
  static async resolveSource(courseInput: string): Promise<{ url: string; branch?: string; path?: string }> {
    // 1. Direct URL (possibly with #branch)
    if (courseInput.startsWith("http://") || courseInput.startsWith("https://") || courseInput.startsWith("git@")) {
      const parts = courseInput.split("#");
      const url = parts[0] as string;
      const branch = parts[1];
      return { url, branch };
    }

    if (await exists(courseInput)) {
      return { url: resolve(courseInput) };
    }

    // 2. Official Alias Lookup
    console.log(`[INFO] Resolving alias '${courseInput}'...`);
    try {
      const url = `${getBackendUrl()}/api/registry`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch registry (Status: ${response.status})`);
      }
      const data: any = await response.json();
      const course = data.courses[courseInput];
      if (course) {
        return { url: course.repo, branch: course.branch, path: course.path };
      }
    } catch (e: any) {
      console.warn(`[WARN] Registry lookup failed: ${e.message || e}`);
    }

    throw new Error(`Could not resolve course source for '${courseInput}'`);
  }

  static async validateCourse(path: string): Promise<CourseConfig> {
    const configPath = join(path, CONFIG_NAME);
    // Remove strict check for content folder here, rely on schema content.root validation later

    if (!(await exists(configPath))) {
      throw new Error(`Missing ${CONFIG_NAME} in course directory.`);
    }

    const configStr = await readFile(configPath, "utf-8");
    let configJson;
    try {
      configJson = JSON.parse(configStr);
    } catch (e) {
      throw new Error(`Invalid JSON in ${CONFIG_NAME}`);
    }

    // Security: Block any pre-existing 'repo' field in the source manifest
    // This field must only be injected by the local CLI during 'init'
    if ("repo" in configJson) {
      throw new Error(`Security Error: Pre-configured 'repo' field in ${CONFIG_NAME} is forbidden. Source is potentially untrusted.`);
    }

    const result = CourseConfigSchema.safeParse(configJson);
    if (!result.success) {
      const issues = result.error.issues.map((e: any) => `- ${e.path.join('.')}: ${e.message}`).join("\n");
      throw new Error(`Invalid course configuration in ${CONFIG_NAME}:\n${issues}`);
    }

    // Content Integrity Check
    const contentRoot = join(path, result.data.content.root);
    if (!(await exists(contentRoot))) {
      throw new Error(`Content root '${result.data.content.root}' not found.`);
    }

    const exercisesDir = join(path, result.data.content.exercises);
    if (!(await exists(exercisesDir))) {
      throw new Error(`Exercises directory '${result.data.content.exercises}' not found.`);
    }

    // Validate Setup Guide
    const setupGuide = join(path, result.data.setup.guide);
    if (!(await exists(setupGuide))) {
      throw new Error(`Setup guide '${result.data.setup.guide}' not found.`);
    }

    return result.data;
  }

  static async load(courseInput: string, dest: string): Promise<{ url: string; branch?: string; path?: string }> {
    const source = await this.resolveSource(courseInput);
    const { url, branch, path } = source;
    console.log(`[INFO] Loading course from: ${url} (branch: ${branch || "default"}, path: ${path || "root"})`);

    // If local path, just copy and validate
    if (await exists(url) && !url.endsWith(".git")) {
      await this.validateCourse(url);
      await cp(url, dest, { recursive: true });
      return source;
    }

    // Git Remote
    const tempDir = join(homedir(), ".progy", "tmp", `course-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    try {
      console.log(`[GIT] Initializing repository...`);
      // Initialize git
      await spawnPromise("git", ["init"], tempDir);
      await spawnPromise("git", ["remote", "add", "origin", url], tempDir);

      if (path) {
        console.log(`[GIT] Configuring sparse-checkout for path: ${path}...`);
        await spawnPromise("git", ["config", "core.sparseCheckout", "true"], tempDir);
        await spawnPromise("git", ["sparse-checkout", "set", path], tempDir);
      }

      console.log(`[GIT] Pulling content...`);
      const pullArgs = ["pull", "--depth=1", "origin", branch || "main"];
      await spawnPromise("git", pullArgs, tempDir);

      const sourceDir = path ? join(tempDir, path) : tempDir;

      console.log(`[VAL] Validating course...`);
      await this.validateCourse(sourceDir);

      console.log(`[INST] Installing course...`);
      // Copy contents to destination
      await cp(sourceDir, dest, { recursive: true });
      return source;
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
import { resolve } from "node:path";

function spawnPromise(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
