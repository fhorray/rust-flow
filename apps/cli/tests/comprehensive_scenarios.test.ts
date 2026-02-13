
import { describe, test, expect, mock, beforeEach, afterEach, beforeAll } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocks ---
const mockSpawn = mock((cmd, args) => {
  console.log("DEBUG: Mock Spawn Called", cmd, args);
  return {
    stdout: { on: () => { } },
    stderr: { on: () => { } },
    on: (event: string, cb: any) => { if (event === 'close') cb(0); },
    kill: () => { },
    unref: () => { },
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

let mockToken: string | null = "valid-token";
let mockExistsOverride: ((p: string) => Promise<boolean>) | null = null;

// Stable mocks
const mockLogger = {
  info: mock((msg) => console.log("[INFO]", msg)),
  success: mock((msg) => console.log("[SUCCESS]", msg)),
  error: mock((msg, err) => console.error("[ACTUAL_ERROR_LOG]", msg, err)),
  warn: mock((msg) => console.warn("[WARN]", msg)),
  brand: mock((msg) => console.log("[BRAND]", msg)),
  banner: mock(() => { }),
};

const mockCourseLoader = {
  validateCourse: mock(async (path) => {
    const jsonPath = join(path as string, "course.json");
    try { await stat(jsonPath); } catch { throw new Error(`No course.json found at ${jsonPath}`); }
    return { id: "test", name: "Test" };
  }),
  resolveSource: mock(async (id) => ({
    id: id,
    url: "https://example.com/course.progy",
    isRegistry: true
  })),
};

const mockCourseContainer = {
  pack: mock(async () => { }),
  unpack: mock(async () => {
    console.log("DEBUG: Mock Unpack Called");
    const dir = join(tmpdir(), "progy-unpack-mock-" + Date.now());
    await mkdir(dir, { recursive: true });
    return dir;
  }),
  unpackTo: mock(async () => { }),
  sync: mock(async () => { })
};

mock.module("@progy/core", () => ({
  GitUtils: {
    clone: mock(async () => ({ success: true })),
    init: mock(async () => ({ success: true })),
  },
  CourseContainer: mockCourseContainer,
  SyncManager: {
    loadConfig: mock(async () => ({ course: { id: "test-course", repo: "test-repo" } })),
    saveConfig: mock(async () => { }),
    downloadProgress: mock(async () => null),
    restoreProgress: mock(async () => { }),
    uploadProgress: mock(async () => { }),
    packProgress: mock(async () => ({ buffer: new ArrayBuffer(0) })),
    generateGitIgnore: mock(async () => { }),
    applyLayering: mock(async () => { }),
  },
  CourseLoader: mockCourseLoader,
  logger: mockLogger,
  loadToken: mock(async () => mockToken),
  getCourseCachePath: mock((id: string) => join(tmpdir(), "progy-cache-" + id)),
  exists: mock(async (p: string) => {
    if (mockExistsOverride) return await mockExistsOverride(p);
    const result = await Bun.file(p).exists() || (await stat(p).then(() => true).catch(() => false));
    console.log(`DEBUG: exists(${p}) = ${result}`);
    return result;
  }),
  BACKEND_URL: "https://api.progy.dev",
  FRONTEND_URL: "https://progy.dev",
  HELPERS_BACKEND_URL: "https://api.progy.dev",
}));


// --- Tests ---

describe("Comprehensive Scenarios", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `progy-comp-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    const originalCwd = process.cwd;
    process.cwd = () => tempDir;
    // @ts-ignore
    process.exit = mock((code) => { if (code !== 0) throw new Error(`ProcessExit: ${code}`); });

    // Clear mocks and overrides
    mockExistsOverride = null;
    mockSpawn.mockClear();

    mockCourseLoader.validateCourse.mockClear();
    mockCourseLoader.resolveSource.mockClear();
    mockCourseContainer.unpack.mockClear();
    mockLogger.error.mockClear();
    mockLogger.success.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // --- Student Flow ---
  test("start command with local .progy file should unpack and run", async () => {
    console.log("TEST: start local");
    const { start } = await import("../src/commands/course");

    const progyFile = join(tempDir, "local.progy");
    await writeFile(progyFile, "dummy");

    try {
      await start(progyFile, {});
    } catch (e: any) {
      console.error("Start Local Failed:", e);
      throw e;
    }

    // Should unpack (implicitly verified by runServer/spawn call)
    expect(mockSpawn).toHaveBeenCalled();
  });

  test("start command should fail if no token and not offline", async () => {
    mockToken = null;
    const { start } = await import("../src/commands/course");
    const progyFile = join(tempDir, "local.progy");
    await writeFile(progyFile, "dummy");

    expect(start(progyFile, {})).rejects.toThrow("ProcessExit: 1");
    expect(mockLogger.error).toHaveBeenCalledWith("Authentication required.", expect.stringContaining("progy login"));
  });

  test("start command should succeed if no token but offline mode enabled", async () => {
    mockToken = null;
    mockSpawn.mockClear();
    const { start } = await import("../src/commands/course");
    const progyFile = join(tempDir, "local.progy");
    await writeFile(progyFile, "dummy");

    await start(progyFile, { offline: true });
    expect(mockSpawn).toHaveBeenCalled();
  });

  // Instructor Flow tests removed (dev command moved to Studio)
});


