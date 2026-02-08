
import { spawn } from "node:child_process";
import { join } from "node:path";
import { writeFile, unlink, stat } from "node:fs/promises";
import { homedir } from "node:os";

export interface GitResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export class GitUtils {

  static async exec(args: string[], cwd: string, token?: string): Promise<GitResult> {
    return new Promise((resolve) => {
      const proc = spawn("git", args, {
        cwd,
        env: { ...process.env }, // Inherit env
        stdio: "pipe"
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (d) => stdout += d.toString());
      proc.stderr.on("data", (d) => stderr += d.toString());

      proc.on("close", (code) => {
        resolve({
          success: code === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      proc.on("error", (err) => {
        resolve({
          success: false,
          stdout: "",
          stderr: err.message
        });
      });
    });
  }

  // Construct an authenticated URL for cloning/pushing
  static getAuthUrl(repoUrl: string, token: string): string {
    if (!token) return repoUrl;
    // Format: https://x-access-token:<token>@github.com/user/repo.git
    const url = new URL(repoUrl);
    url.username = "x-access-token";
    url.password = token;
    return url.toString();
  }

  static async clone(repoUrl: string, cwd: string, token: string, branch = "main"): Promise<GitResult> {
    const authUrl = this.getAuthUrl(repoUrl, token);
    return this.exec(["clone", "-b", branch, authUrl, "."], cwd);
  }

  static async init(cwd: string): Promise<GitResult> {
    return this.exec(["init", "-b", "main"], cwd);
  }

  static async addRemote(cwd: string, token: string, repoUrl: string): Promise<GitResult> {
    const authUrl = this.getAuthUrl(repoUrl, token);
    // Remove if exists first to be safe?
    await this.exec(["remote", "remove", "origin"], cwd);
    return this.exec(["remote", "add", "origin", authUrl], cwd);
  }

  static async updateOrigin(cwd: string, token: string): Promise<GitResult> {
    const getUrl = await this.exec(["remote", "get-url", "origin"], cwd);
    if (!getUrl.success) return getUrl;

    try {
      const urlStr = getUrl.stdout.trim();
      // Handle potential existing auth
      const url = new URL(urlStr);
      url.username = "x-access-token";
      url.password = token;
      return this.exec(["remote", "set-url", "origin", url.toString()], cwd);
    } catch {
      return { success: false, stdout: "", stderr: "Invalid remote URL" };
    }
  }

  static async getGitInfo(cwd: string): Promise<{ remoteUrl: string | null; root: string | null }> {
    const remoteRes = await this.exec(["remote", "get-url", "origin"], cwd);
    const rootRes = await this.exec(["rev-parse", "--show-toplevel"], cwd);

    return {
      remoteUrl: remoteRes.success ? remoteRes.stdout.trim() : null,
      root: rootRes.success ? rootRes.stdout.trim() : null
    };
  }

  static async configUser(cwd: string, name: string, email: string): Promise<void> {
    await this.exec(["config", "user.name", name], cwd);
    await this.exec(["config", "user.email", email], cwd);
  }

  static async status(cwd: string): Promise<boolean> {
    // Check if there are changes
    const res = await this.exec(["status", "--porcelain"], cwd);
    return res.success && res.stdout.length > 0;
  }

  static async commitAndPush(cwd: string, message: string): Promise<GitResult> {
    await this.exec(["add", "."], cwd);
    const commit = await this.exec(["commit", "-m", message], cwd);
    if (!commit.success && !commit.stdout.includes("nothing to commit")) {
      return commit;
    }
    return this.exec(["push", "origin", "main"], cwd); // Force push to main
  }

  static async abortRebase(cwd: string): Promise<void> {
    await this.exec(["rebase", "--abort"], cwd);
  }

  static async pull(cwd: string): Promise<GitResult> {
    const res = await this.exec(["pull", "--rebase", "origin", "main"], cwd);
    if (!res.success) {
      // If rebase failed, abort triggers to return to clean state
      if (res.stderr.includes("conflict") || res.stdout.includes("conflict")) {
        await this.abortRebase(cwd);
        return {
          success: false,
          stdout: res.stdout,
          stderr: "Merge conflict detected. Rebase aborted to preserve local changes."
        };
      }
    }
    return res;
  }

  // Simple Lock Mechanism
  // stored in ~/.progy/locks/ or better just .git/progy.lock? 
  // Let's use ~/.progy because we want to lock the *process* across terminals/UI.
  // Actually, per-repo lock is better. .git/progy-sync.lock

  static getLockPath(cwd: string) {
    return join(cwd, ".git", "progy-sync.lock");
  }

  static async lock(cwd: string): Promise<boolean> {
    const lockFile = this.getLockPath(cwd);
    try {
      await stat(lockFile); // Check if exists
      return false; // File exists, locked
    } catch {
      // File does not exist, safe to lock
      await writeFile(lockFile, new Date().toISOString());
      return true;
    }
  }

  static async unlock(cwd: string): Promise<void> {
    const lockFile = this.getLockPath(cwd);
    try {
      await unlink(lockFile);
    } catch { }
  }
}
