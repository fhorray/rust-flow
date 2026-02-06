#!/usr/bin/env bun
import { parseArgs } from "util";
import { cp, exists, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const args = parseArgs({
  args: Bun.argv,
  options: {
    lang: {
      type: "string",
    },
  },
  allowPositionals: true,
});

const command = args.positionals[2]; // bun apps/prog/src/cli.ts init ...

if (command === "init") {
  const lang = args.values.lang;
  if (!lang) {
    console.error("❌ Error: Please specify a language using --lang <language>");
    process.exit(1);
  }

  // Determine source directory for the course
  // In dev mode, we look at the repo root/courses/<lang>
  // In a real scenario, this might download from a registry or git repo.
  // We assume the CLI is run from the repo root or installed such that we can find 'courses'
  // For this environment, let's look up from where the script is located.

  // Script location: apps/prog/src/cli.ts
  // Repo root: apps/prog/src/../../../
  const repoRoot = join(import.meta.dir, "../../../");
  const courseSource = join(repoRoot, "courses", lang);

  const targetDir = process.cwd();

  console.log(`🚀 Initializing ${lang} course in ${targetDir}...`);

  if (!await exists(courseSource)) {
      console.error(`❌ Error: Course for '${lang}' not found at ${courseSource}`);
      process.exit(1);
  }

  try {
      // Copy course files
      console.log("📦 Copying course files...");
      await cp(courseSource, targetDir, { recursive: true });

      console.log("✅ Course initialized!");

      // Start the UI server
      console.log("🌟 Starting UI server...");

      const serverScript = join(import.meta.dir, "backend/server.ts");

      // Spawn bun run server.ts
      const child = spawn("bun", ["run", serverScript], {
          stdio: "inherit",
          cwd: targetDir
      });

      child.on("close", (code) => {
          console.log(`Server exited with code ${code}`);
      });

  } catch (e) {
      console.error("❌ Failed to initialize course:", e);
      process.exit(1);
  }

} else {
  console.log("Usage: prog init --lang <language>");
}
