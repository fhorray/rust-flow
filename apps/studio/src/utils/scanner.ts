import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { logger } from "@progy/core";

export async function generateGuardSnapshot(dir: string): Promise<string> {
  const snapshot: Record<string, string> = {};
  const MAX_FILE_SIZE = 50 * 1024; // 50KB limit per file
  const MAX_TOTAL_SIZE = 500 * 1024; // 500KB total snapshot limit (safe for steps)

  const binaryExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.mp4', '.mov', '.avi', '.mp3', '.wav',
    '.zip', '.gz', '.tar', '.pdf', '.bin', '.exe', '.dll', '.so', '.wasm',
    '.sqlite', '.db'
  ]);

  const excludedFolders = ['node_modules', '.git', '.progy', 'dist', 'build', 'target', 'assets', 'public', 'images'];

  let totalSize = 0;

  async function scan(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (excludedFolders.includes(entry.name)) continue;
        await scan(fullPath);
      } else if (entry.isFile()) {
        if (binaryExtensions.has(entry.name.substring(entry.name.lastIndexOf('.')).toLowerCase())) continue;

        try {
          const file = Bun.file(fullPath);
          if (file.size > MAX_FILE_SIZE) continue;

          // Check for binary content (null bytes)
          const arrayBuffer = await file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          if (buffer.includes(0)) continue;

          const content = await file.text();
          const relPath = relative(dir, fullPath).replace(/\\/g, '/');

          if (totalSize + content.length > MAX_TOTAL_SIZE) {
            // Stop if we hit the limit, ensuring we don't break the workflow
            break;
          }

          snapshot[relPath] = content;
          totalSize += content.length;
        } catch (e) {
          // Ignore unreadable files
        }
      }
    }
  }

  logger.info("🔍 Generating validation snapshot...");
  await scan(dir);
  logger.info(`Snapshot generated: ${Object.keys(snapshot).length} files (${Math.round(totalSize / 1024)}KB)`);

  return JSON.stringify(snapshot);
}
