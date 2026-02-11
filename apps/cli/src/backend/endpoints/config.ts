import { execSync } from "node:child_process";
import type { ServerType } from "@progy/core";
import { ensureConfig, currentConfig, PROG_CWD } from "@progy/core";

const checkOfficial = () => {
  // 0. Check explicit flag (set during init via CLI)
  if (currentConfig?.isOfficial === true) return true;

  // 1. Check currentConfig repo URL
  if (currentConfig?.repo?.includes("github.com/progy-dev/")) return true;

  // 2. Check Git (for advanced users or linked repos)
  try {
    const remote = execSync("git remote get-url origin", { cwd: PROG_CWD, stdio: "pipe" }).toString().trim();
    return remote.includes("github.com/progy-dev/");
  } catch (e) {
    return false;
  }
};

const configHandler: ServerType<"/config"> = async () => {
  await ensureConfig();
  const { detectEnvironment } = await import("../../commands/course");
  const env = await detectEnvironment(PROG_CWD);

  return Response.json({
    ...(currentConfig || {}),
    remoteApiUrl: process.env.PROGY_API_URL || "https://api.progy.dev",
    isOffline: process.env.PROGY_OFFLINE === "true",
    isOfficial: checkOfficial(),
    env,
    isInstructor: env === "instructor"
  });
};

export const configRoutes = {
  "/config": { GET: configHandler }
};
