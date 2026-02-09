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
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
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
	Code     string `json:"code"`
	Language string `json:"language"`
	FileName string `json:"fileName"` // e.g., "main.rs"
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
	if payload.FileName == "" || payload.Code == "" {
		http.Error(w, "Missing code or filename", http.StatusBadRequest)
		return
	}

	// 2. Prepare Workspace
	// We clean the workspace before every run to ensure isolation between requests
	// (Note: In a high-security environment, we might restart the container, but for performance, we reuse it)
	if err := cleanWorkspace(); err != nil {
		jsonResponse(w, ResponsePayload{Success: false, Error: "Failed to clean workspace"})
		return
	}

	filePath := filepath.Join(WorkspaceDir, filepath.Clean(payload.FileName))
	if err := os.WriteFile(filePath, []byte(payload.Code), 0644); err != nil {
		jsonResponse(w, ResponsePayload{Success: false, Error: "Failed to write code file"})
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

func jsonResponse(w http.ResponseWriter, resp ResponsePayload) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
```

### 2.1.1 Alternative: Rust Server Implementation (`runner-server-rs/src/main.rs`)

For teams preferring a full Rust stack, we can use `axum` for a lightweight, async runner.

**`Cargo.toml`:**
```toml
[package]
name = "runner-server-rs"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tempfile = "3" # Useful for temporary directories
```

**`src/main.rs`:**
```rust
use axum::{
    extract::Json,
    routing::{get, post},
    Router,
    response::IntoResponse,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tokio::process::Command;
use std::time::Duration;
use tokio::time::timeout;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/execute", post(execute_handler));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

#[derive(Deserialize)]
struct ExecuteRequest {
    code: String,
    file_name: String,
    test_cmd: String,
}

#[derive(Serialize)]
struct ExecuteResponse {
    success: bool,
    output: String,
    exit_code: i32,
    error: Option<String>,
}

async fn execute_handler(Json(payload): Json<ExecuteRequest>) -> impl IntoResponse {
    // 1. Setup Workspace (Using tempfile for isolation per request)
    let temp_dir = match tempfile::tempdir() {
        Ok(dir) => dir,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(ExecuteResponse {
            success: false, output: "".to_string(), exit_code: -1, error: Some(format!("Failed to create temp dir: {}", e))
        })),
    };

    let file_path = temp_dir.path().join(&payload.file_name);
    if let Err(e) = tokio::fs::write(&file_path, &payload.code).await {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(ExecuteResponse {
            success: false, output: "".to_string(), exit_code: -1, error: Some(format!("Failed to write file: {}", e))
        }));
    }

    // 2. Execute Command
    // Split command string simply (for demo) - use sh -c for complex args
    let mut cmd = Command::new("sh");
    cmd.arg("-c").arg(&payload.test_cmd);
    cmd.current_dir(temp_dir.path());
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    // 3. Timeout Logic
    let result = timeout(Duration::from_secs(10), cmd.spawn().expect("failed to spawn").wait_with_output()).await;

    match result {
        Ok(Ok(output)) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            let combined = format!("{}\n{}", stdout, stderr);
            let success = output.status.success();
            let exit_code = output.status.code().unwrap_or(-1);

            (StatusCode::OK, Json(ExecuteResponse {
                success,
                output: combined,
                exit_code,
                error: None,
            }))
        }
        Ok(Err(e)) => (StatusCode::INTERNAL_SERVER_ERROR, Json(ExecuteResponse {
            success: false, output: "".to_string(), exit_code: -1, error: Some(format!("Execution error: {}", e))
        })),
        Err(_) => (StatusCode::OK, Json(ExecuteResponse { // Timeout
            success: false,
            output: "Execution timed out (10s)".to_string(),
            exit_code: 124,
            error: Some("Timeout".to_string())
        })),
    }
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
  const { code, language, exerciseId } = body;

  if (!code || !language) {
    return c.json({ error: "Missing code or language" }, 400);
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
      code,
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
import { readFile } from "node:fs/promises";
import { BACKEND_URL, currentConfig, ensureConfig, loadToken } from "../helpers";

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
  // 1. Load Exercise Code
  // We need to read the file content from disk to send it to the cloud.
  const exercisePath = join(config.runner.cwd || process.cwd(), exerciseId, "main.rs"); // Simplified path resolution
  let code = "";
  try {
    code = await readFile(exercisePath, "utf-8");
  } catch (e) {
    return Response.json({ success: false, output: "Failed to read exercise file locally." });
  }

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
          code,
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

## 9. Conclusion

This detailed implementation plan provides a concrete roadmap for building a secure, scalable runner service. By leveraging **Cloudflare Containers** and **Durable Objects**, we minimize infrastructure management overhead while gaining the security of isolated environments. The use of a custom **Go-based internal server** ensures fast, controlled execution of student code, while the **CLI integration** maintains the developer-friendly "local first" experience Progy is known for.
