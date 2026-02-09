import { spawn, SpawnOptions } from "node:child_process";

export interface DockerRunOptions {
  cwd: string;
  command: string;
  env?: Record<string, string>;
  network?: string;
  tty?: boolean;
}

export interface DockerRunResult {
  exitCode: number;
  output: string;
  error?: string;
}

export class DockerClient {
  /**
   * Checks if Docker is installed and running.
   * Returns true if `docker info` succeeds.
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const exitCode = await this.runCommand(["info"], { silent: true });
      return exitCode === 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Builds the image from the given context directory and Dockerfile.
   * Streams output to stdout so the user sees progress.
   */
  async buildImage(tag: string, contextPath: string, dockerfilePath: string): Promise<void> {
    console.log(`📦 Building environment image: ${tag}...`);
    console.log(`   Context: ${contextPath}`);
    console.log(`   Dockerfile: ${dockerfilePath}`);

    // 'inherit' allows the user to see the build steps in real-time
    const exitCode = await this.runCommand(
      ["build", "-t", tag, "-f", dockerfilePath, contextPath],
      { stdio: "inherit" }
    );

    if (exitCode !== 0) {
      throw new Error(`Docker build failed with code ${exitCode}. Please check the Dockerfile.`);
    }
    console.log(`✅ Environment built successfully.`);
  }

  /**
   * Checks if an image exists locally.
   * Used to skip rebuilding if not necessary.
   */
  async imageExists(tag: string): Promise<boolean> {
    try {
      const exitCode = await this.runCommand(["inspect", "--type=image", tag], { silent: true });
      return exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Runs a container with the current directory mounted.
   * This is the core execution logic.
   */
  async runContainer(
    tag: string,
    opts: DockerRunOptions
  ): Promise<DockerRunResult> {
    // When using spawn without shell: true, we should not quote the paths manually.
    // Node.js handles the argument passing to the executable.
    const mountArg = `${opts.cwd}:/workspace`;

    const args = [
      "run",
      "--rm",                  // Cleanup container after run
      "--network", opts.network || "none", // Security: No internet access by default
      "-v", mountArg,          // Mount code read-write
      "-w", "/workspace",      // Set working directory
      "--cpus=2",              // Limit CPU (Safety)
      "--memory=2g",           // Limit RAM (Safety)
    ];

    if (opts.tty) {
      args.push("-t");
    }

    // Inject Environment Variables
    if (opts.env) {
      for (const [key, val] of Object.entries(opts.env)) {
        args.push("-e", `${key}=${val}`);
      }
    }

    args.push(tag);

    // Command to run (using sh -c to allow chaining)
    args.push("sh", "-c", opts.command);

    let output = "";

    return new Promise((resolve) => {
      // We pipe output to capture it for the SRP result
      const child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });

      if (child.stdout) {
          child.stdout.on("data", (d) => { output += d.toString(); });
      }
      if (child.stderr) {
          child.stderr.on("data", (d) => { output += d.toString(); });
      }

      child.on("close", (code) => {
        resolve({ exitCode: code || 0, output });
      });

      child.on("error", (err) => {
        resolve({ exitCode: 1, output: `Failed to spawn docker: ${err.message}`, error: err.message });
      });
    });
  }

  /**
   * Helper to execute docker commands.
   */
  private runCommand(args: string[], options: { silent?: boolean, stdio?: "inherit" | "pipe" | "ignore" } = {}): Promise<number> {
    return new Promise((resolve, reject) => {
      const child = spawn("docker", args, {
        stdio: options.stdio || (options.silent ? "ignore" : "pipe"),
        shell: true // Helpful for Windows in some cases, but checkAvailability needs it?
      });

      child.on("close", (code) => resolve(code || 0));
      child.on("error", (err) => reject(err));
    });
  }
}
