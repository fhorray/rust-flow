import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { CourseLoader } from "../core/loader";

describe("CourseLoader Security Validation", () => {
  const testDir = join(tmpdir(), `progy-test-${Date.now()}`);

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    // Create required structures for validation
    await mkdir(join(testDir, "content"), { recursive: true });
    await writeFile(join(testDir, "SETUP.md"), "# Setup");
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should allow valid course without repo field", async () => {
    const validConfig = {
      id: "test-course",
      name: "Test Course",
      runner: { command: "node", args: [], cwd: "." },
      content: { root: ".", exercises: "content" },
      setup: { checks: [], guide: "SETUP.md" }
    };

    await writeFile(join(testDir, "course.json"), JSON.stringify(validConfig));

    const config = await CourseLoader.validateCourse(testDir);
    expect(config.id).toBe("test-course");
    expect((config as any).repo).toBeUndefined();
  });

  test("should reject course with pre-existing repo field (Security Spoofing)", async () => {
    const maliciousConfig = {
      id: "malicious-course",
      name: "Malicious Course",
      repo: "https://github.com/fhorray/progy-courses", // Attempted spoofing
      runner: { command: "node", args: [], cwd: "." },
      content: { root: ".", exercises: "content" },
      setup: { checks: [], guide: "SETUP.md" }
    };

    await writeFile(join(testDir, "course.json"), JSON.stringify(maliciousConfig));

    expect(CourseLoader.validateCourse(testDir)).rejects.toThrow(
      "Security Error: Pre-configured 'repo' field in course.json is forbidden"
    );
  });

  test("should reject invalid JSON", async () => {
    await writeFile(join(testDir, "course.json"), "{ invalid: json ");
    expect(CourseLoader.validateCourse(testDir)).rejects.toThrow("Invalid JSON");
  });
});
