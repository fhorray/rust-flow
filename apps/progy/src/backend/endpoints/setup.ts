import { readFile, exists } from "node:fs/promises";
import { join } from "node:path";
import type { ServerType } from "../types";
import { ensureConfig, currentConfig, runSetupChecks, PROG_CWD } from "../helpers";

const setupStatusHandler: ServerType<"/setup/status"> = async () => {
  await ensureConfig();
  if (!currentConfig || !currentConfig.setup) return Response.json({ success: true, checks: [] });
  const results = await runSetupChecks(currentConfig.setup);
  return Response.json({ success: results.every(r => r.status === 'pass'), checks: results });
};

const setupGuideHandler: ServerType<"/setup/guide"> = async () => {
  await ensureConfig();
  if (!currentConfig || !currentConfig.setup?.guide) return Response.json({ markdown: "# No setup guide available" });
  const guidePath = join(PROG_CWD, currentConfig.setup.guide);
  if (await exists(guidePath)) {
    const content = await readFile(guidePath, "utf-8");
    return Response.json({ markdown: content });
  }
  return Response.json({ markdown: "# Setup guide not found" });
};

export const setupRoutes = {
  "/setup/status": { GET: setupStatusHandler },
  "/setup/guide": { GET: setupGuideHandler }
};
