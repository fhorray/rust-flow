import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocks ---

// Mock GitUtils
mock.module("../src/core/git", () => ({
  GitUtils: {
    lock: mock(async () => true),
    unlock: mock(async () => {}),
    updateOrigin: mock(async () => {}),
    exec: mock(async (args: string[]) => {
        if (args.includes("commit")) return { success: true, stdout: "committed" };
        if (args.includes("push")) return { success: true, stdout: "pushed" };
        return { success: true };
    }),
    pull: mock(async () => ({ success: true })),
  }
}));

// Mock SyncManager
mock.module("../src/core/sync", () => ({
  SyncManager: {
    loadConfig: mock(async () => ({
        course: { id: "test-course", repo: "test-repo", branch: "main", path: "" },
        sync: {}
    })),
    ensureOfficialCourse: mock(async () => "/mock/cache"),
    applyLayering: mock(async () => {}),
    saveConfig: mock(async () => {}),
    generateGitIgnore: mock(async () => {}),
    resetExercise: mock(async () => {}),
  }
}));

// Mock Config
mock.module("../src/core/config", () => ({
  loadToken: mock(async () => "mock-token"),
  getGlobalConfig: mock(async () => ({})),
  saveGlobalConfig: mock(async () => {}),
  saveToken: mock(async () => {}),
  clearToken: mock(async () => {}),
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

describe("CLI Sync Commands", () => {
    let originalCwd: any;
    let tempCwd: string;

    beforeEach(async () => {
        originalCwd = process.cwd;
        tempCwd = await createTempDir("sync-test");
        process.cwd = () => tempCwd;
    });

    afterEach(async () => {
        process.cwd = originalCwd;
        await rm(tempCwd, { recursive: true, force: true });
    });

    test("sync executes git operations", async () => {
        const { sync } = await import("../src/commands/sync");
        const { GitUtils } = await import("../src/core/git");
        const { SyncManager } = await import("../src/core/sync");

        // Need .git folder to trigger sync
        await mkdir(join(tempCwd, ".git"));

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(" "));

        try {
            await sync();
        } finally {
             console.log = originalLog;
        }

        expect(GitUtils.lock).toHaveBeenCalled();
        expect(SyncManager.ensureOfficialCourse).toHaveBeenCalled();
        expect(SyncManager.applyLayering).toHaveBeenCalled();
        expect(GitUtils.pull).toHaveBeenCalled();
        expect(SyncManager.saveConfig).toHaveBeenCalled(); // Updates timestamp
        expect(GitUtils.unlock).toHaveBeenCalled();
    });

    test("save executes git commit and push", async () => {
        const { save } = await import("../src/commands/sync");
        const { GitUtils } = await import("../src/core/git");

        await mkdir(join(tempCwd, ".git"));

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(" "));

        try {
            await save({ message: "test commit" });
        } finally {
            console.log = originalLog;
        }

        expect(GitUtils.exec).toHaveBeenCalled();
        const calls = (GitUtils.exec as any).mock.calls;
        const commitCall = calls.find((c: any) => c[0].includes("commit"));
        expect(commitCall[0]).toContain("test commit");

        const pushCall = calls.find((c: any) => c[0].includes("push"));
        expect(pushCall).toBeDefined();
    });

     test("reset calls SyncManager.resetExercise", async () => {
        const { reset } = await import("../src/commands/sync");
        const { SyncManager } = await import("../src/core/sync");

        await reset("content/01_intro/exercise.py");

        expect(SyncManager.resetExercise).toHaveBeenCalled();
        const calls = (SyncManager.resetExercise as any).mock.calls;
        // Verify relative path
        expect(calls[0][2]).toContain("exercise.py");
    });
});
