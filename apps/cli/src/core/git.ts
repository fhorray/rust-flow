import { spawn } from "node:child_process";
import { join } from "node:path";
import { writeFile, unlink, stat } from "node:fs/promises";

export interface GitResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export class GitUtils {
  static async exec(args: string[], cwd: string): Promise<GitResult> {
    return new Promise((resolve) => {
      const proc = spawn("git", args, {
        cwd,
        env: { ...process.env },
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

  static getAuthUrl(repoUrl: string, token?: string): string {
    if (!token) return repoUrl;
    try {
      const url = new URL(repoUrl);
      url.username = "x-access-token";
      url.password = token;
      return url.toString();
    } catch {
      return repoUrl;
    }
  }

  static async clone(repoUrl: string, cwd: string, token?: string, branch = "main"): Promise<GitResult> {
    const authUrl = this.getAuthUrl(repoUrl, token);
    return this.exec(["clone", "-b", branch, authUrl, "."], cwd);
  }

  static async init(cwd: string): Promise<GitResult> {
    return this.exec(["init", "-b", "main"], cwd);
  }

  static async sparseCheckout(cwd: string, paths: string[]): Promise<GitResult> {
    await this.exec(["config", "core.sparseCheckout", "true"], cwd);
    return this.exec(["sparse-checkout", "set", ...paths], cwd);
  }

  static async addRemote(cwd: string, token?: string, repoUrl?: string): Promise<GitResult> {
    if (!repoUrl) return { success: false, stdout: "", stderr: "Missing repoUrl" };
    const authUrl = this.getAuthUrl(repoUrl, token);
    await this.exec(["remote", "remove", "origin"], cwd);
    return this.exec(["remote", "add", "origin", authUrl], cwd);
  }

  static async updateOrigin(cwd: string, token: string): Promise<GitResult> {
    const getUrl = await this.exec(["remote", "get-url", "origin"], cwd);
    if (!getUrl.success) return getUrl;

    try {
      const urlStr = getUrl.stdout.trim();
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

  static async pull(cwd: string): Promise<GitResult> {
    const res = await this.exec(["pull", "--rebase", "origin", "main"], cwd);
    if (!res.success) {
      if (res.stderr.includes("conflict") || res.stdout.includes("conflict")) {
        await this.exec(["rebase", "--abort"], cwd);
        return {
          success: false,
          stdout: res.stdout,
          stderr: "Merge conflict detected. Rebase aborted to preserve local changes."
        };
      }
    }
    return res;
  }

  static getLockPath(cwd: string) {
    return join(cwd, ".git", "progy-sync.lock");
  }

  static async lock(cwd: string): Promise<boolean> {
    const lockFile = this.getLockPath(cwd);
    try {
      await stat(lockFile);
      return false;
    } catch {
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
