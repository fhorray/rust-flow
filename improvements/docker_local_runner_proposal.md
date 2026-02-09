# Local Docker Runner Proposal

## 1. Introduction

As Progy evolves from simple single-file exercises to complex, project-based learning, the execution environment requirements become more sophisticated. While the **Cloudflare Container Runner** (proposed in `docs/cloudflare_runner_proposal.md`) is excellent for standard, stateless execution, there are scenarios where it falls short:

1.  **Complex Custom Environments**: Instructors may need very specific system libraries (e.g., `libssl-dev`, `ffmpeg`, legacy COBOL compilers, specific CUDA versions) that are not present in the standard Progy cloud runners.
2.  **Offline Learning**: Students in low-bandwidth environments need a way to run complex projects without round-tripping to the cloud for every test execution.
3.  **Cost Efficiency**: Heavy compilation jobs (e.g., C++, Rust release builds) or long-running integration tests are expensive to host on Cloudflare Containers, especially for free-tier users.
4.  **Database Integration**: Advanced courses often require sidecar services like PostgreSQL, Redis, or Kafka for integration testing.

This document proposes a **Local Docker Runner** strategy. In this model, the `progy` CLI orchestrates a Docker container running directly on the student's machine. The instructor provides a `Dockerfile`, and the student's machine builds and runs it.

---

## 2. Architecture Overview

Unlike the Remote Runner, which involves the Backend API, the Local Docker Runner is entirely client-side. The CLI acts as a bridge between the student's code and the local Docker daemon.

### Components

1.  **Instructor Config (`course.json`)**: Specifies that the course requires a local Docker environment and points to the `Dockerfile`.
2.  **Progy CLI (`apps/progy`)**:
    *   **DockerClient**: A wrapper around the `docker` command-line tool. It manages process spawning, I/O streaming, and error handling.
    *   **ImageManager**: Handles building and caching the instructor's image. It detects changes to the Dockerfile to trigger rebuilds.
    *   **ContainerRunner**: Mounts the student's code into the container, sets up environment variables, and executes tests.
3.  **Student Machine**: Must have Docker Desktop (or Colima/Podman) installed and running.

### Workflow

```mermaid
sequenceDiagram
    participant Student
    participant CLI as Progy CLI
    participant Docker as Local Docker Daemon

    Student->>CLI: progy run
    CLI->>CLI: Read course.json (type: "docker-local")
    CLI->>Docker: docker version (Check availability)

    rect rgb(200, 220, 240)
        Note over CLI, Docker: Image Build Phase (Once / Cached)
        CLI->>Docker: docker build -t progy/course-123 .
        Docker-->>CLI: Build Logs... Success
    end

    rect rgb(220, 240, 200)
        Note over CLI, Docker: Execution Phase
        CLI->>Docker: docker run -v $(pwd):/workspace progy/course-123 "cargo test"
        Docker->>Docker: Execute Command
        Docker-->>CLI: Exit Code + Output
    end

    CLI-->>Student: Display Result
```

---

## 3. Instructor Experience

The goal is to give instructors full control over the environment without requiring them to submit Pull Requests to the Progy platform. This empowers creators to build courses on niche technologies.

### 3.1 `course.json` Configuration

The instructor adds a `runner` configuration of type `docker-local`. This tells the CLI to look for a Dockerfile instead of using the cloud runner.

```json
{
  "id": "advanced-backend-go",
  "title": "Microservices with Go",
  "runner": {
    "type": "docker-local",

    // Path to the Dockerfile relative to the course root
    // Default is "./Dockerfile" if omitted.
    "dockerfile": "env/Dockerfile",

    // Optional: Name for the image to avoid collisions.
    // If omitted, CLI generates `progy-course-{id}`.
    "image_tag": "progy-course-go-advanced",

    // Command to run inside the container.
    // This is the default command, but specific exercises can override it.
    "command": "go test ./..."
  }
}
```

### 3.2 The `Dockerfile` Examples

The instructor includes a standard Dockerfile in their course repository. Here are examples for complex environments.

#### Example A: C++ with Boost and CMake
A classic example where dependency management is painful on students' machines (Windows vs Mac vs Linux). Docker solves this perfectly.

```dockerfile
# env/cpp-boost/Dockerfile
FROM ubuntu:22.04

# Install build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    git \
    gdb

# Set up user (Best Practice: Don't run as root)
RUN useradd -m student
WORKDIR /workspace
RUN chown student:student /workspace

# Switch to student user
USER student

# Default command
CMD ["ctest", "--output-on-failure"]
```

#### Example B: Python with System Dependencies (e.g., Audio Processing)
Installing `ffmpeg` or `portaudio` is notoriously difficult across platforms.

```dockerfile
# env/python-audio/Dockerfile
FROM python:3.11-slim

# Install system libraries
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libportaudio2 \
    libsndfile1

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

WORKDIR /workspace
CMD ["pytest"]
```

#### Example C: Legacy Environment (COBOL)
Teaching legacy systems often requires old compilers that don't run on modern OSes.

```dockerfile
# env/cobol/Dockerfile
FROM debian:buster-slim

# Install GnuCOBOL
RUN apt-get update && apt-get install -y open-cobol

WORKDIR /workspace
CMD ["cobc", "-x", "-o", "program", "main.cob", "&&", "./program"]
```

### 3.3 Setup Instructions (`SETUP.md`)

The instructor should update the course's `SETUP.md` to inform students:
> "This course requires Docker. Please install Docker Desktop before starting. Progy will automatically build the environment for you."

---

## 4. CLI Implementation Plan (`apps/progy`)

We need to add a robust Docker management layer to the CLI. This involves interacting with the system `docker` command, handling errors gracefully, and managing the lifecycle of containers.

### 4.1 `src/docker/client.ts`

This class wraps the `docker` executable. We spawn child processes instead of using the Docker API via socket/HTTP to avoid complexity with different OS setups (Windows Named Pipes vs Unix Sockets). This "Shell Out" approach is robust and works wherever the CLI works.

```typescript
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
    // Determine mount path format based on OS
    // Windows paths (C:\Users\...) need conversion for some Docker setups,
    // but modern Docker Desktop handles "C:/Users/..." correctly.
    const mountArg = process.platform === "win32"
      ? `"${opts.cwd}":/workspace`
      : `${opts.cwd}:/workspace`;

    const args = [
      "run",
      "--rm",                  // Cleanup container after run
      "--network", opts.network || "none", // Security: No internet access by default
      "-v", mountArg,          // Mount code read-write
      "-w", "/workspace",      // Set working directory
      "--cpus=2",              // Limit CPU (Safety)
      "--memory=2g",           // Limit RAM (Safety)
    ];

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
      // We pipe output to capture it for the SRP result,
      // but we ALSO want to stream it to the user's terminal?
      // For now, let's capture it.
      const child = spawn("docker", args);

      child.stdout.on("data", (d) => { output += d.toString(); });
      child.stderr.on("data", (d) => { output += d.toString(); });

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
        shell: true // Helpful for Windows
      });

      child.on("close", (code) => resolve(code || 0));
      child.on("error", (err) => reject(err));
    });
  }
}
```

### 4.2 Integration in `exercises.ts`

We modify the `runHandler` in `apps/progy/src/backend/endpoints/exercises.ts` to support the new mode. We check the `runner.type` and delegate to the `DockerClient` if it matches `docker-local`.

```typescript
import { DockerClient } from "../../../docker/client"; // Path to new file
import { join } from "node:path";

// ... existing imports ...

const runHandler: ServerType<"/exercises/run"> = async (req) => {
  await ensureConfig();

  // New Branch: Local Docker Execution
  if (currentConfig?.runner.type === "docker-local") {
     return await handleDockerLocalExecution(currentConfig, req);
  }

  // ... existing logic (Remote or Local Spawn) ...
};

async function handleDockerLocalExecution(config: any, req: any) {
  const docker = new DockerClient();

  // 1. Check Docker Availability
  if (!(await docker.checkAvailability())) {
    return Response.json({
      success: false,
      output: "❌ Docker is not running.\n\nThis course requires Docker Desktop. Please start Docker and try again.\nInstall info: https://docs.docker.com/get-docker/"
    });
  }

  // 2. Prepare Image Configuration
  const imageTag = config.runner.image_tag || `progy-course-${config.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const dockerfileRelative = config.runner.dockerfile || "Dockerfile";
  const dockerfileAbs = join(PROG_CWD, dockerfileRelative);

  // 3. Build Image (if needed)
  // Optimization: Only build if not exists.
  // Ideally, we should check file mtime or hash of Dockerfile, but existence check is a good MVP.
  // We can add a `--rebuild` flag to the CLI later.
  if (!(await docker.imageExists(imageTag))) {
    try {
      await docker.buildImage(imageTag, PROG_CWD, dockerfileAbs);
    } catch (e) {
       return Response.json({ success: false, output: `❌ Failed to build Docker environment:\n${e.message}` });
    }
  }

  // 4. Run Container
  // The command is taken from course.json (default) or the specific exercise if we support overriding.
  const command = config.runner.command || "echo 'No command configured'";

  const result = await docker.runContainer(
    imageTag,
    {
        cwd: PROG_CWD,
        command: command,
        network: config.runner.network_access ? "bridge" : "none" // Allow instructor to request network
    }
  );

  // 5. Format Result
  // We wrap the output in a markdown block for the frontend.
  // We also try to parse SRP 2.0 JSON if the instructor's image outputs it.

  return Response.json({
    success: result.exitCode === 0,
    output: result.output,
    friendlyOutput: `## Docker Execution Result\n\n\`\`\`\n${result.output}\n\`\`\``
  });
}
```

---

## 5. Security Considerations & Mitigations

Running local Docker containers is generally safer than running bare-metal commands (shell out), but it still carries risks since the instructor controls the image.

### 5.1 Host System Access
**Risk**: A malicious Dockerfile could try to mount sensitive host paths if the CLI allowed arbitrary arguments.
**Mitigation**: The CLI strictly controls the `docker run` arguments. We **ONLY** mount `$(pwd):/workspace`. We do NOT allow the instructor to specify other volume mounts in `course.json`. The user's home directory, SSH keys, etc., remain inaccessible.

### 5.2 Resource Exhaustion (DoS)
**Risk**: A container could consume all CPU/RAM, freezing the user's machine (Fork bomb).
**Mitigation**: We apply default limits to every container run:
*   `--cpus=2`: Limits the container to 2 CPU cores.
*   `--memory=2g`: Limits RAM to 2GB.
*   `--pids-limit=100`: Prevents fork bombs by limiting the number of processes.

### 5.3 Network Scanning
**Risk**: A container could scan the user's local network (e.g., `192.168.1.1`).
**Mitigation**:
*   **Default Policy**: Network is disabled (`--network none`).
*   **Opt-in**: Instructors must explicitly set `"network_access": true` in `course.json`.
*   **User Warning**: If network is enabled, the CLI prints a warning before running: "⚠️ This exercise requires network access."

### 5.4 Privilege Escalation
**Risk**: Container running as root (default).
**Mitigation**: While root inside a container is namespaced, it's better practice to run as a user. We should encourage instructors (via docs/linters) to add `USER student` in their Dockerfiles. We can't strictly enforce this without breaking many images, but we can print a warning if `whoami` returns root.

---

## 6. Advanced Feature: Database Integration (Docker Compose)

For a "PostgreSQL Course", a single container isn't enough. We need a DB sidecar. We can support `docker-compose` via the same `runner` config.

### 6.1 Instructor Config
```json
{
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "app_test"
  }
}
```

### 6.2 `docker-compose.yml` (Provided by Instructor)
```yaml
version: '3.8'
services:
  # Database Service
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: testdb
    ports:
      - "5432" # Ephemeral port mapping

  # The Test Runner Service
  app_test:
    build: .
    volumes:
      - .:/workspace
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://postgres:password@db:5432/testdb
    command: go test ./...
```

### 6.3 Detailed Docker Compose Logic (`DockerComposeClient`)

We need a dedicated client to handle the complexities of `docker-compose`.

```typescript
// src/docker/compose-client.ts
import { spawn } from "node:child_process";

export class DockerComposeClient {
  private executable: string = "docker";
  private isV2: boolean = true;

  constructor() {
    this.detectExecutable();
  }

  /**
   * Detects if we should use 'docker compose' (v2) or 'docker-compose' (v1).
   */
  private async detectExecutable() {
    try {
      const exit = await this.run(["compose", "version"], true);
      if (exit === 0) {
        this.executable = "docker";
        this.isV2 = true;
      } else {
        this.executable = "docker-compose";
        this.isV2 = false;
      }
    } catch {
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
    command: string
  ): Promise<{ exitCode: number, output: string }> {

    // 1. Prepare Arguments
    // docker compose -f docker-compose.yml run --rm --service-ports service "cmd"
    const args = [];
    if (this.isV2) args.push("compose");

    args.push("-f", composeFile);
    args.push("run", "--rm");

    // Pass environment variables if needed
    // args.push("-e", "CI=true");

    args.push(serviceName);
    args.push("sh", "-c", command);

    console.log(`🐳 Starting Compose Service: ${serviceName}...`);

    // 2. Execute
    let output = "";
    return new Promise((resolve) => {
      const child = spawn(this.executable, args, { stdio: ["ignore", "pipe", "pipe"] });

      child.stdout.on("data", d => { output += d; process.stdout.write(d); });
      child.stderr.on("data", d => { output += d; process.stderr.write(d); });

      child.on("close", async (code) => {
        // 3. Cleanup (Optional: docker compose down)
        // If the user wants to inspect the DB after failure, maybe we don't down?
        // For now, let's keep it clean.
        await this.down(composeFile);

        resolve({ exitCode: code || 0, output });
      });
    });
  }

  private async down(composeFile: string) {
    const args = [];
    if (this.isV2) args.push("compose");
    args.push("-f", composeFile, "down");
    await new Promise(r => {
        const c = spawn(this.executable, args);
        c.on("close", r);
    });
  }

  // ... run helper ...
  private async run(args: string[], silent: boolean): Promise<number> {
      // Implementation similar to DockerClient
      return 0;
  }
}
```

---

## 7. Troubleshooting Guide

When things go wrong, the CLI needs to give helpful advice.

### 7.1 "Docker not found" on Windows
*   **Symptom**: `progy run` fails with "Docker is not running".
*   **Cause**: Docker Desktop is not installed or not in `%PATH%`.
*   **Fix**: Reinstall Docker Desktop. Ensure the "Expose daemon on tcp://localhost:2375 without TLS" option is NOT needed (we use CLI). Ensure WSL 2 integration is enabled if using WSL.

### 7.2 "Volume Mount Failed" on Mac
*   **Symptom**: `docker: Error response from daemon: Mounts denied...`
*   **Cause**: The project directory is not in "File Sharing" list in Docker settings.
*   **Fix**: Open Docker Dashboard -> Settings -> Resources -> File Sharing. Add the parent folder of your projects (e.g., `/Users/username/ProgyCourses`).

### 7.3 "Exec format error" (M1/M2 Chips)
*   **Symptom**: Container crashes immediately with "exec format error".
*   **Cause**: The instructor's Dockerfile uses `FROM some-image` that doesn't support ARM64 (Apple Silicon), or installs an `x86_64` binary.
*   **Fix**: Instructors should use multi-arch base images (official images like `python`, `node`, `golang` usually support both `amd64` and `arm64`). If binary dependencies are needed, the Dockerfile needs conditional logic.

### 7.4 "Port Already Allocated"
*   **Symptom**: (Docker Compose) "Bind for 0.0.0.0:5432 failed: port is already allocated".
*   **Cause**: The student has a local Postgres running on their machine.
*   **Fix**: Instructors should NOT bind host ports in `docker-compose.yml` unless necessary. Use internal networking. If needed, use ephemeral ports (`"5432"` instead of `"5432:5432"`).

---

## 8. Cross-Platform Nuances

Running Docker locally involves navigating OS differences.

### 8.1 Windows (WSL 2 vs Hyper-V)
*   **Recommendation**: Users should use WSL 2 backend for Docker Desktop.
*   **Path Issue**: Windows paths `C:\Users\Bob\Project` must be mounted carefully. The `docker` CLI in PowerShell usually handles `$(pwd)` correctly, but in Node.js `spawn`, we might need to convert to `/c/Users/Bob/Project` style if using a MinGW shell, or standard format if using CMD.
*   **Performance**: Filesystem performance across the Windows/Linux boundary (mounting `/mnt/c`) is slow. For heavy IO, users should clone the repo *inside* WSL 2.

### 8.2 MacOS (Colima vs Docker Desktop)
*   **Docker Desktop**: Uses `virtiofs` for fast file sharing. Standard recommendation.
*   **Colima**: Uses `sshfs` or `virtiofs`. Mounting can be tricky.
*   **OrbStack**: High performance alternative. Fully compatible with `docker` CLI.

### 8.3 Linux (Permissions)
*   **Issue**: On Linux, Docker runs as root. Files created by the container in the mounted volume will be owned by root (`uid=0`). The user won.t be able to edit them.
*   **Fix**: We must pass the user's UID/GID to the container.
    *   CLI: `args.push("-u", `${process.getuid()}:${process.getgid()}`)`
    *   Instructor: The Dockerfile needs an `ENTRYPOINT` script that creates a user with that UID dynamically, or simply runs as the passed UID if the base image supports it.

---

## 9. Detailed Example Courses

To prove the viability of this model, here are three complete example configurations for advanced courses.

### 9.1 Scenario 1: Full Stack React + Node + Mongo

This setup allows students to run integration tests against a real MongoDB.

**File Structure:**
```
course-root/
  ├── docker-compose.yml
  ├── server/
  │   ├── Dockerfile
  │   └── ...
  ├── client/
  └── ...
```

**`course.json`:**
```json
{
  "id": "mern-stack-pro",
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "backend-tests"
  }
}
```

**`docker-compose.yml`:**
```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

  backend-tests:
    build: ./server
    environment:
      MONGO_URI: mongodb://root:example@mongo:27017/test
    volumes:
      - ./server:/app
    depends_on:
      - mongo
    command: npm test
```

### 9.2 Scenario 2: Rust with Custom C Bindings (FFI)

This course teaches how to wrap a C library (libgit2) in Rust.

**`course.json`:**
```json
{
  "id": "rust-ffi-libgit2",
  "runner": {
    "type": "docker-local",
    "dockerfile": "env/Dockerfile",
    "command": "cargo test"
  }
}
```

**`env/Dockerfile`:**
```dockerfile
FROM rust:1.75-slim

# Install libgit2 system library and dev headers
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libgit2-dev \
    gcc

WORKDIR /workspace
```

### 9.3 Scenario 3: Data Science (Jupyter/Python)

This setup allows running heavy pandas/numpy jobs that might OOM a cloud runner.

**`course.json`:**
```json
{
  "id": "pandas-analytics",
  "runner": {
    "type": "docker-local",
    "command": "python3 verify_analysis.py"
  }
}
```

**`Dockerfile`:**
```dockerfile
FROM python:3.10-slim

# Install heavy data science libs (cached layer)
RUN pip install --no-cache-dir pandas numpy scipy matplotlib scikit-learn

WORKDIR /workspace
# Pre-create data directory
RUN mkdir -p /workspace/data
```

---

## 10. Detailed CLI Logic: `ImageManager`

We need intelligent caching to avoid rebuilding images constantly.

### `src/docker/image-manager.ts`

```typescript
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { DockerClient } from "./client";

export class ImageManager {
  private docker: DockerClient;

  constructor() {
    this.docker = new DockerClient();
  }

  /**
   * Ensures the image is built and up-to-date.
   * Uses a hash of the Dockerfile + context folder mtime to invalidate cache.
   */
  async ensureImage(tag: string, contextPath: string, dockerfileRel: string): Promise<void> {
    const dockerfileAbs = join(contextPath, dockerfileRel);

    // 1. Check if image exists
    const exists = await this.docker.imageExists(tag);
    if (!exists) {
      console.log("Image not found locally. Building...");
      await this.docker.buildImage(tag, contextPath, dockerfileAbs);
      return;
    }

    // 2. Advanced: Check for staleness (Optional)
    // We can store a metadata hash in a label on the image.
    // docker inspect --format '{{ index .Config.Labels "progy.hash" }}' tag
    // For MVP, we skip this complexity and assume if it exists, it's good.
    // Instructors can tell students to run `progy clean` or `docker rmi` to force rebuild.
  }

  /**
   * Generates a unique tag based on course ID and version.
   */
  generateTag(courseId: string): string {
    // Sanitize ID
    const safeId = courseId.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return `progy-course-${safeId}:latest`;
  }
}
```

---

## 11. Security & Trust Model

The CLI must establish trust before running arbitrary code.

### 11.1 The "First Run" Prompt

When `progy run` detects a `docker-local` configuration for the first time for a specific course ID:

```text
PROGY SECURITY ALERT
====================

The course "Advanced Rust FFI" requires running a local Docker container.
This container is defined by the course author and will run on your machine.

Container Image: progy-course-rust-ffi
Permissions:
  - Read/Write access to: /Users/alice/progy/rust-ffi
  - Network Access: DISABLED
  - CPU Limit: 2 Cores

Do you trust this course? [y/N]
```

If the user says 'y', we write to `~/.progy/trusted_courses.json`:

```json
{
  "rust-ffi-libgit2": {
    "trusted_at": "2024-02-10T12:00:00Z",
    "image_hash": "sha256:..."
  }
}
```

### 11.2 Revoking Trust
Users can run `progy trust --revoke rust-ffi-libgit2` to clear this entry.

---

## 12. Instructor Best Practices Guide

Writing Dockerfiles for education is slightly different from production.

### 12.1 Keep Layers Small
Students might be on slow internet.
*   **BAD**: `COPY . .` at the top. This invalidates cache on every code change.
*   **GOOD**: Install dependencies first, then `COPY . .` (or rely on volume mounting for code).

### 12.2 Use Multi-Stage Builds
If teaching Go or Rust, use a multi-stage build to keep the final image small if you are distributing it. However, for a *dev environment* (which is what we are building), we often want the toolchain (compilers) present. So actually, **single stage** with tools is better for this use case.

### 12.3 Debugging Student Issues
If a student reports "It works on my machine but not in Progy":
1.  Ask them to run `progy run --verbose`.
2.  Check if they modified the `Dockerfile` locally (Progy checksums it?).
3.  Ask them to run `docker run -it progy-course-X bash` to enter the shell and debug manually.

---

## 13. Offline Mode & Caching

One of the big selling points of Local Docker is offline support.

### 13.1 Pre-caching Images
The first `progy run` requires internet to pull the base image (e.g., `ubuntu:22.04`).
After that, everything works offline.

### 13.2 "Progy Save" in Offline Mode
When a user runs `progy save` offline:
1.  We commit to the local git repo.
2.  We queue the "Sync to Cloud" action.
3.  The next time `progy` detects internet, it pushes the progress.

This allows a student to code on a plane, run tests in Docker, commit progress, and sync later.

---

## 14. Deep Dive: Volume Mounting & Filesystem

Mapping files from the host to the container is the source of 90% of Docker bugs.

### 14.1 The Mount Map
We use a simple 1:1 mapping:
`HOST: $(pwd)` -> `CONTAINER: /workspace`

### 14.2 The `.gitignore` Problem
If a student has `node_modules` on their host (built for Mac ARM64) and mounts it into a Linux container (AMD64 or Linux ARM64), binary incompatibilities occur.

*   **Solution**: We cannot easily filter mounts.
*   **Workaround**: Instructors should configure the container to use a separate path for dependencies, or students must run `npm install` *inside* the container context.
    *   *Option A*: The CLI runs `npm install` inside the container before tests.
    *   *Option B*: Use "Docker Volumes" for `node_modules` to mask the host folder.
        *   `docker run -v $(pwd):/workspace -v /workspace/node_modules ...` (This creates an anonymous volume hiding the host's folder).

### 14.3 Monitoring File Events
In `progy dev` mode (watch mode), we need to trigger the runner on file changes.
Since the runner is just a `docker run` command, the existing `chokidar` watcher in Progy CLI works perfectly. It detects a change on the host, and fires the Docker command.

---

## 15. Container Lifecycle & Zombie Processes

What happens if the user presses `Ctrl+C` while a container is running?

### 15.1 Signal Propagation
Node.js intercepts `SIGINT`. We must forward this to the Docker process.
`spawn` usually handles this, but Docker containers might take time to stop.

```typescript
// CLI Logic
process.on('SIGINT', async () => {
  console.log("Stopping container...");
  await docker.stopContainer(containerId); // docker kill
  process.exit();
});
```

### 15.2 The `--rm` Flag
We always use `docker run --rm`. This ensures that when the main process exits, the container is removed. This prevents disk usage bloat from thousands of stopped containers.

---

## 16. Migration Guide: From Shell to Docker

For instructors moving existing courses.

### 16.1 Python Example
**Before (Shell Out):**
*   `runner.command`: "python3 test.py"
*   Student Requirement: "Please install Python 3.8 and these 5 pip packages..." (Error prone).

**After (Docker Local):**
*   `runner.type`: "docker-local"
*   `Dockerfile`:
    ```dockerfile
    FROM python:3.8
    RUN pip install requests pandas
    ```
*   Student Requirement: "Install Docker." (Reliable).

### 16.2 Telemetry for Local Runs
Even though execution is local, we want to know if students are passing.

1.  **CLI Capture**: The `progy` CLI captures the exit code (0 = Pass).
2.  **Queue**: Adds `{ exercise: "ex1", status: "pass", timestamp: 123 }` to a local queue.
3.  **Sync**: When `progy save` runs (or background sync), this telemetry is pushed to `api.progy.dev/telemetry`.

---

## 17. Future Roadmap

Where do we go from here?

### 17.1 Dev Containers Support
VS Code's `.devcontainer` standard is excellent.
*   **Idea**: If `progy` detects `.devcontainer/devcontainer.json`, it parses it and uses *that* image instead of a custom `Dockerfile`.
*   **Benefit**: Users can open the same project in VS Code and Progy without duplication.

### 17.2 Kubernetes Support
For enterprise training ("Deploying to K8s"), we could support running `kind` or `minikube` via the CLI.
*   This is complex but powerful.

### 17.3 Community Runner Marketplace
Instructors shouldn't have to write Dockerfiles from scratch.
*   `progy/runner-python-ds`
*   `progy/runner-rust-embedded`
*   `progy/runner-react-fullstack`
We can host these images on Docker Hub and let instructors reference them: `"image": "progy/runner-python-ds:v1"`.

---

## 18. FAQ

### Can I use Podman instead of Docker?
**Yes**, theoretically. If `podman` provides a `docker` alias that accepts standard flags (`-v`, `--rm`), it should work out of the box. We might need a config flag `runner.binary = "podman"`.

### Does this work on Raspberry Pi?
**Yes**, provided the instructor's Dockerfile supports `linux/arm64` (or `arm/v7`). Most official images do. This is great for "IoT" courses where the Pi is the student machine.

### What about "Docker inside Docker" (DinD)?
For courses teaching Docker itself, we can mount the docker socket:
`-v /var/run/docker.sock:/var/run/docker.sock`.
*   **Warning**: This gives the container full root access to the host. We must hide this behind a specific flag `"unsafe_privileged": true`.

---

## 19. Example Error Messages (CLI Mocks)

A good DX means clear errors.

### Build Failure
```
$ progy run
📦 Building environment image: progy-course-cpp...
[+] Building 0.2s (5/6)
 => [internal] load build definition from Dockerfile
 => ...
 => [2/3] RUN apt-get install -y libboost-all-dev
 => ERROR [3/3] RUN make install
------
 > [3/3] RUN make install:
#6 0.123 make: *** No rule to make target 'install'.  Stop.
------
❌ Failed to build Docker environment:
Docker build failed with code 1. Please check the Dockerfile at ./env/Dockerfile.
```

### Runtime Crash (Segfault)
```
$ progy run
🚀 Running tests...
 Segmentation fault (core dumped)
❌ Process exited with code 139 (SIGSEGV).
Your C++ code accessed invalid memory. Check your pointers!
```

---

## 20. Comparison: Cloudflare Runner vs. Local Docker Runner

Why support both? Because they serve different needs.

| Feature | Cloudflare Container Runner (Remote) | Local Docker Runner |
| :--- | :--- | :--- |
| **Primary Use Case** | Standard Languages, Quick Feedback, Beginners | Complex Envs, Databases, Advanced Projects |
| **Setup Required** | **Zero** (Just `progy run`) | **High** (Install Docker Desktop) |
| **Performance** | Fast Execution, Slow Cold Start | Slow First Build, Fast Subsequent Runs |
| **Offline Support** | No (Requires Internet) | **Yes** (After build) |
| **Cost** | Cloud Provider Cost (Progy pays) | Free (User Hardware) |
| **Security** | **High** (Remote Sandbox) | **Medium** (Local Isolation, relies on trust) |
| **Persistence** | Ephemeral (Wiped after run) | Persistent (Docker Volumes / Local FS) |
| **OS Compatibility** | Universal (Web Browser / CLI) | Depends on Docker Host (Linux/Mac/Win) |

By implementing both, Progy covers the full spectrum of coding education: from "Hello World" in Python (Cloud) to "Building a Video Transcoder" in C++ or "Deploying a Kubernetes Cluster" (Local Docker).

## 21. Conclusion

The **Local Docker Runner** is a necessary evolution for Progy to support advanced, professional-grade software engineering courses. While it introduces higher friction (Docker installation), the benefits of full environment control, offline capability, and zero cloud costs for heavy workloads make it an essential feature for the platform's growth. The architecture proposed here reuses the existing CLI structure while adding a secure, robust container orchestration layer.
