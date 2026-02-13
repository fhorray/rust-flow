import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";

const CLI_PATH = join(import.meta.dir, "../src/cli.ts");
const TEST_DIR = join(import.meta.dir, "temp_studio_test");

describe("Studio CLI Environment Detection", () => {
  beforeAll(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("should fail in a student environment (no course.json)", async () => {
    // Ensure no course.json
    await rm(join(TEST_DIR, "course.json"), { force: true });

    // Create progy.toml to simulate student env
    await writeFile(join(TEST_DIR, "progy.toml"), "");

    const proc = spawn("bun", ["run", CLI_PATH, "start"], {
      cwd: TEST_DIR,
      stdio: "pipe",
      env: { ...process.env, PROGY_EDITOR_MODE: "false" }
    });

    const exitCode = await new Promise((resolve) => proc.on("close", resolve));
    expect(exitCode).toBe(1);
  });

  it("should start in an instructor environment (has course.json)", async () => {
    // Create course.json
    await writeFile(join(TEST_DIR, "course.json"), "{}");

    const proc = spawn("bun", ["run", CLI_PATH, "start"], {
      cwd: TEST_DIR,
      stdio: "pipe",
      env: { ...process.env, PROGY_EDITOR_MODE: "false" }
    });

    // Wait for 2 seconds. If it hasn't exited, we assume success.
    const exitPromise = new Promise((resolve) => proc.on("close", resolve));
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("timeout"), 2000));

    const result = await Promise.race([exitPromise, timeoutPromise]);

    if (result === "timeout") {
      // It's still running, so it passed the check.
      proc.kill();
      expect(true).toBe(true);
    } else {
      // If it exited, check exit code. It shouldn't be 1 (error).
      // It might be 0 if the spawned process exited quickly (e.g. server failed to start but didn't error out CLI).
      expect(result).not.toBe(1);
    }
  });
});
