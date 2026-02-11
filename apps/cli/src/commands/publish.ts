import { resolve, relative } from "node:path";
import { readdir, stat } from "node:fs/promises";
import { CourseLoader, CourseContainer, loadToken, BACKEND_URL, logger, exists } from "@progy/core";

import { incrementVersion } from "./version";

async function findUsedAssets(cwd: string): Promise<Set<string>> {
  const used = new Set<string>();
  const contentDir = resolve(cwd, "content");
  if (!(await exists(contentDir))) return used;

  const scanFile = async (path: string) => {
    try {
      const content = await Bun.file(path).text();
      // Improved regex to find assets/* references including subdirectories
      // It matches assets/ followed by alphanumeric, dot, underscore, hyphen or forward slash
      const matches = content.matchAll(/assets\/([a-zA-Z0-9\._\-\/ %]+)/g);
      for (const match of matches) {
        if (match[1]) {
          // Normalize potential backslashes if any (though regex expects /) 
          // and remove trailing dots or typical markdown punctuation that might be caught
          // Also trim() and decodeURIComponent() to handle spaces and encoded characters
          const rawPath = match[1].split(/[\)\x60\>\n]/)[0]?.trim();
          if (rawPath) {
            const assetPath = decodeURIComponent(rawPath.replace(/\\/g, "/"));
            used.add(assetPath);
          }
        }
      }
    } catch (e) {
      // Ignore read errors
    }
  };

  const files = await readdir(contentDir, { recursive: true });
  for (const file of files) {
    const fullPath = resolve(contentDir, file);
    const s = await stat(fullPath);
    if (s.isFile()) {
      await scanFile(fullPath);
    }
  }

  return used;
}

export async function publish(options: any) {
  const cwd = process.cwd();

  // 0. Handle Version Increment
  if (options.patch) await incrementVersion("patch");
  if (options.minor) await incrementVersion("minor");
  if (options.major) await incrementVersion("major");

  // 1. Validate Course
  let config: any;
  try {
    config = await CourseLoader.validateCourse(cwd);
  } catch (e: any) {
    logger.error("Course validation failed", e.message);
    process.exit(1);
  }

  // 2. Ensure Pack
  const progyFile = `${config.id}.progy`;
  const progyPath = resolve(cwd, progyFile);

  logger.info(`Packing course ${config.name} v${config.version}...`, "PACK");
  try {
    await CourseContainer.pack(cwd, progyPath);
  } catch (e: any) {
    logger.error("Packaging failed", e.message);
    process.exit(1);
  }

  // 3. Prepare Upload
  const token = await loadToken();
  if (!token) {
    logger.error("Authentication required.", "Run 'progy login' first.");
    process.exit(1);
  }

  // Fetch session to get username
  let username = "";
  try {
    const sessionRes = await fetch(`${BACKEND_URL}/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const session = await sessionRes.json();
    username = session?.user?.username;
  } catch (e) {
    // Fallback to error if we can't get session
  }

  if (!username) {
    logger.error("User username not found.", "Please ensure you have a username set in your profile.");
    process.exit(1);
  }

  const packageName = config.id.startsWith(`@${username}/`) ? config.id : `@${username}/${config.id}`;

  // 3.5 Prepare Assets and Rename Cover
  logger.info("Scanning for used assets...", "ASSETS");
  const usedAssetNames = await findUsedAssets(cwd);

  const version = (config.version || "1.0.0") as string;
  const versionCode = version.replace(/\./g, ""); // "1.0.0" -> "100"

  let coverAssetPath = (config.branding?.coverImage || "").replace(/\\/g, "/");
  let renamedCoverName = "";

  if (coverAssetPath && coverAssetPath.startsWith("assets/")) {
    const originalName = coverAssetPath.replace("assets/", "");
    const ext = originalName.split(".").pop();
    renamedCoverName = `cover-${versionCode}.${ext}`;
    logger.info(`Renaming cover: ${originalName} -> ${renamedCoverName}`, "ASSETS");

    // Update config/manifest for the registry
    if (config.branding) {
      config.branding.coverImage = `assets/${renamedCoverName}`;
    }
  }

  // 3.6 Extract Manifest for Web Preview
  logger.info("Extracting course manifest for web preview...", "INDEX");
  const manifest = await CourseLoader.getCourseFlow(cwd);

  const file = Bun.file(progyPath);

  const formData = new FormData();
  formData.append('file', file as any);

  // 3.7 Include Individual Assets (Filtered)
  const assetsDir = resolve(cwd, "assets");
  if (await exists(assetsDir)) {
    const assetFiles = await readdir(assetsDir, { recursive: true });
    logger.info(`Found ${assetFiles.length} files in assets. filtering...`, "ASSETS");
    for (const assetFileRaw of assetFiles) {
      const fullPath = resolve(assetsDir, assetFileRaw);
      // Ensure we work with relative path from assets/ dir
      const assetFile = relative(assetsDir, fullPath).replace(/\\/g, "/");

      const s = await stat(fullPath);
      if (s.isFile()) {
        // Case insensitive fallback for cover (since we rename it anyway)
        const isCover = coverAssetPath === `assets/${assetFile}` ||
          (coverAssetPath.toLowerCase() === `assets/${assetFile.toLowerCase()}`);

        const isUsed = usedAssetNames.has(assetFile);

        if (isCover || isUsed) {
          const f = Bun.file(fullPath);
          const uploadName = isCover ? renamedCoverName : assetFile;
          formData.append(`assets/${uploadName}`, f as any);
          logger.info(`  + assets/${uploadName}${isCover ? " (COVER)" : ""}`, "ASSETS");
        }
      }
    }
  }

  // 3.8 Get CLI Version (Engine Version)
  logger.info("Detecting engine version...", "CLI");
  let engineVersion = "0.0.0";
  try {
    // Correctly resolve package.json whether we are in src/ or dist/
    const cliDir = resolve(import.meta.dir).includes("dist")
      ? resolve(import.meta.dir, "..")
      : resolve(import.meta.dir, "..", "..");

    const pkgJsonPath = resolve(cliDir, "package.json");
    if (await exists(pkgJsonPath)) {
      const cliPackageJson = await Bun.file(pkgJsonPath).json();
      engineVersion = cliPackageJson.version || "0.15.0";
    }
  } catch (e) {
    // Silent fallback
  }

  formData.append(
    'metadata',
    JSON.stringify({
      name: packageName,
      version,
      engineVersion,
      description: config.name,
      changelog: "Updated via CLI",
      manifest,
      branding: config.branding,
      progression: config.progression,
      runner: config.runner,
    }),
  );

  // 4. Send to Registry
  logger.info(`Publishing ${packageName} v${version} to registry...`, "REGISTRY");
  try {
    const res = await fetch(`${BACKEND_URL}/registry/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json() as { error: string };
      logger.error("Publish failed", err.error || res.statusText);
      process.exit(1);
    }

    const data = await res.json() as { success: boolean; version: string };
    logger.success(`Successfully published ${config.id} v${data.version}!`);
    logger.info(`Students can now run: progy init ${config.id}`);
  } catch (e: any) {
    logger.error("Network error during publish", e.message);
    process.exit(1);
  }
}
