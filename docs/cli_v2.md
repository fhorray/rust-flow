# Progy CLI Documentation (v2)

The Progy CLI is the central tool for both instructors (creating courses) and students (running courses). It orchestrates the learning environment, manages the runner lifecycle, and serves the frontend interface.

## 1. Architecture Overview

The Progy CLI is built as a monorepo application using **Bun** as the runtime. It is split into two main packages:

*   **`apps/cli`**: The student-facing runner and course manager. It handles progress tracking, code execution, and serves the student UI.
*   **`apps/editor`** (Progy Studio): The standalone visual editor for instructors.
*   **`packages/core`**: The shared library containing business logic for course loading, validation, runner execution, and state management.

### Key Components

*   **Course Loader (`packages/core/src/loader.ts`)**: Responsible for resolving course sources (local path, Git URL, or Registry package), validating the structure, and parsing `course.json`.
*   **Runner Engine (`packages/core/src/runner.ts`)**: Manages the execution of student code. It supports multiple strategies:
    *   `process`: Runs directly on the host machine (fast but insecure).
    *   `docker-local`: Runs inside a Docker container (secure and isolated).
    *   `docker-compose`: Runs multi-container environments (e.g., App + DB).
*   **Sync Manager (`packages/core/src/sync.ts`)**: Handles the synchronization of student progress with the cloud backend (if online) or local filesystem (if offline).
*   **Layering System**: When using Registry packages (`.progy`), the CLI unpacks the immutable course artifact into a temporary directory and "layers" the student's mutable workspace on top, ensuring course updates don't overwrite student work.

---

## 2. Command Reference

### `progy init <source>`

Initializes a new course environment.

*   **Arguments**:
    *   `source`: Can be a registry package name (e.g., `sql-basics`), a Git URL, or a local path.
*   **Options**:
    *   `--offline`: Forces offline mode, skipping cloud synchronization.
*   **Behavior**:
    1.  Resolves the source.
    2.  If it's a Registry package, downloads the `.progy` artifact.
    3.  Unpacks the artifact to a hidden cache.
    4.  Provisions the user's workspace with the initial `content/` directory.
    5.  Creates a `progy.toml` tracking file.

### `progy dev`

Starts the course runner in **Development Mode** (Guest Mode). This allows you to test your course exactly as a student would see it, but without saving progress to the cloud.

*   **Options**:
    *   `--bypass`: Enables **Progression Bypass**, unlocking all exercises and modules regardless of completion status.
    *   `--offline`: Runs without checking for updates or syncing progress.
    *   ~~`--ui`~~: **Deprecated.** Use `bunx @progy/studio start` instead.
*   **Behavior**:
    1.  Validates the current directory as a valid course.
    2.  Starts the local backend server (Bun).
    3.  Serves the student frontend application at `http://localhost:3000`.
    4.  Watches for file changes in `content/` to live-reload the runner.

### `progy pack`

Packages the current course into a distributable `.progy` artifact.

*   **Options**:
    *   `--out <filename>`: Specifies the output filename (default: `course-id.progy`).
*   **Behavior**:
    1.  Validates the course structure using `CourseLoader`.
    2.  Ignores development files (`node_modules`, `.git`, `.next`, `target`, `dist`).
    3.  Creates a compressed archive containing `course.json`, `content/`, and `runner/`.
    4.  This artifact is immutable and used for Registry distribution.

### `progy publish`

Publishes the current course to the Progy Registry.

*   **Options**:
    *   `--patch`, `--minor`, `--major`: Automatically increments the version number in `course.json` before publishing.
*   **Behavior**:
    1.  Authenticates the user via `progy login`.
    2.  Runs `progy pack` internally to generate the artifact.
    3.  Uploads the artifact and metadata to the Registry API.

### `progy validate`

Runs a comprehensive validation check on the course structure.

*   **Checks**:
    *   **Manifest**: Ensures `course.json` exists and matches the schema.
    *   **Structure**: Verifies `content/` and `runner/` directories exist.
    *   **Naming Conventions**: Checks that all modules and exercises follow the strict `01_name` numbering format.
    *   **Metadata**: Parses `info.toml` files to ensure valid TOML syntax.

---

## 3. The Runner System

The Runner is the heart of Progy. It executes student code and provides feedback.

### Runner Configuration (`course.json`)

The `runner` object in `course.json` dictates how code is executed.

```json
{
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}",
    "image_tag": "my-python-course:latest",
    "network_access": false
  }
}
```

*   **`type`**:
    *   `process`: Executes the `command` directly on the host. Use `{{exercise}}` as a placeholder for the student's file path.
    *   `docker-local`: Builds (or pulls) the image defined by `dockerfile` or `image_tag`. Mounts the student's workspace to `/workspace` inside the container.
    *   `docker-compose`: Uses `docker-compose.yml` to spin up a multi-container environment.
*   **`command`**: The command to run inside the environment. Must accept the file path as an argument (injected via `{{exercise}}`).

### Smart Runner Protocol (SRP)

Progy uses a strict JSON protocol to communicate execution results from the runner (inside Docker/Process) back to the CLI.

The runner script (e.g., `runner.py`) **must** output a JSON block wrapped in `__SRP_BEGIN__` and `__SRP_END__`.

#### Schema (`SRPOutput`)

```typescript
interface SRPOutput {
  success: boolean;       // Did the exercise pass?
  summary: string;        // Short message (e.g., "All tests passed!")
  raw: string;            // The full output log (stdout/stderr)
  diagnostics?: Array<{   // Optional compiler/linter errors
    severity: 'error' | 'warning' | 'note';
    message: string;
    file?: string;
    line?: number;
    snippet?: string;
  }>;
  tests?: Array<{         // Optional list of test cases
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
}
```

#### Example Output

```text
__SRP_BEGIN__
{
  "success": true,
  "summary": "Query returned 5 rows",
  "tests": [
    { "name": "Check column count", "status": "pass" },
    { "name": "Check row count", "status": "pass" }
  ],
  "raw": "id | name\n---|-----\n1  | Alice..."
}
__SRP_END__
```

### Execution Flow

1.  **Trigger**: User clicks "Run" in the frontend or runs `progy run`.
2.  **Resolution**: The CLI identifies the active exercise file.
3.  **Containerization**:
    *   If `docker-local`, the CLI ensures the container is running.
    *   If `docker-compose`, it ensures services are `up`.
4.  **Injection**: The command string (from `course.json`) is interpolated. `{{exercise}}` is replaced with the relative path to the file.
5.  **Execution**:
    *   `spawn` (Node.js) is used to execute the command.
    *   `stdout` and `stderr` are captured in real-time.
6.  **Parsing**:
    *   The CLI scans the output for the SRP block.
    *   If found, it parses the JSON and updates the UI state (Pass/Fail).
    *   If not found, it falls back to a heuristic (exit code 0 = success) but marks the output as "Raw".

---

## 4. Registry & Layering System

Progy v2 moves away from pure Git cloning to a Registry-based approach for stability and versioning.

### The Problem with Git

*   Student messes up `git` history.
*   Instructor updates the course (git pull conflicts).
*   Large binary files bloat the repo.

### The Solution: Artifact Layering

1.  **Artifact (`.progy`)**: A zip file containing the *immutable* course source (`course.json`, `runner/`, `content/`).
2.  **Workspace**: The student's local directory.

When `progy init` runs:

1.  It downloads the `.progy` file to a hidden cache (`~/.progy/cache`).
2.  It uses **OverlayFS** principles (simulated in Node.js):
    *   The runner *reads* from the artifact.
    *   The student *writes* to their workspace.
3.  **Copy-on-Write**: When a student opens an exercise, the CLI copies the file from the artifact to the workspace `content/` folder.
4.  **Updates**: When the instructor publishes v1.1, the CLI downloads the new artifact.
    *   Unchanged files are updated automatically.
    *   Modified student files are preserved (no overwrite).

### Directory Structure (Runtime)

When running `progy dev` or `progy start`, the environment looks like this:

```text
/
├── course.json (Read-Only from Artifact)
├── runner/     (Read-Only from Artifact)
├── content/    (Read-Write Layer)
│   ├── 01_intro/
│   │   └── 01_hello/
│   │       ├── main.py (User's Copy)
│   │       └── README.md (Read-Only, unless user edited)
```

This ensures that the runner always has a consistent environment while giving the student full freedom to break things in their own sandbox.