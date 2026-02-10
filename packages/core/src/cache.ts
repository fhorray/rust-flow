import { join } from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { COURSE_CACHE_DIR } from "./paths.ts";
import { exists } from "./utils.ts";
import { logger } from "./logger.ts";
import { CourseContainer } from "./container.ts";

export class RegistryCache {
  /**
   * Ensures a registry package is downloaded and returns the path to the unpacked directory
   */
  static async ensurePackage(name: string, version: string, downloadUrl: string): Promise<string> {
    const pkgCacheDir = join(COURSE_CACHE_DIR, "registry", name, version);
    const artifactPath = join(pkgCacheDir, "course.progy");
    const unpackDir = join(pkgCacheDir, "unpacked");

    if (await exists(unpackDir)) {
      return unpackDir;
    }

    await mkdir(pkgCacheDir, { recursive: true });

    logger.info(`Downloading ${name}@${version} from registry...`, "REGISTRY");
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to download package: ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();
    await writeFile(artifactPath, Buffer.from(buffer));

    logger.info(`Unpacking ${name}@${version}...`, "REGISTRY");
    await CourseContainer.unpackTo(artifactPath, unpackDir);

    return unpackDir;
  }
}
