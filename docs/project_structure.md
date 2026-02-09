# Project Structure & Architecture

Progy is a modern, interactive coding platform built on a monorepo structure. It uses a unique "Split State" architecture to manage course content and user progress independently.

## Monorepo Structure

The project is organized as a monorepo in the `apps/` directory:

- **`apps/progy`**: The core CLI, Local Server, and Runner logic.
    - **`src/cli.ts`**: Entry point for the CLI.
    - **`src/commands/`**: Implementation of `init`, `start`, `sync`, etc.
    - **`src/core/`**: Core logic for Git operations, SyncManager, and CourseLoader.
    - **`src/backend/`**: The local API server that powers the web UI.
    - **`src/frontend/`**: The React-based UI for the learning environment.
- **`apps/web`**: The hosted documentation and marketing platform (Next.js).
- **`apps/backend`**: The cloud backend (API, Auth, Sync) for the hosted platform.

## Architecture: Split State Model

One of Progy's key innovations is how it handles course content vs. user progress.

### 1. Official Course Content (Read-Only)
- Stored in `~/.progy/courses/<course-id>/`.
- Managed by `progy sync`.
- Contains the "truth" of the course: instruction text, initial exercise code, and tests.

### 2. User Workspace (Read-Write)
- The directory where the user runs `progy init` or `progy start`.
- Contains the user's solutions and a `.git` directory for their personal history.
- **Layering**: When `progy sync` runs, it "layers" updates from the Official Cache into the User Workspace.
    - **Updates**: New lessons or fixes to `README.md` are copied over.
    - **Preserves**: User-modified files (like `main.rs` in an exercise) are *not* overwritten unless explicitly requested via `progy reset`.

### 3. The `progy.toml` Manifest
Located in the root of the User Workspace, this file tracks the course state:
```toml
[course]
id = "rust"
repo = "https://github.com/progy-courses/rust"
branch = "main"

[sync]
last_sync = "2023-10-27T10:00:00Z"
```

## Data Flow

1.  **Init**: CLI clones official content to Cache -> Copies to Workspace -> Inits User Git.
2.  **Run**: CLI starts Server -> Server reads Workspace -> Runner executes User Code -> Returns JSON Result.
3.  **Save**: CLI commits Workspace -> Pushes to User Remote.
4.  **Sync**: CLI pulls Official Updates to Cache -> Layers to Workspace -> Pulls User Remote.

## Key Components

### Runner
A language-specific program that executes student code and returns structured results (SRP). See [Runners](runners.md).

### Course Loader
Responsible for validating and resolving courses from local paths, Git URLs, or the official registry.

### Sync Manager
Handles the complex logic of merging official updates with user progress without causing conflicts.
