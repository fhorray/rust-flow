import { execSync } from "node:child_process";
import type { ServerType } from "../types";
import { ensureConfig, currentConfig, PROG_CWD } from "../helpers";

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
  return Response.json({
    ...(currentConfig || {}),
    remoteApiUrl: process.env.PROGY_API_URL || "https://api.progy.dev",
    isOffline: process.env.PROGY_OFFLINE === "true",
    isOfficial: checkOfficial()
  });
};

export const configRoutes = {
  "/config": { GET: configHandler }
};
