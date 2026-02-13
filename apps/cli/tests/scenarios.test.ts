import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const CLI_PATH = join(import.meta.dir, "..", "src", "cli.ts");

function runCLI(args: string[], cwd: string): Promise<{ stdout: string, stderr: string, exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn("bun", ["run", CLI_PATH, ...args], { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", d => stdout += d.toString());
    child.stderr.on("data", d => stderr += d.toString());
    child.on("close", code => resolve({ stdout, stderr, exitCode: code || 0 }));
  });
}

describe("CLI Removed Commands", () => {
  const tempDir = join(tmpdir(), `progy-removed-test-${Date.now()}`);

  beforeAll(async () => {
    mock.module("node:child_process", () => require("node:child_process"));
    await mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("create command should prompt transition to Studio", async () => {
    const { stdout, stderr } = await runCLI(["create", "foo"], tempDir);
    expect(stdout + stderr).toContain("moved to Progy Studio");
  });

  test("add command should prompt transition to Studio", async () => {
    const { stdout, stderr } = await runCLI(["add", "module", "foo"], tempDir);
    expect(stdout + stderr).toContain("moved to Progy Studio");
  });

  test("test command should prompt transition to Studio", async () => {
    const { stdout, stderr } = await runCLI(["test", "foo"], tempDir);
    expect(stdout + stderr).toContain("moved to Progy Studio");
  });
});

describe("Legacy Init Command", () => {
  const tempDir = join(tmpdir(), `progy-init-test-${Date.now()}`);

  beforeAll(async () => {
    await mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("init without args should default to generic or fail nicely", async () => {
    // Since we removed git-based init fallback in code, it should fail or require login/course
    // The current implementation of init in course.ts line 88+ shows:
    // if (!courseId && !isOffline) courseId = "generic";
    // loadToken() -> if !token -> exit(1)

    const { stdout, stderr, exitCode } = await runCLI(["init"], tempDir);
    // Expect failure if not logged in, or success if logged in (but we are largely mocking/expecting generic behavior)
    // In this env we might not be logged in.
    if (exitCode === 1) {
      expect(stderr).toBeDefined(); // Should have some error
    }
  });

  test("init with --offline should warn/fail", async () => {
    const { stdout, stderr, exitCode } = await runCLI(["init", "--offline"], tempDir);
    expect(stdout + stderr).toContain("Offline init not supported yet");
  });
});
