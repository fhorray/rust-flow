# Features & Integrations

Progy goes beyond simple exercise running. It includes features for progress tracking, IDE integration, and planned support for AI and Cloud deployments.

## Progress Tracking

Progy tracks user progress (XP, streaks, completed exercises) in two modes:

### 1. Local (Offline)
- Progress is stored in a hidden `.progy/progress.json` file **inside the course directory**.
- Useful for guest users or private practice.
- To reset progress, simply delete the `.progy` folder.

### 2. Cloud (Online)
- When logged in (`progy login`), progress is synced to the Progy Cloud.
- Allows users to switch devices and maintain their streaks.
- Authentication is handled via `better-auth` (Device Flow).

## IDE Integration

The Web UI (served locally) can communicate with the backend to open files in the user's default editor.

- **Endpoint**: `POST /api/ide/open`
- **Payload**: `{ "path": "/absolute/path/to/file" }`
- **Behavior**: Currently spawns `code <path>` (VS Code).

## Course Manifest & Discovery

The CLI dynamically generates a course manifest (`exercises.json`) by scanning the content directory.
- It looks for entry points like `main.rs`, `index.js`, `main.go`.
- It respects `info.toml` metadata (titles, order).
- It caches the manifest for performance (5 seconds).

## Roadmap Features

### 🚜 Cloud Integration (Planned)
Future versions will allow courses to define **deployment hooks**.
- Users will be able to deploy their code to real platforms (Cloudflare Workers, Fly.io) directly from the CLI.
- `course.json` will support a `deploy` command alongside the `runner`.

### 🤖 AI Mentor (Planned)
A context-aware AI coach is in development.
- Unlike generic chat bots, this will have access to:
    - The specific compiler error/test failure.
    - The student's attempt history.
    - Pedagogical goals defined in the course.
- It will be able to generate "Bridge Exercises" to help stuck students.
