#!/usr/bin/env bun
import { Command } from "commander";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { logger } from "@progy/core";
import { PORTS } from "@consts";

const program = new Command();

program
  .name("progy-editor")
  .description("Progy Studio - Visual Course Editor")
  .version("0.1.0");

program
  .command("start")
  .description("Start the Progy Studio editor")
  .option("-p, --port <number>", "Port to run the editor on", String(PORTS.EDITOR))
  .action((options) => {
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
