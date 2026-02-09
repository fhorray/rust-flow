import { join, relative, resolve } from "node:path";
import { stat } from "node:fs/promises";
import { GitUtils } from "../core/git";
import { SyncManager } from "../core/sync";
import { loadToken } from "../core/config";
import { BACKEND_URL, getCourseCachePath } from "../core/paths";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function save(options: { message: string }) {
  const cwd = process.cwd();
  if (!(await exists(join(cwd, ".git")))) {
    console.error("❌ Not a synced course (No .git found).");
    return;
  }

  const token = await loadToken();
  const config = await SyncManager.loadConfig(cwd);

  if (config?.course?.id) {
    await SyncManager.generateGitIgnore(cwd, config.course.id);
  }

  if (!(await GitUtils.lock(cwd))) {
    console.warn("⚠️  Another Progy process is syncing. Please wait.");
    return;
  }

  try {
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/git/credentials`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const gitCreds = await res.json() as any;
          await GitUtils.updateOrigin(cwd, gitCreds.token);
          console.log(`[SYNC] Authenticated as ${gitCreds.user}`);
        }
      } catch { }
    }

    console.log(`[SYNC] Saving progress...`);
    await GitUtils.exec(["add", "."], cwd);
    const commit = await GitUtils.exec(["commit", "-m", options.message], cwd);

    if (commit.success) {
      console.log(`[SYNC] Committed changes.`);
    } else if (!commit.stdout.includes("nothing to commit")) {
      console.error(`[ERROR] Commit failed: ${commit.stderr}`);
      return;
    }

    console.log(`[SYNC] Syncing with remote...`);
    const pull = await GitUtils.pull(cwd);
    if (!pull.success) {
      console.warn(`[WARN] Sync/Pull issue: ${pull.stderr}`);
      return;
    }

    const push = await GitUtils.exec(["push", "origin", "HEAD"], cwd);
    if (push.success) {
      console.log(`[SUCCESS] Progress saved to cloud.`);
    } else {
      console.error(`[ERROR] Push failed: ${push.stderr}`);
    }
  } finally {
    await GitUtils.unlock(cwd);
  }
}

export async function sync() {
  const cwd = process.cwd();
  if (!(await exists(join(cwd, ".git")))) {
    console.error("❌ Not a synced course (No .git found).");
    return;
  }

  const config = await SyncManager.loadConfig(cwd);
  if (!config) {
    console.error("❌ Missing progy.toml.");
    return;
  }

  if (!(await GitUtils.lock(cwd))) {
    console.warn("⚠️  Another Progy process is syncing. Please wait.");
    return;
  }

  try {
    const token = await loadToken();
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/git/credentials`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const gitCreds = await res.json() as any;
          await GitUtils.updateOrigin(cwd, gitCreds.token);
        }
      } catch { }
    }

    console.log(`[SYNC] Checking official course updates...`);
    const cacheDir = await SyncManager.ensureOfficialCourse(
      config.course.id,
      config.course.repo,
      config.course.branch,
      config.course.path
    );

    console.log(`[SYNC] Applying official updates...`);
    await SyncManager.applyLayering(cwd, cacheDir, false, config.course.path);

    console.log(`[SYNC] Pulling your progress...`);
    const res = await GitUtils.pull(cwd);

    if (res.success) {
      config.sync = { last_sync: new Date().toISOString() };
      await SyncManager.saveConfig(cwd, config);
      console.log(`[SUCCESS] Workspace synchronized.`);
    } else {
      console.error(`[ERROR] Failed to pull user changes: ${res.stderr}`);
    }
  } catch (e: any) {
    console.error(`[ERROR] Sync failed: ${e.message}`);
  } finally {
    await GitUtils.unlock(cwd);
  }
}

export async function reset(path: string) {
  const cwd = process.cwd();
  const targetFile = relative(cwd, resolve(path));

  const config = await SyncManager.loadConfig(cwd);
  if (!config) {
    console.error("❌ Missing progy.toml.");
    return;
  }

  try {
    console.log(`[RESET] restoring ${targetFile}...`);
    const cacheDir = getCourseCachePath(config.course.id);
    if (!(await exists(cacheDir))) {
      await SyncManager.ensureOfficialCourse(config.course.id, config.course.repo, config.course.branch);
    }

    await SyncManager.resetExercise(cwd, cacheDir, targetFile);
    console.log(`[SUCCESS] File reset to original state.`);
  } catch (e: any) {
    console.error(`[ERROR] Reset failed: ${e.message}`);
  }
}
