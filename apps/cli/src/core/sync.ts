import { join, dirname } from "node:path";
import { mkdir, writeFile, readFile, copyFile, readdir, stat, rm } from "node:fs/promises";
import { GitUtils } from "./git";
import { getCourseCachePath } from "./paths";

export interface ProgyConfig {
  course: {
    id: string;
    repo: string;
    branch?: string;
    path?: string;
  };
  sync?: {
    last_sync?: string;
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export class SyncManager {
  static async ensureOfficialCourse(courseId: string, repoUrl: string, branch = "main", path?: string): Promise<string> {
    const cacheDir = getCourseCachePath(courseId);
    const gitDir = join(cacheDir, ".git");

    if (await exists(gitDir)) {
      console.log(`[SYNC] Updating official course cache: ${courseId}...`);
      await GitUtils.exec(["fetch", "origin"], cacheDir);
      await GitUtils.exec(["reset", "--hard", `origin/${branch}`], cacheDir);
    } else {
      console.log(`[SYNC] Cloning official course cache: ${courseId}...`);
      await rm(cacheDir, { recursive: true, force: true });
      await mkdir(cacheDir, { recursive: true });

      if (path) {
        await GitUtils.exec(["init"], cacheDir);
        await GitUtils.addRemote(cacheDir, "", repoUrl);
        await GitUtils.sparseCheckout(cacheDir, [path]);
        await GitUtils.exec(["pull", "--depth=1", "origin", branch], cacheDir);
      } else {
        await GitUtils.clone(repoUrl, cacheDir, "", branch);
      }
    }
    return cacheDir;
  }

  static async loadConfig(cwd: string): Promise<ProgyConfig | null> {
    const configPath = join(cwd, "progy.toml");
    if (!(await exists(configPath))) return null;

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
path = "${config.course.path || ''}"

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

    if (extensions[lowerId]) {
      extList = extensions[lowerId];
    } else {
      for (const [key, val] of Object.entries(extensions)) {
        if (lowerId.startsWith(key)) {
          extList = val;
          break;
        }
      }
    }

    let content = `*
!.gitignore
!progy.toml
!content/
!content/**/
`;
    for (const ext of extList) {
      content += `!content/**/*${ext}\n`;
    }
    content += `!progy-notes/\n!progy-notes/**\n`;

    await writeFile(join(cwd, ".gitignore"), content);
  }

  static async applyLayering(cwd: string, cacheDir: string, force = false, sourcePath?: string) {
    const src = sourcePath ? join(cacheDir, sourcePath) : cacheDir;
    await this.copyRecursive(src, cwd, force);
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
        const relPath = srcPath.replace(src, "").replace(/\\/g, "/");
        const isContent = relPath.includes("/content/");

        let shouldOverwrite = true;
        if (isContent) {
          const isCode = /\.(rs|go|ts|js|py|lua|c|cpp|h|toml|mod|sum|json)$/.test(entry.name);
          if (isCode && !force) {
            if (await exists(destPath)) {
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

    if (await exists(srcPath)) {
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
      console.log(`[RESET] Restored ${relativePath}`);
    } else {
      throw new Error(`File ${relativePath} not found in official course.`);
    }
  }
}
