
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { CourseContainer } from "../core/container";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("CourseContainer Logic", () => {
  const testDir = join(tmpdir(), `progy-test-container-${Date.now()}`);
  const sourceDir = join(testDir, "source");
  const progyFile = join(testDir, "test-course.progy");

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, "course.json"), JSON.stringify({ id: "test" }));
    await writeFile(join(sourceDir, "README.md"), "# Test Course");
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should pack a directory into a .progy file", async () => {
    await CourseContainer.pack(sourceDir, progyFile);
    const stats = await stat(progyFile);
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
  });

  test("should unpack a .progy file to a runtime directory", async () => {
    const runtimeDir = await CourseContainer.unpack(progyFile);
    expect(existsSync(join(runtimeDir, "course.json"))).toBe(true);
    expect(existsSync(join(runtimeDir, "README.md"))).toBe(true);

    const content = await readFile(join(runtimeDir, "README.md"), "utf-8");
    expect(content).toBe("# Test Course");
  });

  test("should sync changes back to .progy file", async () => {
    // Unpack first
    const runtimeDir = await CourseContainer.unpack(progyFile);

    // Modify file
    const newContent = "# Updated Content";
    await writeFile(join(runtimeDir, "README.md"), newContent);

    // Sync
    await CourseContainer.sync(runtimeDir, progyFile);

    // Unpack again to new location (simulate restart/new hash?)
    // CourseContainer.unpack uses hash of file+mtime, so if file changed, it unpacks to new dir?
    // Wait, sync updates the file, so mtime changes.
    // Let's verify content.

    // Manually unzip into separate dir to verify content without relying on unpack logic's caching
    const checkDir = join(testDir, "check");
    await mkdir(checkDir, { recursive: true });

    // We can reuse unpack logic actually, it handles it.
    const runtimeDir2 = await CourseContainer.unpack(progyFile);
    const content2 = await readFile(join(runtimeDir2, "README.md"), "utf-8");
    expect(content2).toBe(newContent);
  });
});
