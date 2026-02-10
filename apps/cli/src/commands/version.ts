import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { COURSE_CONFIG_NAME, logger, exists } from "@progy/core";

type VersionType = "patch" | "minor" | "major";

export async function incrementVersion(type: VersionType) {
  const cwd = process.cwd();
  const configPath = join(cwd, COURSE_CONFIG_NAME);

  if (!(await exists(configPath))) {
    logger.error(`Missing ${COURSE_CONFIG_NAME} in current directory.`);
    process.exit(1);
  }

  const configStr = await readFile(configPath, "utf-8");
  let config: any;
  try {
    config = JSON.parse(configStr);
  } catch (e) {
    logger.error(`Invalid JSON in ${COURSE_CONFIG_NAME}`);
    process.exit(1);
  }

  const currentVersion = config.version || "1.0.0";
  logger.info(`Validating current version: ${currentVersion}`, "VERSION");
  const parts = currentVersion.split(".").map((p: string) => parseInt(p, 10));

  if (parts.length !== 3 || parts.some(isNaN)) {
    logger.error(`Invalid version format: ${currentVersion}. Expected x.y.z`);
    process.exit(1);
  }

  let [major, minor, patch] = parts;

  if (type === "major") {
    major++;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor++;
    patch = 0;
  } else if (type === "patch") {
    patch++;
  }

  const newVersion = `${major}.${minor}.${patch}`;
  config.version = newVersion;

  await writeFile(configPath, JSON.stringify(config, null, 2));
  logger.success(`Version bumped: ${currentVersion} -> ${newVersion}`);
}

export const patch = () => incrementVersion("patch");
export const minor = () => incrementVersion("minor");
export const major = () => incrementVersion("major");
