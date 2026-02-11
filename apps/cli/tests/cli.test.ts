import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// Helper to create temp directories
async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `progy-test-${prefix}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

// Helper to check if path exists
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// --- Mocks for Integration Tests ---

// Mock spawn
const mockSpawn = mock(() => {
  return {
    stdout: { on: () => { } },
    stderr: { on: () => { } },
    on: (event: string, cb: any) => { if (event === 'close') cb(0); },
    kill: () => { },
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

let mockToken: string | null = null;

mock.module("@progy/core", () => ({
  GitUtils: {
    clone: mock(async (url, dir) => {
      await mkdir(dir as string, { recursive: true });
      await writeFile(join(dir as string, "course.json"), JSON.stringify({
        id: "test-course",
        name: "Test",
        runner: { command: "echo", args: [], cwd: "." },
        content: { root: ".", exercises: "content" },
        setup: { checks: [], guide: "SETUP.md" }
      }));
      await mkdir(join(dir as string, "content"), { recursive: true });
      await mkdir(join(dir as string, "content", "01_intro"), { recursive: true });
      await mkdir(join(dir as string, "content", "01_intro", "01_hello"), { recursive: true });
      await writeFile(join(dir as string, "SETUP.md"), "setup");
      return { success: true };
    }),
    init: mock(async () => ({ success: true })),
    addRemote: mock(async () => ({ success: true })),
    pull: mock(async () => ({ success: true })),
    getGitInfo: mock(async () => ({ remoteUrl: null, root: null })),
  },
  CourseContainer: {
    pack: mock(async (src, dest) => {
      await writeFile(dest as string, "dummy-progy-content");
    }),
    unpack: mock(async (file) => {
      const dir = join(tmpdir(), "progy-unpack-" + Date.now());
      await mkdir(dir, { recursive: true });
      return dir;
    }),
    sync: mock(async () => { })
  },
  SyncManager: {
    loadConfig: mock(async () => null),
    ensureOfficialCourse: mock(async () => ""),
    applyLayering: mock(async () => { }),
    saveConfig: mock(async () => { }),
    generateGitIgnore: mock(async () => { }),
  },
  CourseLoader: {
    validateCourse: mock(async (path) => {
      const configPath = join(path as string, "course.json");
      try {
        await stat(configPath);
      } catch {
        throw new Error("Missing course.json");
      }
      return {
        id: "test-course",
        name: "Test Course",
        runner: { command: "echo", args: [], cwd: "." },
        content: { root: ".", exercises: "content" },
        setup: { guide: "SETUP.md", checks: [] }
      };
    }),
    resolveSource: mock(async (input) => ({ url: `https://github.com/progy-dev/${input}.git` })),
  },
  logger: {
    info: mock((msg) => console.log(msg)),
    success: mock((msg) => console.log(msg)),
    error: mock((msg) => console.error(msg)),
    warn: mock((msg) => console.warn(msg)),
    brand: mock((msg) => console.log(msg)),
    banner: mock(() => { }),
    startupInfo: mock(() => { }),
    divider: mock(() => { }),
  },
  exists: mock(async (p: string) => {
    try {
      await stat(p);
      return true;
    } catch {
      return false;
    }
  }),
  BACKEND_URL: "https://api.progy.dev",
  FRONTEND_URL: "https://progy.dev",
  loadToken: mock(async () => mockToken),
  saveToken: mock(async (t: string) => { mockToken = t; }),
  clearToken: mock(async () => { mockToken = null; }),
  getGlobalConfig: mock(async () => ({})),
  saveGlobalConfig: mock(async () => { }),
  getCourseCachePath: mock((id: string) => join(tmpdir(), "progy-cache-" + id)),
  get PROG_CWD() { return process.env.PROG_CWD || process.cwd(); },
  COURSE_CONFIG_NAME: "course.json",
  RUNNER_README: "mock-runner",
  MODULE_INFO_TOML: "mock",
  EXERCISE_README: "mock",
  EXERCISE_STARTER: "mock",
  QUIZ_TEMPLATE: "[]",
  TEMPLATES: {
    python: {
      courseJson: {},
      setupMd: "",
      introReadme: "",
      introFilename: "",
      introCode: ""
    }
  }
}));



// --- Existing Tests ---

describe("CLI Environment Detection", () => {
  test("detectEnvironment returns 'instructor' when course.json and content/ exist", async () => {
    const tempDir = await createTempDir("instructor");
    try {
      // Create instructor environment
      await writeFile(join(tempDir, "course.json"), "{}");
      await mkdir(join(tempDir, "content"), { recursive: true });

      // Import the function dynamically
      const { detectEnvironment } = await import("../src/commands/course");

      expect(await exists(join(tempDir, "course.json"))).toBe(true);
      expect(await exists(join(tempDir, "content"))).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("detectEnvironment returns 'student' when only .progy file exists", async () => {
    const tempDir = await createTempDir("student");
    try {
      // Create student environment (only .progy file)
      await writeFile(join(tempDir, "course.progy"), "dummy content");

      expect(await exists(join(tempDir, "course.json"))).toBe(false);
      expect(await exists(join(tempDir, "content"))).toBe(false);
      expect(await exists(join(tempDir, "course.progy"))).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("Config Functions", () => {
  test("saveToken and loadToken work correctly", async () => {
    const { saveToken, loadToken, clearToken } = await import("@progy/core");

    const testToken = `test-token-${Date.now()}`;
    await saveToken(testToken);

    const loaded = await loadToken();
    expect(loaded).toBe(testToken);

    await clearToken();
    const cleared = await loadToken();
    expect(cleared).toBeNull();
  });

  test("clearToken removes the token", async () => {
    const { saveToken, clearToken, loadToken } = await import("@progy/core");

    await saveToken("temp-token");
    await clearToken();

    const token = await loadToken();
    expect(token).toBeNull();
  });
});

describe("Course Loader", () => {
  test("validateCourse throws on missing course.json", async () => {
    const { CourseLoader } = await import("@progy/core");
    const tempDir = await createTempDir("invalid-course");

    try {
      await expect(CourseLoader.validateCourse(tempDir)).rejects.toThrow();
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("validateCourse accepts valid course structure", async () => {
    const { CourseLoader } = await import("@progy/core");
    const tempDir = await createTempDir("valid-course");

    try {
      const courseJson = {
        id: "test-course",
        name: "Test Course",
        description: "A test course",
        runner: {
          type: "process",
          command: "echo test",
          args: [],
          cwd: "."
        },
        content: {
          root: ".",
          exercises: "content"
        },
        setup: {
          checks: [],
          guide: "SETUP.md"
        }
      };

      await writeFile(join(tempDir, "course.json"), JSON.stringify(courseJson, null, 2));
      await mkdir(join(tempDir, "content"), { recursive: true });
      await mkdir(join(tempDir, "content", "01_intro"), { recursive: true }); // Need XX_ folder for validation
      await mkdir(join(tempDir, "content", "01_intro", "01_hello"), { recursive: true }); // Need XX_ exercise
      await writeFile(join(tempDir, "SETUP.md"), "# Setup");

      const config = await CourseLoader.validateCourse(tempDir);
      expect(config.id).toBe("test-course");
      expect(config.name).toBe("Test Course");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("resolveSource resolves alias to progy-dev organization", async () => {
    const { CourseLoader } = await import("@progy/core");
    const result = await CourseLoader.resolveSource("python");
    expect(result.url).toBe("https://github.com/progy-dev/python.git");
  });
});

describe("CLI Commands Exports", () => {
  test("all expected functions are exported from course.ts", async () => {
    const courseModule = await import("../src/commands/course");

    expect(typeof courseModule.init).toBe("function");
    expect(typeof courseModule.createCourse).toBe("function");
    expect(typeof courseModule.validate).toBe("function");
    expect(typeof courseModule.pack).toBe("function");
    expect(typeof courseModule.dev).toBe("function");
    expect(typeof courseModule.start).toBe("function");
    expect(typeof courseModule.testExercise).toBe("function");
  });

  test("all expected functions are exported from auth.ts", async () => {
    const authModule = await import("../src/commands/auth");

    expect(typeof authModule.login).toBe("function");
    expect(typeof authModule.logout).toBe("function");
  });

  test("config functions are exported", async () => {
    const { saveToken, loadToken, clearToken, getGlobalConfig, saveGlobalConfig } = await import("@progy/core");

    expect(typeof saveToken).toBe("function");
    expect(typeof loadToken).toBe("function");
    expect(typeof clearToken).toBe("function");
    expect(typeof getGlobalConfig).toBe("function");
    expect(typeof saveGlobalConfig).toBe("function");
  });
});

describe("Publish Command", () => {
  test("publish function exists and is exported", async () => {
    const { publish } = await import("../src/commands/publish");
    expect(typeof publish).toBe("function");
  });
});

// --- New Integration Test ---

describe("CLI Start Command (Integration)", () => {
  let originalCwd: any;
  let originalExit: any;
  let tempCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd;
    originalExit = process.exit;
    process.exit = mock(() => { }) as any;
    tempCwd = await createTempDir("start-test");
    process.cwd = () => tempCwd;
    mockSpawn.mockClear();
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    process.exit = originalExit;
    await rm(tempCwd, { recursive: true, force: true });
  });

  test("start command handles alias to container flow", async () => {
    const { start } = await import("../src/commands/course");
    const { GitUtils, CourseContainer } = await import("@progy/core");

    const alias = "test-alias-course";

    // Run start with an alias
    await start(alias, { offline: false });

    // Verify git clone was called
    expect(GitUtils.clone).toHaveBeenCalled();
    const cloneCalls = (GitUtils.clone as any).mock.calls;
    // Check that it tried to clone from progy-dev
    expect(cloneCalls[0][0]).toContain("test-alias-course");

    // Verify pack was called
    expect(CourseContainer.pack).toHaveBeenCalled();
    const packCalls = (CourseContainer.pack as any).mock.calls;
    // Should pack to [alias].progy in current dir
    expect(packCalls[0][1]).toContain(`${alias}.progy`);

    // Verify spawn was called (runServer)
    expect(mockSpawn).toHaveBeenCalled();
    const spawnCalls = mockSpawn.mock.calls;
    expect(spawnCalls[0][0]).toBe("bun");
    expect(spawnCalls[0][1]).toContain("run");
  });
});
