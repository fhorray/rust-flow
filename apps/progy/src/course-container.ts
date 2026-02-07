
import AdmZip from "adm-zip";
import { stat, mkdir, rm, cp, readdir, readFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { createHash } from "node:crypto";
import { homedir } from "node:os";

const PROGY_HOME = join(homedir(), ".progy");
const RUNTIME_ROOT = join(PROGY_HOME, "runtime");

export class CourseContainer {
  /**
   * Packs a directory into a .progy archive
   */
  static async pack(sourceDir: string, destFile: string) {
    const zip = new AdmZip();
    zip.addLocalFolder(sourceDir);
    await zip.writeZipPromise(destFile);
  }

  /**
   * Unpacks a .progy archive to a unique runtime directory based on its hash/path
   * Returns the path to the runtime directory
   */
  static async unpack(sourceFile: string): Promise<string> {
    // Generate unique ID based on file path and specific stats to avoid collisions
    // We mix filename + mtime so if user updates file outside, we get new runtime
    // OR we always overwrite. Overwriting is safer for consistency.
    const fileStats = await stat(sourceFile);
    const uniqueKey = `${sourceFile}-${fileStats.mtimeMs}`;
    const hash = createHash("md5").update(uniqueKey).digest("hex").substring(0, 8);

    // Clean filename for directory name
    const courseId = basename(sourceFile, ".progy").replace(/[^a-zA-Z0-9-]/g, "_");

    // Runtime path: ~/.progy/runtime/[courseId]-[hash]
    const runtimeDir = join(RUNTIME_ROOT, `${courseId}-${hash}`);

    // Prepare directory
    if (await exists(runtimeDir)) {
      await rm(runtimeDir, { recursive: true, force: true });
    }
    await mkdir(runtimeDir, { recursive: true });

    const zip = new AdmZip(sourceFile);

    // Extract everything
    await new Promise<void>((resolve, reject) => {
      // 3rd arg is keepOriginalPermission (boolean)
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
    // Re-pack everything from runtime
    // TODO: Consider filtering heavy folders like node_modules if needed
    zip.addLocalFolder(runtimeDir);
    await zip.writeZipPromise(destFile);
  }
}

// Helper for exists since fs.exists is deprecated/callback-based in some versions of node types,
// but node:fs/promises has access via stat check usually or access.
// Let's perform a simple check
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
