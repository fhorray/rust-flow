# Project Structure & Overview

Progy is a monorepo containing the tools and platforms for interactive coding courses. It is built using Bun, React, and TypeScript.

## Monorepo Structure

The project is organized as a monorepo in the `apps/` directory:

- **`apps/progy`**: The core CLI and local runner.
    - Contains the logic for initializing, packaging, and running courses locally.
    - Includes the `runner` which executes code and tests.
    - Includes a local server (`src/backend`) that serves the frontend interface to the user.
- **`apps/web`**: The web platform (hosted version).
    - Likely a Next.js or similar web application for the online learning experience.
- **`apps/backend`**: The backend API for the hosted platform.
    - Handles user authentication, progress syncing, and other server-side logic.

## Key Concepts

### 1. Course
A course is a collection of interactive coding exercises. It is defined by a `course.json` file and a content directory structure.
Each course runs in a specific environment (e.g., Node.js, Rust, Go) managed by a **Runner**.

### 2. Runner
A program (usually a script or binary) that executes the user's code against tests and returns a structured JSON result (`SRPOutput`).
Runners are language-specific.

### 3. CLI (`progy`)
The command-line interface used by students to:
- Initialize a course (`progy init`)
- Start the learning environment (`progy start`)
- Create new courses (`progy create-course`)

### 4. Interactive Elements
Progy supports rich markdown content with custom extensions like:
- `::video[url]`: Embeds a video player.
- `::note[text]`: Renders a highlighted note block.
- **Quizzes**: Interactive quizzes defined in `quiz.json` files alongside exercises.

## Getting Started

To run the project locally:

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Build the CLI**:
    ```bash
    bun run build
    ```

3.  **Run the CLI (dev mode)**:
    You can run the CLI from source using `bun apps/progy/src/cli.ts`.

## Development Workflow

- **CLI Development**: Work in `apps/progy`. The entry point is `src/cli.ts`.
- **Frontend/UI**: The local runner's UI is in `apps/progy/src/frontend`.
- **Backend/API**: The local server is in `apps/progy/src/backend`.

## Web & Cloud Architecture

For a deep dive into the hosted components (`apps/web`, `apps/backend`), see [Web and Cloud Architecture](web_architecture.md).

## Advanced Features

For details on Progress Tracking, IDE Integration, and Roadmap features (AI, Cloud), see [Features & Integrations](features.md).

## Contributing

For information on how to build, test, and contribute to Progy, see the [Development Guide](development.md).
