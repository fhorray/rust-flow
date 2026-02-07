# Web & Cloud Architecture

Progy is not just a CLI; it's a connected ecosystem. This document explains the architecture of the hosted services.

## Components

The system is composed of three main parts:

1.  **Client (`apps/progy`)**: The local CLI and runner.
2.  **Web Platform (`apps/web`)**: The public face and dashboard.
3.  **Cloud API (`apps/backend`)**: The central hub for data and registry.

### 1. Web Platform (`apps/web`)
- **Tech Stack**: Next.js, OpenNext, Cloudflare Workers.
- **Role**:
    - Landing Page (Marketing).
    - User Authentication entry point (GitHub OAuth).
    - Dashboard (View progress, badges, cloud deployments).

### 2. Cloud API (`apps/backend`)
- **Tech Stack**: Hono, Drizzle ORM, Cloudflare D1, Better-Auth.
- **Database Schema**:
    - `user`: Identity and subscription status.
    - `session`: Auth tokens.
    - `course_progress`: Stores JSON blobs of user progress per course.
    - `device`: Managing device-flow authorization codes.
- **Role**:
    - **Course Registry**: Serves the list of official courses (`/api/registry`).
    - **Authentication**: Manages user sessions and device flow for the CLI.
    - **Progress Sync**: Stores user progress across devices.

## Data Flow

### Authentication (Device Flow)
1.  CLI requests login (`progy login`).
2.  Backend generates a user code.
3.  User opens `progy.dev/device` (served by Backend/Web) and enters code.
4.  CLI polls Backend until token is issued.

### Progress Sync
1.  **Local**: CLI/Runner saves progress to `.progy/progress.json`.
2.  **Sync**: If logged in, local server pushes updates to `POST /api/progress/sync`.
3.  **Storage**: Backend saves to Cloudflare D1 database.

### Course Discovery
1.  CLI asks Registry (`GET /api/registry`) for course alias (e.g., "rust").
2.  Registry returns Git URL and metadata.
3.  CLI clones and installs the course.
