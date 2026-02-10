import { resolve } from "node:path";
import { CourseLoader, CourseContainer, loadToken, BACKEND_URL, logger, exists } from "@progy/core";

import { incrementVersion } from "./version";

export async function publish(options: any) {
  const cwd = process.cwd();

  // 0. Handle Version Increment
  if (options.patch) await incrementVersion("patch");
  if (options.minor) await incrementVersion("minor");
  if (options.major) await incrementVersion("major");

  // 1. Validate Course
  let config;
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

  // 3.5 Extract Manifest for Web Preview
  logger.info("Extracting course manifest for web preview...", "INDEX");
  const manifest = await CourseLoader.getCourseFlow(cwd);

  const file = Bun.file(progyPath);

  const formData = new FormData();
  formData.append('file', file as any); // Bun.file is compatible with FormData
  formData.append(
    'metadata',
    JSON.stringify({
      name: packageName,
      version: (config as any).version || "1.0.0",
      description: config.name,
      changelog: "Initial release via CLI",
      manifest,
    }),
  );

  // 4. Send to Registry
  logger.info(`Publishing ${packageName} v${(config as any).version || "1.0.0"} to registry...`, "REGISTRY");
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
