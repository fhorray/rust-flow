import AdmZip from "adm-zip";
import { stat, mkdir, rm } from "node:fs/promises";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
import { CONFIG_DIR } from "./paths";

const RUNTIME_ROOT = join(CONFIG_DIR, "runtime");

const IGNORED_PATTERNS = [
  "target",
  "node_modules",
  ".git",
  ".DS_Store",
  ".next",
  "dist"
];

const zipFilter = (path: string) => {
  const parts = path.split(/[/\\]/);
  return !parts.some(part => IGNORED_PATTERNS.includes(part));
};

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export class CourseContainer {
  /**
   * Packs a directory into a .progy archive
   */
  static async pack(sourceDir: string, destFile: string) {
    const zip = new AdmZip();
    zip.addLocalFolder(sourceDir, "", zipFilter);
    await zip.writeZipPromise(destFile);
  }

  /**
   * Unpacks a .progy archive to a unique runtime directory based on its hash/path
   * Returns the path to the runtime directory
   */
  static async unpack(sourceFile: string): Promise<string> {
    const fileStats = await stat(sourceFile);
    const uniqueKey = `${sourceFile}-${fileStats.mtimeMs}`;
    const hash = createHash("md5").update(uniqueKey).digest("hex").substring(0, 8);

    const courseId = basename(sourceFile, ".progy").replace(/[^a-zA-Z0-9-]/g, "_");
    const runtimeDir = join(RUNTIME_ROOT, `${courseId}-${hash}`);

    if (await exists(runtimeDir)) {
      await rm(runtimeDir, { recursive: true, force: true });
    }
    await mkdir(runtimeDir, { recursive: true });

    const zip = new AdmZip(sourceFile);

    await new Promise<void>((resolve, reject) => {
      zip.extractAllToAsync(runtimeDir, true, false, (err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return runtimeDir;
  }

  /**
   * Syncs changes from runtime directory back to the .progy archive
   */
  static async sync(runtimeDir: string, destFile: string) {
    const zip = new AdmZip();
    zip.addLocalFolder(runtimeDir, "", zipFilter);
    await zip.writeZipPromise(destFile);
  }
}
