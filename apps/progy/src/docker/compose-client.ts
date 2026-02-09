import { spawn } from "node:child_process";

export class DockerComposeClient {
  private executable: string = "docker";
  private isV2: boolean = true;
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.detectExecutable();
  }

  /**
   * Detects if we should use 'docker compose' (v2) or 'docker-compose' (v1).
   */
  private async detectExecutable() {
    try {
      // Check if 'docker compose' works
      const exit = await this.runCheck(["compose", "version"]);
      if (exit === 0) {
        this.executable = "docker";
        this.isV2 = true;
      } else {
        throw new Error("Not v2");
      }
    } catch {
      // Fallback
      this.executable = "docker-compose";
      this.isV2 = false;
    }
  }

  /**
   * Runs the compose stack.
   * Lifecycle: Up dependencies -> Run Service -> Down
   */
  async runService(
    composeFile: string,
    serviceName: string,
    command: string,
    env?: Record<string, string>
  ): Promise<{ exitCode: number, output: string }> {
    await this.readyPromise;

    // 1. Prepare Arguments
    // docker compose -f docker-compose.yml run --rm service "cmd"
    const args = [];
    if (this.isV2) args.push("compose");

    args.push("-f", composeFile);
    args.push("run", "--rm"); // Clean up container after run

    // Pass environment variables if needed
    if (env) {
      for (const [key, val] of Object.entries(env)) {
        args.push("-e", `${key}=${val}`);
      }
    }

    args.push(serviceName);
    args.push("sh", "-c", command);

    console.log(`🐳 Starting Compose Service: ${serviceName}...`);

    // 2. Execute
    let output = "";
    let exitCode = 0;

    try {
      const result = await new Promise<{ exitCode: number, output: string }>((resolve) => {
        const child = spawn(this.executable, args, { stdio: ["ignore", "pipe", "pipe"] });

        if (child.stdout) {
          child.stdout.on("data", d => { output += d.toString(); });
        }
        if (child.stderr) {
          child.stderr.on("data", d => { output += d.toString(); });
        }

        child.on("close", async (code) => {
          resolve({ exitCode: code || 0, output });
        });

        child.on("error", (err) => {
          resolve({ exitCode: 1, output: `Failed to spawn ${this.executable}: ${err.message}` });
        });
      });
      exitCode = result.exitCode;
      output = result.output;
    } finally {
      // 3. Cleanup
      await this.down(composeFile);
    }

    return { exitCode, output };
  }

  private async down(composeFile: string) {
    const args = [];
    if (this.isV2) args.push("compose");
    args.push("-f", composeFile, "down");

    // We don't care about output, but we await completion
    await new Promise<void>((resolve) => {
        const child = spawn(this.executable, args, { stdio: "ignore" });
        child.on("close", () => resolve());
        child.on("error", () => resolve()); // Ignore errors during cleanup
    });
  }

  private runCheck(args: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      const child = spawn("docker", args, {
        stdio: "ignore"
      });

      child.on("close", (code) => resolve(code || 0));
      child.on("error", (err) => reject(err));
    });
  }
}
