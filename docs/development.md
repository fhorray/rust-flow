# Development Guide

This guide is for developers who want to contribute to the Progy Core (CLI/Runner) or the associated platforms.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Frontend**: React, TailwindCSS, Lucide React
- **UI Library**: Radix UI / Shadcn UI
- **State Management**: Nanostores
- **Testing**: Bun Test

## Project Layout

- `apps/progy`: The core CLI and local runner.
    - `src/cli.ts`: CLI Entry point.
    - `src/backend`: Local server logic (Bun.serve).
    - `src/frontend`: Local web interface (React).
    - `runner/`: Default runner implementations.
        - `index.js`: Node.js generic runner.
        - `src/main.rs`: High-performance Rust runner (compiles to binary).

## Running Locally

1.  **Install Dependencies**:
    ```bash
    bun install
    ```

2.  **Run CLI in Watch Mode**:
    Progy CLI is built with Bun. You can run it directly:
    ```bash
    bun apps/progy/src/cli.ts start
    ```

3.  **Run Tests**:
    We use `bun test` for unit testing.
    ```bash
    cd apps/progy
    bun test
    ```

## Release Process

To build the artifacts for production (CLI and Backend):

```bash
bun run build
```

This runs `scripts/build.ts`, which:
1.  Builds the Frontend (Vite/React) to `dist/public`.
2.  Bundles the CLI and Server to `dist/`.

## UI Architecture (`apps/progy/src/frontend`)

The local frontend is a Single Page Application (SPA) served by the `apps/progy` backend.

- **Components**: Located in `src/frontend/components`. We use atomic design principles.
    - `ui/`: Primitives (Buttons, Inputs, Cards).
    - Other files: Feature-specific components (e.g., `markdown-renderer.tsx`, `quiz-view.tsx`).
- **State**: Located in `src/frontend/stores`.
    - We use **Nanostores** for atomic state management.
    - `course-store.ts`: Handles the currently loaded exercise, test outputs, and navigation.
    - `user-store.ts`: Handles auth state.

## Testing Strategy

- **Unit Tests**: Located alongside source files (e.g., `course-loader.test.ts`).
    - Focus on core logic like course parsing, validation, and security checks.
- **Integration Tests**: (Planned) End-to-end tests for the runner workflow.

## Database Management (Backend)

The backend uses Cloudflare D1 with Drizzle ORM.

1.  **Generate Migrations**:
    ```bash
    cd apps/backend
    bun run db:generate
    ```

2.  **Apply Migrations (Local)**:
    ```bash
    bun run db:migrate:local
    ```

3.  **Apply Migrations (Remote)**:
    ```bash
    bun run db:migrate
    ```

## Contribution Workflow

1.  Pick an issue or feature.
2.  Create a branch.
3.  Implement changes.
4.  Add tests if modifying core logic.
5.  Run `bun test` to ensure no regressions.
6.  Submit a PR.
