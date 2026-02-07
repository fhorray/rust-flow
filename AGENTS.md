# Progy - AI Agent Documentation

## Project Context
Progy is an interactive coding education platform. It consists of a CLI, a local runner environment, and a web platform. The core philosophy is to provided a guided, hands-on coding experience where users solve exercises in a real environment (locally).

## Architecture

### Monorepo
- **`apps/progy`**: THE CORE. Contains the CLI, local server, and runner logic.
    - **CLI**: `src/cli.ts`. Uses `commander`. Handles init, start, login.
    - **Course Loader**: `src/course-loader.ts`. Validates and loads courses from Git/Local.
    - **Course Container**: `src/course-container.ts`. Manages `.progy` zip archives and runtime directories.
    - **Frontend**: `src/frontend`. React app served by the local server.
    - **Backend**: `src/backend`. Bun server for the local environment.
- **`apps/web`**: Hosted web platform (Next.js context).
- **`apps/backend`**: Hosted backend API.

### Course Structure
- Defined by `course.json` in the root.
- Content is organized in directories (Modules -> Exercises).
- Metadata in `info.toml`.
- **Runners**: Language-specific scripts that execute code and return JSON (`SRPOutput`).

### Key Technologies
- **Runtime**: Bun (JavaScript/TypeScript).
- **Frontend**: React, TailwindCSS, Lucide Icons, Radix UI.
- **State Management**: Nanostores.
- **Markdown**: React Markdown + Custom components (`::video`, `::note`).
- **Authentication**: `better-auth`.

## Common Tasks for Agents

### 1. Modifying the Runner
When asked to change how code is executed or tested, look in:
- `apps/progy/runner/` (Default implementations)
- `apps/progy/src/backend/endpoints/exercises.ts` (Execution handler)

### 2. Adding CLI Commands
Look in `apps/progy/src/cli.ts`. Use `commander` syntax.

### 3. Updating Markdown Rendering
Look in `apps/progy/src/frontend/components/markdown-renderer.tsx`. This handles `::video`, `::note`, and syntax highlighting.

### 4. Course Structure Changes
If validting structure, look at `apps/progy/src/course-loader.ts` (Zod schema).

## Terminology
- **SRP (Standard Runner Protocol)**: The JSON format used by runners to report results.
- **.progy file**: A zip archive containing the course content and metadata.
- **Runtime Directory**: A temporary directory where the course is unpacked and run (`~/.progy/runtime`).

## Documentation Map

- **`docs/project_structure.md`**: Detailed breakdown of the monorepo.
- **`docs/web_architecture.md`**: Architecture of the hosted platform (Web/Backend).
- **`docs/features.md`**: Advanced features (Progress, IDE, AI).
- **`docs/development.md`**: Guide for contributors (Testing, UI, DB).
- **`docs/courses.md`**: Guide to creating courses.
- **`docs/runners.md`**: How runners work and SRP protocol.
