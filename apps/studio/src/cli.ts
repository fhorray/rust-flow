#!/usr/bin/env bun
import { Command } from "commander";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { logger, detectEnvironment } from "@progy/core";
import { PORTS } from "@consts";

const program = new Command();

program
  .name("progy-studio")
  .description("Progy Studio - Visual Course Editor")
  .version("0.1.0");

program
  .command("start")
  .description("Start the Progy Studio editor")
  .option("-p, --port <number>", "Port to run the editor on", String(PORTS.EDITOR))
  .action(async (options) => {
    const cwd = process.cwd();
    const env = await detectEnvironment(cwd);

    if (env === "student") {
      logger.error("'progy-studio' is for course development only.", "Use 'progy start' to learn.");
      process.exit(1);
    }

    const serverPath = join(import.meta.dir, "server.ts");

    logger.brand("🎨 Launching Progy Studio...");

    spawn("bun", ["run", serverPath], {
      stdio: "inherit",
      env: {
        ...process.env,
        PORT: options.port,
        PROGY_EDITOR_MODE: "true"
      }
    });
  });

program.parse();
