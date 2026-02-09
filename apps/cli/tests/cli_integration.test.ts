import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocks ---

// Mock spawn
const mockSpawn = mock(() => {
  return {
    stdout: { on: () => {} },
    stderr: { on: () => {} },
    on: (event: string, cb: any) => { if (event === 'close') cb(0); },
    kill: () => {},
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

// Mock GitUtils
mock.module("../src/core/git", () => ({
  GitUtils: {
    clone: mock(async (url, dir) => {
        // Create a dummy course.json so validation passes
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, "course.json"), JSON.stringify({
            id: "test-course",
            name: "Test",
            runner: { command: "echo", args: [], cwd: "." },
            content: { root: ".", exercises: "content" },
            setup: { checks: [], guide: "SETUP.md" }
        }));
        await mkdir(join(dir, "content"), { recursive: true });
        await mkdir(join(dir, "content", "01_intro"), { recursive: true });
        await mkdir(join(dir, "content", "01_intro", "01_hello"), { recursive: true });
        await writeFile(join(dir, "SETUP.md"), "setup");
        return { success: true };
    }),
    init: mock(async () => ({ success: true })),
    addRemote: mock(async () => ({ success: true })),
    pull: mock(async () => ({ success: true })),
    getGitInfo: mock(async () => ({ remoteUrl: null, root: null })),
  }
}));

// Mock CourseContainer
mock.module("../src/core/container", () => ({
  CourseContainer: {
    pack: mock(async (src, dest) => {
        await writeFile(dest, "dummy-progy-content");
    }),
    unpack: mock(async (file) => {
        const dir = join(tmpdir(), "progy-unpack-" + Date.now());
        await mkdir(dir, { recursive: true });
        return dir;
    }),
    sync: mock(async () => {})
  }
}));

// Mock SyncManager
mock.module("../src/core/sync", () => ({
  SyncManager: {
    loadConfig: mock(async () => null),
    ensureOfficialCourse: mock(async () => ""),
    applyLayering: mock(async () => {}),
    saveConfig: mock(async () => {}),
    generateGitIgnore: mock(async () => {}),
  }
}));

// Mock Config
mock.module("../src/core/config", () => ({
  loadToken: mock(async () => "mock-token"),
  saveToken: mock(async () => {}),
  clearToken: mock(async () => {}),
  getGlobalConfig: mock(async () => ({})),
  saveGlobalConfig: mock(async () => {}),
}));

// Helper to check if path exists
async function exists(path: string): Promise<boolean> {
    try {
        await stat(path);
        return true;
    } catch {
        return false;
    }
}

// Helper to create temp directories
async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `progy-test-${prefix}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

// --- Tests ---

describe("CLI Start Integration", () => {
    let originalCwd: any;
    let originalExit: any;
    let tempCwd: string;

    beforeEach(async () => {
        originalCwd = process.cwd;
        originalExit = process.exit;
        process.exit = mock(() => {}) as any;
        tempCwd = await createTempDir("start-test");
        process.cwd = () => tempCwd;
        mockSpawn.mockClear();
    });

    afterEach(async () => {
        process.cwd = originalCwd;
        process.exit = originalExit;
        await rm(tempCwd, { recursive: true, force: true });
    });

    test("start command handles alias to container flow (Clone -> Pack -> Run)", async () => {
        const { start } = await import("../src/commands/course");
        const { GitUtils } = await import("../src/core/git");
        const { CourseContainer } = await import("../src/core/container");

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

    test("start opens existing .progy file", async () => {
        const { start } = await import("../src/commands/course");
        const { CourseContainer } = await import("../src/core/container");

        // Clear previous mock calls
        (CourseContainer.unpack as any).mockClear();

        await writeFile(join(tempCwd, "my-course.progy"), "dummy");

        await start("my-course.progy", { offline: false });

        expect(CourseContainer.unpack).toHaveBeenCalled();
        const calls = (CourseContainer.unpack as any).mock.calls;
        expect(calls[0][0]).toContain("my-course.progy");

        expect(mockSpawn).toHaveBeenCalled();
    });
});
