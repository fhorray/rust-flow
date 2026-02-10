import { spawn } from "node:child_process";
import { join } from "node:path";
import type { ServerType } from "@progy/core";
import { PROG_CWD, currentConfig } from "@progy/core";
import { logger } from "@progy/core";

const ideOpenHandler: ServerType<"/ide/open"> = async (req) => {
  const { path } = await req.json() as { path: string };
  const absPath = join(PROG_CWD, path);

  const ideCommand = currentConfig()?.editor?.ideCommand || "code";

  logger.info(`Opening ${path} with ${ideCommand}`);

  try {
    // We use spawn to run the IDE command (code, cursor, nvim, etc)
    spawn(ideCommand, [absPath], {
      stdio: 'inherit',
      shell: true // important for Windows and some command strings
    });

    return Response.json({ success: true });
  } catch (e: any) {
    logger.error(`Failed to open IDE: ${e.message}`);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

export const ideRoutes = {
  "/ide/open": {
    POST: ideOpenHandler,
  },
};
