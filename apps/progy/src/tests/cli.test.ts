import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

const CLI_PATH = join(import.meta.dir, "..", "cli.ts");

// Helper to run CLI
function runCLI(args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const child = spawn("bun", [CLI_PATH, ...args], { cwd });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => stdout += d.toString());
    child.stderr.on("data", (d) => stderr += d.toString());

    child.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode: exitCode ?? 0 });
    });
  });
}

describe("CLI Instructor Commands", () => {
  const testDir = join(tmpdir(), `progy-cli-test-${Date.now()}`);

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    // Setup valid course
    await mkdir(join(testDir, "content"), { recursive: true });
    await mkdir(join(testDir, "exercises"), { recursive: true });
    await writeFile(join(testDir, "SETUP.md"), "# Setup");

    // Create valid course.json
    const validConfig = {
      id: "cli-test-course",
      name: "CLI Test Course",
      runner: { command: "node", args: [], cwd: "." },
      content: { root: ".", exercises: "exercises" },
      setup: { checks: [], guide: "SETUP.md" }
    };
    await writeFile(join(testDir, "course.json"), JSON.stringify(validConfig));
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("validate should pass on valid course", async () => {
    const result = await runCLI(["validate", "."], testDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("✅ Course is Valid");
    expect(result.stdout).toContain("cli-test-course");
  });

  test("pack should create .progy file", async () => {
    const result = await runCLI(["pack"], testDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[SUCCESS] Created");
    expect(result.stdout).toContain("cli-test-course.progy");
  });

  test("validate should fail on invalid directory", async () => {
    const emptyDir = join(testDir, "empty");
    await mkdir(emptyDir);
    const result = await runCLI(["validate", "."], emptyDir);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Validation Failed");
  });

  test("init should create generic course if no arg provided", async () => {
    const initDir = join(tmpdir(), `progy-init-test-${Date.now()}`);
    await mkdir(initDir, { recursive: true });

    const result = await runCLI(["init"], initDir);
    const stdout = result.stdout + result.stderr; // Capture both

    if (result.exitCode !== 0) {
      console.log("Init Failed Output:", stdout);
    }

    expect(result.exitCode).toBe(0);
    expect(stdout).toContain("Course initialized!");

    // Check files
    const courseJson = await Bun.file(join(initDir, "course.json")).text();
    expect(courseJson).toContain("My New Course");

    const runnerReadme = await Bun.file(join(initDir, "runner", "README.md")).text();
    expect(runnerReadme).toContain("Progy Runner Guide");

    await rm(initDir, { recursive: true, force: true });
  });
});
