# Cloudflare Containers Proposal for Secure Runner Execution

## Introduction

As outlined in `runner_improvements.md`, a critical goal for Progy is to implement a secure, sandboxed environment for executing student code. The current "Shell Out" strategy relies on local execution, which poses significant security risks (malicious code, resource exhaustion) and limits the platform's ability to offer a robust cloud-hosted experience.

This document provides an **exhaustive implementation guide** for utilizing **Cloudflare Containers** (currently in Beta) as the primary mechanism for secure, isolated code execution. It covers every layer of the stack: the internal container server (Go/Rust), the Docker build process, the Backend Worker configuration (TypeScript/Hono), and the CLI integration.

---

## 1. Architecture Overview (Recap)

The proposed architecture integrates Cloudflare Workers, Durable Objects, and Containers to create a secure execution pipeline.

1.  **Frontend (Web UI/CLI)**: Sends the student's code and exercise metadata to the backend API.
2.  **Backend API (Cloudflare Worker)**: Receives the execution request, validates it, and routes it to a specific Durable Object.
3.  **Durable Object (DO)**: Acts as the controller for a specific container instance. It manages the lifecycle (start, stop, monitor) and proxies requests.
4.  **Container (Cloudflare Container)**: A lightweight Docker container running a custom Go or Rust server (`runner-server`) that executes the student's code in a strictly isolated environment.

---

## 2. Detailed Implementation Plan: The Container (The Payload)

The core of this system is the `runner-server`. This is a lightweight HTTP server written in **Go** or **Rust** that runs *inside* the Docker container. It is responsible for receiving the code payload, writing it to disk, executing the test command, and capturing the output.

### 2.1 The Internal Server (Go Implementation)

We choose Go for its minimal memory footprint, fast startup, and strong standard library for process management.

**File Structure inside Container:**
```
/app/
  ├── runner-server (binary)
  └── workspace/ (writable directory for user code)
```

**Implementation (`runner-server/main.go`):**

```go
package main

import (
	"archive/zip"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// Config defines server settings
const (
	Port           = ":8080"
	WorkspaceDir   = "/app/workspace"
	MaxExecTime    = 10 * time.Second
	MaxOutputSize  = 100 * 1024 // 100KB
)

// RequestPayload represents the incoming execution request
type RequestPayload struct {
	Code     string `json:"code"`     // Deprecated: Use 'Content'
	Content  string `json:"content"`  // Base64 encoded ZIP file content
	IsZip    bool   `json:"isZip"`    // Flag to indicate if content is a zip file
	Language string `json:"language"`
	FileName string `json:"fileName"` // e.g., "main.rs" (used if not zip)
	TestCmd  string `json:"testCmd"`  // e.g., "cargo test"
}

// ResponsePayload represents the execution result
type ResponsePayload struct {
	Success  bool   `json:"success"`
	Output   string `json:"output"`   // Stdout + Stderr combined
	ExitCode int    `json:"exitCode"`
	Error    string `json:"error,omitempty"`
}

func main() {
	// 1. Setup Workspace
	if err := os.MkdirAll(WorkspaceDir, 0755); err != nil {
		log.Fatalf("Failed to create workspace: %v", err)
	}

	// 2. Define HTTP Handlers
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	http.HandleFunc("/execute", handleExecute)

	// 3. Start Server
	log.Printf("Runner Server starting on %s...", Port)
	if err := http.ListenAndServe(Port, nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func handleExecute(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1. Parse Request
	var payload RequestPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// Validate inputs to prevent command injection
	if payload.TestCmd == "" {
		http.Error(w, "Missing test command", http.StatusBadRequest)
		return
	}

	// 2. Prepare Workspace
	// We clean the workspace before every run to ensure isolation between requests
	if err := cleanWorkspace(); err != nil {
		jsonResponse(w, ResponsePayload{Success: false, Error: "Failed to clean workspace"})
		return
	}

	// Handle Payload: Zip (Project) or Single File (Simple Script)
	if payload.IsZip && payload.Content != "" {
		if err := extractZip(payload.Content, WorkspaceDir); err != nil {
			jsonResponse(w, ResponsePayload{Success: false, Error: fmt.Sprintf("Failed to extract zip: %v", err)})
			return
		}
	} else if payload.FileName != "" && (payload.Content != "" || payload.Code != "") {
		content := payload.Content
		if content == "" {
			content = payload.Code // Fallback for legacy clients
		}
		filePath := filepath.Join(WorkspaceDir, filepath.Clean(payload.FileName))
		if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
			jsonResponse(w, ResponsePayload{Success: false, Error: "Failed to write code file"})
			return
		}
	} else {
		http.Error(w, "Missing code content or zip payload", http.StatusBadRequest)
		return
	}

	// 3. Execute Command with Timeout
	ctx, cancel := context.WithTimeout(context.Background(), MaxExecTime)
	defer cancel()

	// Parse the command string (simplistic splitting for demo; usage of 'sh -c' might be needed for complex args)
	cmd := exec.CommandContext(ctx, "sh", "-c", payload.TestCmd)
	cmd.Dir = WorkspaceDir

	// Capture Output
	// We limit the output size to prevent memory exhaustion attacks
	outputPipe, _ := cmd.StdoutPipe()
	errorPipe, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		jsonResponse(w, ResponsePayload{Success: false, Error: fmt.Sprintf("Failed to start command: %v", err)})
		return
	}

	// Read output streams
	outputBytes, _ := io.ReadAll(io.LimitReader(outputPipe, MaxOutputSize))
	errorBytes, _ := io.ReadAll(io.LimitReader(errorPipe, MaxOutputSize))

	// Combine stdout and stderr
	fullOutput := string(outputBytes) + "\n" + string(errorBytes)

	// Wait for completion
	err := cmd.Wait()

	exitCode := 0
	success := true

	if ctx.Err() == context.DeadlineExceeded {
		fullOutput += "\n\n[Timeout Error]: Execution exceeded 10 seconds."
		success = false
		exitCode = 124 // Standard timeout exit code
	} else if err != nil {
		success = false
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = 1
		}
	}

	// 4. Return Response
	jsonResponse(w, ResponsePayload{
		Success:  success,
		Output:   fullOutput,
		ExitCode: exitCode,
	})
}

func cleanWorkspace() error {
	// Remove all files in workspace directory
	dir, err := os.ReadDir(WorkspaceDir)
	if err != nil {
		return err
	}
	for _, d := range dir {
		os.RemoveAll(filepath.Join(WorkspaceDir, d.Name()))
	}
	return nil
}

func extractZip(base64Content, dest string) error {
	// Decode base64
	data, err := base64.StdEncoding.DecodeString(base64Content)
	if err != nil {
		return err
	}

	// Create temporary zip file
	tmpFile, err := os.CreateTemp("", "payload.zip")
	if err != nil {
		return err
	}
	defer os.Remove(tmpFile.Name())
	if _, err := tmpFile.Write(data); err != nil {
		return err
	}
	tmpFile.Close()

	// Open zip
	r, err := zip.OpenReader(tmpFile.Name())
	if err != nil {
		return err
	}
	defer r.Close()

	// Extract files
	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)

		// Basic Zip Slip protection
		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("illegal file path: %s", fpath)
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			return err
		}

		_, err = io.Copy(outFile, rc)

		outFile.Close()
		rc.Close()

		if err != nil {
			return err
		}
	}
	return nil
}

func jsonResponse(w http.ResponseWriter, resp ResponsePayload) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
```

### 2.2 Docker Image Strategy (`Dockerfile`)

We need a Docker image that contains both the compiled `runner-server` and the language toolchain (e.g., Rust/Cargo). We use a multi-stage build to keep the final image size minimal.

**`docker/rust/Dockerfile`:**

```dockerfile
# Stage 1: Build the Go Runner Server
FROM golang:1.21-alpine AS builder

WORKDIR /src
COPY runner-server/main.go .
# Build a static binary (no dependencies on C libraries)
RUN CGO_ENABLED=0 go build -o runner-server main.go

# Stage 2: Create the Final Runtime Image
# We use the official Rust image as the base so `cargo` and `rustc` are available.
FROM rust:1.75-slim-bookworm

# 1. System Dependencies
# Install minimal tools needed for compilation/linking if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup User
# Security: Run as a non-root user.
RUN useradd -m -u 1000 runner
RUN mkdir -p /app/workspace && chown -R runner:runner /app

# 3. Install Runner Binary
WORKDIR /app
COPY --from=builder /src/runner-server /app/runner-server
RUN chmod +x /app/runner-server

# 4. Configuration
# Switch to non-root user
USER runner
ENV PORT=8080

# 5. Entrypoint
EXPOSE 8080
CMD ["/app/runner-server"]
```

**Build Script (`scripts/deploy-runner.sh`):**
This script builds the image and pushes it to Cloudflare's registry via Wrangler.

```bash
#!/bin/bash
set -e

echo "Building Rust Runner Image..."
docker build -f docker/rust/Dockerfile -t progy-rust-runner .

echo "Deploying to Cloudflare..."
# Requires 'wrangler' to be authenticated
npx wrangler containers images push progy-rust-runner
```

---

## 3. Detailed Implementation Plan: The Backend (`apps/backend`)

The backend is a Cloudflare Worker that orchestrates the execution. It uses a **Durable Object** to manage the container lifecycle.

### 3.1 Worker Configuration (`wrangler.jsonc`)

We must configure the binding between the Worker and the Container fleet.

```jsonc
// apps/backend/wrangler.jsonc
{
  "name": "progy-backend",
  "main": "src/index.ts",
  "compatibility_date": "2024-04-01",

  // Define the container configuration
  "containers": [
    {
      "max_instances": 10, // Limit for cost control during Beta
      "class_name": "RunnerContainer",
      "image": "./docker/rust" // Local path for Wrangler to find the Dockerfile context
    }
  ],

  // Define the Durable Object that manages the container
  "durable_objects": {
    "bindings": [
      {
        "name": "RUNNER_CONTAINER",
        "class_name": "RunnerContainer"
      }
    ]
  },

  // Database bindings (existing)
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "progy-db",
      "database_id": "..."
    }
  ],

  // Migrations are required for new DO classes
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["RunnerContainer"]
    }
  ]
}
```

### 3.2 The Durable Object (`src/runner/container.ts`)

This is the bridge between the Worker and the Container. We use the `Container` class extension pattern from `@cloudflare/workers-types` (or `@cloudflare/containers`).

```typescript
// apps/backend/src/runner/container.ts
import { Container } from "@cloudflare/workers-types/experimental";
import { DurableObjectState } from "@cloudflare/workers-types";

interface ExecutionRequest {
  code: string;
  language: string;
  fileName: string;
  testCmd: string;
}

interface ExecutionResponse {
  success: boolean;
  output: string;
  exitCode: number;
}

export class RunnerContainer extends Container {
  // Configuration for the container lifecycle
  defaultPort = 8080;

  // Alarm to shut down idle containers to save costs
  // We check periodically if the container has been idle.
  // Note: The `Container` class handles basic startup/shutdown, but we can add custom logic.

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
  }

  /**
   * Main RPC method called by the Worker.
   * This executes the code inside the container.
   */
  async execute(req: ExecutionRequest): Promise<ExecutionResponse> {
    // 1. Check if container is ready/healthy (optional)
    // The `fetch` method will automatically start the container if it's not running.

    // 2. Send the request to the internal Go/Rust server running on localhost inside the container
    try {
      const response = await this.fetch("http://localhost/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Runner Server Error (${response.status}): ${text}`);
      }

      return await response.json() as ExecutionResponse;
    } catch (err: any) {
      console.error("[RunnerContainer] Execution Failed:", err);
      return {
        success: false,
        output: `System Error: ${err.message}`,
        exitCode: 255
      };
    }
  }

  // Lifecycle Hooks

  override async onStart() {
    // Called when the container starts.
    // We could warm up the environment here (e.g., run `cargo --version`)
    console.log("[RunnerContainer] Container Started");
  }

  override async onStop() {
    console.log("[RunnerContainer] Container Stopped");
  }
}
```

### 3.3 The API Endpoint (`src/index.ts`)

We expose a REST endpoint that the CLI calls.

```typescript
// apps/backend/src/index.ts
import { Hono } from 'hono';
import { RunnerContainer } from './runner/container';

// Re-export the DO class so Cloudflare detects it
export { RunnerContainer };

const app = new Hono<{ Bindings: CloudflareBindings }>();

// ... (existing auth middleware) ...

app.post('/runner/execute', async (c) => {
  // 1. Validation
  const body = await c.req.json();
  const { code, content, isZip, language, exerciseId } = body;

  // Accept either a single 'code' string OR a 'content' zip
  if ((!code && !content) || !language) {
    return c.json({ error: "Missing code/content or language" }, 400);
  }

  // 2. Container Selection Strategy
  // To optimize for cold starts, we can use a pool of "warm" containers.
  // We have two main strategies available via the bindings:

  // Strategy A: Stateful / Sticky Routing (getByName)
  // We hash the User ID to assign them a consistent container instance.
  // This means a user gets "their own" runner for the duration of their session.
  const userId = c.get('user')?.id || 'anonymous';
  const containerId = c.env.RUNNER_CONTAINER.idFromName(`runner-${userId}`);
  const stub = c.env.RUNNER_CONTAINER.get(containerId);

  /* Strategy B: Load Balanced / Stateless (getRandom) - Future Optimization
     If we don't care about state, we can pick any available container.

     // const containerId = await getRandom(c.env.RUNNER_CONTAINER, 5);
     // const stub = c.env.RUNNER_CONTAINER.get(containerId);
  */

  // 3. Command Configuration
  // Map the language to the correct command/filename
  let testCmd = "";
  let fileName = "";

  if (language === "rust") {
    fileName = "main.rs";
    // Using `rustc` directly for single files is faster than `cargo test` for simple exercises
    // But for Progy exercises which are usually cargo projects, we might need a different strategy.
    // For this proposal, we assume single-file execution for simplicity:
    testCmd = "rustc main.rs && ./main";
  } else if (language === "go") {
    fileName = "main.go";
    testCmd = "go run main.go";
  } else {
    return c.json({ error: "Unsupported language" }, 400);
  }

  // 4. Execution
  try {
    const result = await stub.execute({
      code: code || "", // Optional fallback
      content: content || "", // Zip content
      isZip: !!isZip,
      language,
      fileName,
      testCmd
    });

    // 5. Transform Output (SRP 2.0 Normalization)
    // The raw output from the runner needs to be parsed into the structured format Progy expects.
    // Ideally, this parsing happens *inside* the container, but we can do it here too.
    return c.json(result);

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default app;
```

---

## 4. Detailed Implementation Plan: The CLI Client (`apps/progy`)

The CLI needs to decide whether to run locally or remotely and handle the network communication.

### 4.1 CLI Logic (`src/backend/endpoints/exercises.ts`)

We modify the existing `runHandler` to support the remote path.

```typescript
// apps/progy/src/backend/endpoints/exercises.ts
import { spawn } from "node:child_process";
import { join } from "node:path";
import { readFile, readdir, stat } from "node:fs/promises";
import { BACKEND_URL, currentConfig, ensureConfig, loadToken } from "../helpers";
import AdmZip from "adm-zip"; // Assuming this is installed

// ... existing imports ...

const runHandler: ServerType<"/exercises/run"> = async (req) => {
  try {
    await ensureConfig();
    const body = await req.json() as { exerciseName: string, id: string };

    // 1. Determine Execution Mode
    const useRemote = process.env.PROGY_REMOTE === "true" || currentConfig?.runner.type === "remote";

    if (useRemote) {
        return await handleRemoteExecution(body.id, currentConfig);
    }

    // ... existing local execution logic ...
    return await handleLocalExecution(body, currentConfig);
  } catch (e) {
    return Response.json({ success: false, output: String(e) });
  }
};

/**
 * Handles offloading the execution to the Cloudflare Worker.
 */
async function handleRemoteExecution(exerciseId: string, config: any) {
  // 1. Load Exercise Content (Multi-file Support)
  // We bundle the entire exercise directory into a zip file.
  const exercisePath = join(config.runner.cwd || process.cwd(), exerciseId);
  const zip = new AdmZip();

  // Recursively add files, respecting .gitignore logic (simplified here)
  const addFilesToZip = async (dir: string, base: string) => {
     const entries = await readdir(dir);
     for (const entry of entries) {
         if (entry.startsWith('.') || entry === 'node_modules' || entry === 'target') continue;
         const fullPath = join(dir, entry);
         const s = await stat(fullPath);
         if (s.isDirectory()) {
             await addFilesToZip(fullPath, join(base, entry));
         } else {
             const content = await readFile(fullPath);
             zip.addFile(join(base, entry), content);
         }
     }
  };
  await addFilesToZip(exercisePath, "");

  const zipBuffer = zip.toBuffer();
  const base64Content = zipBuffer.toString('base64');

  // 2. Prepare Authenticated Request
  const token = await loadToken();
  if (!token) {
    return Response.json({ success: false, output: "Authentication required for remote execution. Run `progy auth login`." });
  }

  // 3. Send Request with Retries
  // Cloudflare Containers might have a "Cold Start". We should implement a retry mechanism.
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const res = await fetch(`${BACKEND_URL}/runner/execute`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: base64Content,
          isZip: true,
          language: "rust", // Derived from config
          exerciseId
        })
      });

      if (res.status === 503) {
        // Service Unavailable - likely container booting up. Wait and retry.
        await new Promise(r => setTimeout(r, 1000));
        attempt++;
        continue;
      }

      if (!res.ok) {
        const err = await res.json();
        return Response.json({ success: false, output: `Remote Error: ${err.error}` });
      }

      const result = await res.json();

      // 4. Return Normalized Result
      return Response.json({
        success: result.success,
        output: result.output,
        // The frontend expects `friendlyOutput` for markdown rendering
        friendlyOutput: `## Remote Execution Results\n\n\`\`\`\n${result.output}\n\`\`\``
      });

    } catch (e) {
      console.error("Network error:", e);
      return Response.json({ success: false, output: "Network error connecting to runner service." });
    }
  }

  return Response.json({ success: false, output: "Runner timed out (Cold Start). Please try again." });
}
```

---

## 5. Security Hardening & Sandboxing Strategy

Running untrusted code is dangerous. Even within a container, we must apply strict limits.

### 5.1 Network Isolation
The runner container should **not** have internet access. Student code should not be able to `curl` external sites or scan the internal network.
*   **Implementation**: In the Cloudflare Container configuration (once available in Beta features), disable outbound network access for the container network namespace.
*   **Workaround**: If network cannot be fully disabled at the infrastructure level, use `iptables` inside the container or run the code under a user with no network capabilities.

### 5.2 Resource Limits (cgroups)
Cloudflare Containers enforces CPU and Memory limits automatically based on the plan.
*   **CPU**: Likely capped at 0.5 vCPU or similar for standard instances.
*   **Memory**: 128MB or 256MB.
*   **Disk**: Ephemeral execution. The `cleanWorkspace()` function in our Go server ensures we don't fill up the disk with artifacts from previous runs.

### 5.3 Read-Only Filesystem
The student code should only be able to write to `/app/workspace`.
*   **Implementation**: In the Dockerfile, we can change permissions of all other directories to root-only, and run the process as the `runner` user.
*   **Runtime**: The `runner-server` enforces that all commands are executed with `Cmd.Dir = WorkspaceDir`.

### 5.4 Timeouts
Infinite loops are a common student error (and attack vector).
*   **Layer 1 (Go Server)**: The `context.WithTimeout(10s)` in `runner-server` kills the `exec.Command` if it takes too long.
*   **Layer 2 (Durable Object)**: The DO has an execution limit. If the `fetch` to the container hangs, the DO will eventually timeout and return an error to the Worker.
*   **Layer 3 (Worker)**: The edge worker has a CPU time limit (usually 10-50ms) but a longer wall-clock limit for IO.

### 5.5 Advanced Isolation (nsjail)
For defense in depth, we can wrap the runner command with `nsjail` (Google's process isolation tool).

```go
// Inside handleExecute in runner-server/main.go
nsjailArgs := []string{
    "--config", "/etc/nsjail.cfg",
    "--cwd", "/workspace",
    "--",
    "sh", "-c", payload.TestCmd,
}
cmd := exec.CommandContext(ctx, "nsjail", nsjailArgs...)
```

**`nsjail.cfg` Example:**
```protobuf
mode: ONCE
hostname: "runner"
cwd: "/workspace"
time_limit: 10
rlimit_as: 512
rlimit_cpu: 10
rlimit_fsize: 1024
mount {
    src: "/"
    dst: "/"
    is_bind: true
    rw: false  # Read-only root
}
mount {
    src: "/app/workspace"
    dst: "/workspace"
    is_bind: true
    rw: true   # Writable workspace
}
```

---

## 6. Monitoring & Observability

To maintain a healthy fleet of containers, we need robust observability.

### 6.1 Logging Strategy
The `runner-server` writes structured logs to `stdout`. Cloudflare captures these logs automatically.

**Structured Log Example (Go):**
```go
log.Printf(`{"level":"info","event":"execution_start","req_id":"%s","lang":"%s"}`, reqID, lang)
```

In the Cloudflare Dashboard, we can filter by these JSON fields to detect spikes in failures or timeouts.

### 6.2 Health Checks
The `RunnerContainer` Durable Object should implement a periodic health check.

```typescript
// Inside RunnerContainer class
async checkHealth() {
  try {
    const res = await this.fetch("http://localhost/health");
    if (!res.ok) {
       console.error("Container unhealthy, restarting...");
       // Trigger restart logic (if supported by SDK) or report failure
    }
  } catch (e) {
    console.error("Health check failed:", e);
  }
}
```

### 6.3 Metrics
We should track:
*   **Execution Duration**: How long does `cargo test` take? If P99 exceeds 5s, we might need larger containers.
*   **Cold Start Latency**: Time from DO instantiation to first successful HTTP response from container.
*   **Error Rate**: Percentage of runs returning non-zero exit codes (student error) vs 500s (system error).

---

## 7. Troubleshooting Guide

Common issues during development and deployment.

### 7.1 "Container not found"
If the Worker logs `Error: Container not found`, verify:
1.  The `image` path in `wrangler.jsonc` points to a valid directory with a `Dockerfile`.
2.  You have run `wrangler deploy` successfully.
3.  The migration `new_sqlite_classes` included the correct class name.

### 7.2 "Connection Refused" (inside DO)
If `this.fetch` fails:
1.  Ensure the Go server inside the container is listening on `0.0.0.0:8080` (or configured port), not just `127.0.0.1`.
2.  Check if the container crashed immediately. Look at the "Container Logs" tab in Cloudflare Dashboard.
3.  Verify the `EXPOSE 8080` instruction in the Dockerfile matches the port.

### 7.3 "OOM Killed"
If the container silently dies during compilation:
1.  Rust compilation is memory intensive. Increase container memory limit or use `RUSTFLAGS="-C codegen-units=1"` to reduce peak memory usage.
2.  Check for infinite recursion in student code.

---

## 8. Migration Plan

Transitioning from "Local Only" to "Hybrid Remote" requires careful steps.

1.  **Phase 1 (Alpha):**
    *   Deploy the Backend Worker with `runner` endpoints.
    *   Push the `progy-rust-runner` image.
    *   Add a hidden `--remote` flag to the CLI (`progy run --remote`).
    *   Test manually with a small group of users.

2.  **Phase 2 (Beta):**
    *   Update `course.json` schema to allow instructors to specify `runner: { type: "remote" }`.
    *   This forces all students on that course to use the remote runner (ensuring consistent environments).

3.  **Phase 3 (GA):**
    *   Enable remote execution by default for "Verified" courses.
    *   Keep local execution as a fallback for offline usage.

---

## 10. Supporting Multiple Languages (Polyglot Architecture)

A common concern is whether we need to rewrite the "runner server" for every language (Python, Node.js, Lua, C#, etc.). The answer is **NO**.

We can reuse the exact same Go (or Rust) binary as an infrastructure agent across all language containers. The Go server is language-agnostic: it just writes a file to disk and runs a shell command.

### 10.1 The "Base Runner" Strategy

We treat the `runner-server` binary as a build artifact that can be copied into any Docker image.

**Step 1: Create a Base Image**
This image only contains the compiled Go binary.

```dockerfile
# docker/base/Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /src
COPY runner-server/main.go .
RUN CGO_ENABLED=0 go build -o runner-server main.go

FROM scratch
COPY --from=builder /src/runner-server /runner-server
```

**Step 2: Create Language-Specific Images**
Each language image inherits from its official runtime but copies the runner binary.

#### Example: Node.js / TypeScript Runner
```dockerfile
# docker/node/Dockerfile
FROM oven/bun:1.0-slim

# 1. Setup User
RUN useradd -m -u 1000 runner
RUN mkdir -p /app/workspace && chown -R runner:runner /app

# 2. Copy the shared runner binary (from local build context or base image)
COPY --from=progy-runner-base /runner-server /app/runner-server

# 3. Configure
WORKDIR /app
USER runner
ENV PORT=8080
EXPOSE 8080

CMD ["/app/runner-server"]
```

#### Example: Lua Runner
```dockerfile
# docker/lua/Dockerfile
FROM alpine:3.18
RUN apk add --no-cache lua5.4

# 1. Setup User
RUN adduser -D -u 1000 runner
RUN mkdir -p /app/workspace && chown -R runner:runner /app

# 2. Copy the shared runner binary
COPY --from=progy-runner-base /runner-server /app/runner-server

# 3. Configure
WORKDIR /app
USER runner
ENV PORT=8080
EXPOSE 8080

CMD ["/app/runner-server"]
```

### 10.2 Backend Routing Logic

In `apps/backend/src/index.ts`, we simply route the request to the correct container binding based on the language.

```typescript
// apps/backend/src/index.ts

app.post('/runner/execute', async (c) => {
  const { code, language } = await c.req.json();

  let binding;
  let defaultCmd = "";
  let defaultFile = "";

  switch (language) {
    case 'rust':
      binding = c.env.RUST_RUNNER; // Configured in wrangler.jsonc
      defaultCmd = "cargo test";
      defaultFile = "main.rs";
      break;
    case 'lua':
      binding = c.env.LUA_RUNNER;
      defaultCmd = "lua script.lua";
      defaultFile = "script.lua";
      break;
    case 'typescript':
      binding = c.env.NODE_RUNNER;
      defaultCmd = "bun test";
      defaultFile = "index.test.ts";
      break;
    default:
      return c.json({ error: "Unsupported language" }, 400);
  }

  // Consistent Hashing for warm starts
  const id = binding.idFromName(`runner-${c.get('user').id}`);
  const stub = binding.get(id);

  return c.json(await stub.execute({
    code,
    language,
    fileName: defaultFile,
    testCmd: defaultCmd
  }));
});
```

---

## 11. Instructor & Course Configuration

The goal is a **"Zero Config"** experience for instructors. They should not need to know about Docker, Workers, or Cloudflare.

### 11.1 The `course.json` Schema

Instructors define the runner requirements in the `runner` object of their `course.json` file.

#### Scenario A: Standard Rust Course
```json
{
  "id": "rust-101",
  "title": "Rust Fundamentals",
  "runner": {
    "type": "remote",
    "language": "rust",
    "entrypoint": "src/main.rs"
  }
}
```
*   **Result**: Progy CLI bundles the current directory and sends it to the backend. The backend uses the `RustRunner` container.

#### Scenario B: Lua Game Scripting
```json
{
  "id": "lua-games",
  "title": "Scripting with Lua",
  "runner": {
    "type": "remote",
    "language": "lua",
    "entrypoint": "script.lua",
    // Override the default command if needed
    "test_command": "lua tests/run_all.lua"
  }
}
```
*   **Result**: Progy CLI sends `script.lua` (and peers). Backend uses `LuaRunner`.

#### Scenario C: Python Data Science (Complex Dependencies)
For languages with heavy dependencies (numpy, pandas), we might use a "fat" container.

```json
{
  "id": "python-ds",
  "runner": {
    "type": "remote",
    "language": "python-datascience", // Maps to a specific large container
    "entrypoint": "analysis.py"
  }
}
```

### 11.2 "Transparent" Experience

The CLI handles all complexity:
1.  **Reads `course.json`**: "Okay, this is a remote Lua exercise."
2.  **Packages Files**: Zips the relevant source files.
3.  **Authenticates**: Ensures the user is logged in.
4.  **Executes**: POSTs to the API.
5.  **Displays**: Shows the output exactly as if it ran locally.

The instructor never touches infrastructure. They just write code and config.

---

## 12. Advanced: Custom Environments

What if an instructor needs a language or library that Progy doesn't support yet? (e.g., "Fortran" or "Ocaml").

### 12.1 The Pull Request Workflow
Since the architecture is modular, adding a new language is a standard engineering task, not a platform rewrite.

1.  **Instructor/Contributor** forks `apps/backend`.
2.  Adds `docker/fortran/Dockerfile` (copying the standard Go runner binary).
3.  Adds the binding to `wrangler.jsonc`.
4.  Adds the case to the `switch` statement in `index.ts`.
5.  **Progy Team** reviews and merges.
6.  The new runner is deployed and available to everyone via `"language": "fortran"`.

### 12.2 Generic "Fallback" Container
We can also maintain a "Kitchen Sink" container (e.g., based on Ubuntu) with many common tools (gcc, make, python, perl) pre-installed.
*   **Pros**: Instant support for random scripts.
*   **Cons**: Large image size (~1GB+), slower cold starts.
*   **Usage**: Instructors set `"language": "generic"` in `course.json`.

## 13. Conclusion (Final)

This expanded proposal demonstrates that the Cloudflare Container architecture is not only secure but highly extensible. By decoupling the **Runner Agent** (Go/Rust binary) from the **Runtime Environment** (Docker image), we can support any programming language with minimal effort. Instructors remain focused on content creation through simple JSON configuration, while the platform handles the complexity of sandboxed execution, routing, and scaling.
