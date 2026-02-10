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

  /**
   * Gets the authenticated repository URL
   * @param repoUrl The repository URL to authenticate
   * @param token The authentication token
   * @returns The authenticated repository URL
   */
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

  /**
   * Clones a repository
   * @param repoUrl The repository URL to clone
   * @param cwd The directory to clone into
   * @param token The authentication token
   * @param branch The branch to clone
   * @returns The result of the clone operation
   */
  static async clone(repoUrl: string, cwd: string, token?: string, branch = "main"): Promise<GitResult> {
    const authUrl = this.getAuthUrl(repoUrl, token);
    return this.exec(["clone", "-b", branch, authUrl, "."], cwd);
  }

  /**
   * Initializes a new git repository
   * @param cwd The directory to initialize
   * @returns The result of the init operation
   */
  static async init(cwd: string): Promise<GitResult> {
    return this.exec(["init", "-b", "main"], cwd);
  }

  /**
   * Sets up sparse checkout
   * @param cwd The directory to set up sparse checkout
   * @param paths The paths to checkout
   * @returns The result of the sparse checkout operation
   */
  static async sparseCheckout(cwd: string, paths: string[]): Promise<GitResult> {
    await this.exec(["config", "core.sparseCheckout", "true"], cwd);
    return this.exec(["sparse-checkout", "set", ...paths], cwd);
  }

  /**
   * Adds a remote repository
   * @param cwd The directory to add the remote to
   * @param token The authentication token
   * @param repoUrl The repository URL to add
   * @returns The result of the add remote operation
   */
  static async addRemote(cwd: string, token?: string, repoUrl?: string): Promise<GitResult> {
    if (!repoUrl) return { success: false, stdout: "", stderr: "Missing repoUrl" };
    const authUrl = this.getAuthUrl(repoUrl, token);
    await this.exec(["remote", "remove", "origin"], cwd);
    return this.exec(["remote", "add", "origin", authUrl], cwd);
  }

  /**
   * Updates the remote repository URL
   * @param cwd The directory to update the remote for
   * @param token The authentication token
   * @returns The result of the update remote operation
   */
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

  /**
   * Gets the remote repository URL and the root directory
   * @param cwd The directory to get the remote and root for
   * @returns The remote repository URL and the root directory
   */
  static async getGitInfo(cwd: string): Promise<{ remoteUrl: string | null; root: string | null }> {
    const remoteRes = await this.exec(["remote", "get-url", "origin"], cwd);
    const rootRes = await this.exec(["rev-parse", "--show-toplevel"], cwd);

    return {
      remoteUrl: remoteRes.success ? remoteRes.stdout.trim() : null,
      root: rootRes.success ? rootRes.stdout.trim() : null
    };
  }

  /**
   * Configures the user name and email
   * @param cwd The directory to configure the user for
   * @param name The user name
   * @param email The user email
   */
  static async configUser(cwd: string, name: string, email: string): Promise<void> {
    await this.exec(["config", "user.name", name], cwd);
    await this.exec(["config", "user.email", email], cwd);
  }

  /**
   * Pulls the latest changes from the remote repository
   * @param cwd The directory to pull from
   * @returns The result of the pull operation
   */
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

  /**
   * Gets the lock file path
   * @param cwd The directory to get the lock file for
   * @returns The lock file path
   */
  static getLockPath(cwd: string) {
    return join(cwd, ".git", "progy-sync.lock");
  }

  /**
   * Locks the repository
   * @param cwd The directory to lock
   * @returns Whether the lock was successful
   */
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

  /**
   * Unlocks the repository
   * @param cwd The directory to unlock
   */
  static async unlock(cwd: string): Promise<void> {
    const lockFile = this.getLockPath(cwd);
    try {
      await unlink(lockFile);
    } catch { }
  }

  /**
   * Adds a file to the staging area
   * @param cwd The directory to add the file to
   * @param path The path of the file to add
   * @returns The result of the add operation
   */
  static async add(cwd: string, path: string): Promise<GitResult> {
    return this.exec(["add", path], cwd);
  }

  /**
   * Commits the changes to the repository
   * @param cwd The directory to commit
   * @param message The commit message
   * @returns The result of the commit operation
   */
  static async commit(cwd: string, message: string): Promise<GitResult> {
    return this.exec(["commit", "-m", message], cwd);
  }
}
