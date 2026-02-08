
import { join, dirname, sep } from "node:path";
import { homedir } from "node:os";
import { mkdir, writeFile, readFile, copyFile, readdir, stat, rm } from "node:fs/promises";
import { GitUtils } from "./git-utils";

export interface ProgyConfig {
  course: {
    id: string;
    repo: string;
    branch?: string;
  };
  sync?: {
    last_sync?: string;
  };
}

export class SyncManager {
  static getCacheDir(courseId: string) {
    return join(homedir(), ".progy", "courses", courseId);
  }

  static async ensureOfficialCourse(courseId: string, repoUrl: string, branch = "main"): Promise<string> {
    const cacheDir = this.getCacheDir(courseId);

    const gitDir = join(cacheDir, ".git");
    const hasGit = await this.exists(gitDir);

    if (hasGit) {
      console.log(`[SYNC] Updating official course cache: ${courseId}...`);
      // Use fetch + reset --hard to force exact sync with upstream
      await GitUtils.exec(["fetch", "origin"], cacheDir);
      await GitUtils.exec(["reset", "--hard", `origin/${branch}`], cacheDir);
    } else {
      console.log(`[SYNC] Cloning official course cache: ${courseId}...`);
      await rm(cacheDir, { recursive: true, force: true });
      await mkdir(cacheDir, { recursive: true });
      // public clone
      await GitUtils.clone(repoUrl, cacheDir, "", branch);
    }
    return cacheDir;
  }

  static async loadConfig(cwd: string): Promise<ProgyConfig | null> {
    const configPath = join(cwd, "progy.toml");
    if (!(await this.exists(configPath))) return null;

    try {
      const content = await readFile(configPath, "utf-8");
      const config: any = { course: {}, sync: {} };
      let section = "";

      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          section = trimmed.slice(1, -1);
          continue;
        }
        if (!trimmed || trimmed.startsWith("#")) continue;

        const [key, ...valParts] = trimmed.split("=");
        if (!key || valParts.length === 0) continue;

        const val = valParts.join("=").trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

        if (section === "course") config.course[key.trim()] = val;
        if (section === "sync") config.sync[key.trim()] = val;
      }

      return config as ProgyConfig;
    } catch {
      return null;
    }
  }

  static async saveConfig(cwd: string, config: ProgyConfig) {
    const content = `[course]
id = "${config.course.id}"
repo = "${config.course.repo}"
branch = "${config.course.branch || 'main'}"

[sync]
last_sync = "${new Date().toISOString()}"
`;
    await writeFile(join(cwd, "progy.toml"), content);
  }

  static async generateGitIgnore(cwd: string, courseId: string) {
    const extensions: Record<string, string[]> = {
      rust: [".rs", ".toml"],
      go: [".go", ".mod", ".sum"],
      typescript: [".ts", ".json", ".tsx"],
      javascript: [".js", ".json", ".jsx"],
      python: [".py", ".txt"],
      lua: [".lua"],
      c: [".c", ".h", "Makefile"],
      cpp: [".cpp", ".h", ".hpp", "Makefile"],
      java: [".java"],
      ruby: [".rb"],
      zig: [".zig", ".zon"],
    };

    let extList: string[] = [];
    const lowerId = courseId.toLowerCase();

    // Try exact match first
    if (extensions[lowerId]) {
        extList = extensions[lowerId];
    } else {
        // Try prefix match (e.g. rust-advanced -> rust)
        for (const [key, val] of Object.entries(extensions)) {
            if (lowerId.startsWith(key)) {
                extList = val;
                break;
            }
        }
    }

    // Fallback: If no match, warn and allow common source files?
    // Or strictly allow nothing? Strict is safer per requirements.
    if (extList.length === 0) {
        console.warn(`[WARN] Unknown language for course '${courseId}'. gitignore might be too strict.`);
        console.warn(`       Please manually edit .gitignore to whitelist your source files.`);
    }

    // Ignore everything by default
    let content = `*
!.gitignore
!progy.toml
`;

    // Whitelist content directory structure to reach exercises
    // !content/ allows entering the directory
    // !content/**/ allows entering subdirectories
    content += `!content/\n`;
    content += `!content/**/\n`;

    for (const ext of extList) {
      content += `!content/**/*${ext}\n`;
    }

    await writeFile(join(cwd, ".gitignore"), content);
  }

  static async applyLayering(cwd: string, cacheDir: string, force = false) {
    await this.copyRecursive(cacheDir, cwd, force);
  }

  private static async copyRecursive(src: string, dest: string, force: boolean) {
    const entries = await readdir(src, { withFileTypes: true });
    await mkdir(dest, { recursive: true });

    for (const entry of entries) {
        if (entry.name === ".git") continue;

        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            await this.copyRecursive(srcPath, destPath, force);
        } else {
            // Logic to preserve user exercise files
            const relPath = srcPath.replace(src, "").replace(/\\/g, "/");
            const isContent = relPath.includes("/content/");

            let shouldOverwrite = true;

            if (isContent) {
                // Heuristic: If it looks like source code, treat as exercise file
                const isCode = /\.(rs|go|ts|js|py|lua|c|cpp|h|toml|mod|sum|json)$/.test(entry.name);
                if (isCode && !force) {
                     if (await this.exists(destPath)) {
                         shouldOverwrite = false;
                     }
                }
            }

            if (shouldOverwrite) {
                await copyFile(srcPath, destPath);
            }
        }
    }
  }

  static async resetExercise(cwd: string, cacheDir: string, relativePath: string) {
      const srcPath = join(cacheDir, relativePath);
      const destPath = join(cwd, relativePath);

      if (await this.exists(srcPath)) {
          await mkdir(dirname(destPath), { recursive: true });
          await copyFile(srcPath, destPath);
          console.log(`[RESET] Restored ${relativePath}`);
      } else {
          throw new Error(`File ${relativePath} not found in official course.`);
      }
  }

  private static async exists(path: string) {
      try {
          await stat(path);
          return true;
      } catch {
          return false;
      }
  }
}
