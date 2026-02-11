import { spawn } from "node:child_process";
import { logger } from "@progy/core";

export async function killPort(port: string | number) {
  const isWindows = process.platform === "win32";

  try {
    if (isWindows) {
      // 1. Find the PID
      const findProc = spawn("cmd.exe", ["/c", `netstat -ano | findstr :${port} | findstr LISTENING`]);
      let output = "";

      findProc.stdout.on("data", (data) => output += data.toString());

      await new Promise((resolve) => findProc.on("close", resolve));

      const lines = output.trim().split("\n");
      const pids = new Set<string>();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(parseInt(pid))) {
          pids.add(pid);
        }
      }

      if (pids.size === 0) {
        logger.info(`No process found listening on port ${port}.`);
        return;
      }

      for (const pid of pids) {
        logger.info(`Terminating process ${pid} on port ${port}...`);
        const killer = spawn("taskkill", ["/F", "/PID", pid]);
        await new Promise((resolve) => killer.on("close", resolve));
      }

      logger.success(`Port ${port} is now free.`);

    } else {
      // Unix-like (fuser)
      logger.info(`Terminating processes on port ${port}...`);
      const killer = spawn("fuser", ["-k", `${port}/tcp`], { stdio: "inherit" });
      await new Promise((resolve) => killer.on("close", resolve));
      logger.success(`Port ${port} handled.`);
    }
  } catch (e: any) {
    logger.error(`Failed to kill port ${port}`, e.message);
  }
}
