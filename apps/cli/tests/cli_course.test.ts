import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocks ---

const mockSpawn = mock(() => {
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

// Mock optimize util to avoid sharp dependency
mock.module("../src/utils/optimize", () => ({
    optimizeDirectory: mock(async () => ({ filesProcessed: 0, saved: 0 })),
    updateAssetReferences: mock(async () => {}),
}));

// Mock global fetch
global.fetch = mock(async (url: any) => {
    return new Response(Buffer.from("mock-content"));
});

mock.module("@progy/core", () => ({
  GitUtils: {
    clone: mock(async () => ({ success: true })),
    init: mock(async () => ({ success: true })),
    addRemote: mock(async () => ({ success: true })),
    pull: mock(async () => ({ success: true })),
    exec: mock(async () => ({ success: true, stdout: "", stderr: "" })),
    lock: mock(async () => true),
    unlock: mock(async () => { }),
  },
  CourseContainer: {
    pack: mock(async (src, dest) => {
      await writeFile(dest, "dummy-progy-content");
    }),
    unpack: mock(async (file) => {
      const dir = join(tmpdir(), "progy-unpack-" + Date.now());
      await mkdir(dir, { recursive: true });
      return dir;
    }),
    unpackTo: mock(async (file, dest) => {
      await mkdir(dest, { recursive: true });
      await mkdir(join(dest, "content"), { recursive: true });
    }),
    sync: mock(async () => { })
  },
  SyncManager: {
    loadConfig: mock(async () => ({
      course: { id: "test-course", repo: "test-course", branch: "registry", path: "." },
      sync: {}
    })),
    ensureOfficialCourse: mock(async () => "/mock/cache/dir"),
    applyLayering: mock(async () => { }),
    saveConfig: mock(async () => { }),
    generateGitIgnore: mock(async () => { }),
    resetExercise: mock(async () => { }),
    downloadProgress: mock(async () => null),
    restoreProgress: mock(async () => { }),
    packProgress: mock(async () => Buffer.from("")),
    uploadProgress: mock(async () => true),
  },
  loadToken: mock(async () => "mock-token"),
  saveToken: mock(async () => { }),
  clearToken: mock(async () => { }),
  getGlobalConfig: mock(async () => ({})),
  saveGlobalConfig: mock(async () => { }),
  CourseLoader: {
    validateCourse: mock(async (path) => {
      return {
        id: "test-course",
        name: "Test Course",
        runner: { command: "echo", args: [], cwd: "." },
        content: { root: ".", exercises: "content" },
        setup: { guide: "SETUP.md", checks: [] }
      };
    }),
    resolveSource: mock(async (input) => {
      return { url: `https://registry.progy.dev/download/${input}`, isRegistry: true };
    })
  },
  logger: {
    info: mock((msg) => console.log(msg)),
    success: mock((msg) => console.log(msg)),
    error: mock((msg, detail) => console.error(msg, detail)),
    warn: mock((msg) => console.warn(msg)),
    brand: mock((msg) => console.log(msg)),
    banner: mock(() => { }),
    startupInfo: mock(() => { }),
    divider: mock(() => { }),
  },
  exists: mock(async (p: string) => {
    if (p.includes("progy.toml")) return false;
    return true;
  }),
  detectEnvironment: mock(async (cwd: string) => "student"),
  BACKEND_URL: "https://api.progy.dev",
  getCourseCachePath: mock((id: string) => join(tmpdir(), "progy-cache-" + id)),
  TEMPLATES: {
    python: {
      courseJson: {
        id: "{{id}}",
        name: "{{name}}",
        runner: { command: "python3 runner.py", args: [], cwd: "." },
        content: { root: ".", exercises: "content" },
        setup: { guide: "SETUP.md", checks: [] }
      },
      setupMd: "# Setup",
      introReadme: "# Intro",
      introFilename: "intro.py",
      introCode: "print('hello')"
    }
  },
  MODULE_INFO_TOML: "mock",
  EXERCISE_README: "mock",
  EXERCISE_STARTER: "mock",
  QUIZ_TEMPLATE: "[]",
  RUNNER_README: "mock",
}));

async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `progy-test-${prefix}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe("CLI Course Commands", () => {
  let originalCwd: any;
  let originalExit: any;
  let tempCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd;
    originalExit = process.exit;
    process.exit = mock(() => { }) as any;
    tempCwd = await createTempDir("course-test");
    process.cwd = () => tempCwd;
    mockSpawn.mockClear();
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    process.exit = originalExit;
    await rm(tempCwd, { recursive: true, force: true });
  });

  test("createCourse generates basic structure", async () => {
    const { createCourse } = await import("../src/commands/course");

    await createCourse({ name: "my-python-course", course: "python" });

    const courseDir = join(tempCwd, "my-python-course");
    expect(await exists(courseDir)).toBe(true);
    expect(await exists(join(courseDir, "course.json"))).toBe(true);
  });

  test("pack creates a .progy file", async () => {
    const { pack } = await import("../src/commands/course");
    const { CourseContainer } = await import("@progy/core");

    const dest = join(tempCwd, "output.progy");
    await pack({ out: dest });

    expect(CourseContainer.pack).toHaveBeenCalled();
  });

  test("init downloads course if no progress", async () => {
      const { init } = await import("../src/commands/course");
      const { SyncManager } = await import("@progy/core");

      await init({ course: "test-course" });

      expect(SyncManager.downloadProgress).toHaveBeenCalledWith("test-course");
      expect(SyncManager.generateGitIgnore).toHaveBeenCalled();
  });
});
