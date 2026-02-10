# Progy Improvements: Community Registry

This document outlines the design and implementation plan for the new **Registry/Community** area in the Progy platform. This feature will allow users to discover courses, view details, and easily get started via the CLI.

---

## 1. Backend: Course Listing API

We need a new endpoint in `apps/backend/src/endpoints/registry.ts` to expose public courses.

### Endpoint: `GET /registry`

- **Visibility**: Public
- **Query Params**:
  - `page`: (Default 1)
  - `limit`: (Default 20)
  - `search`: Filter by name or description.
- **Response**:

```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "@username/course-slug",
      "slug": "course-slug",
      "description": "Short description...",
      "latestVersion": "1.0.2",
      "updatedAt": "2024-02-10T..."
    }
  ],
  "total": 42
}
```

---

## 2. Web App: Registry Interface

We will add a new exploreable area in `apps/web`.

### Navigation Changes

- **Landing Page**: Add "Community" or "Courses" to the top navigation.
- **Dashboard**: Add "Registry" to the sidebar as a primary destination.

### New Routes

- `/courses`: A searchable grid/list of all public courses.
- `/courses/@username/slug`: A detailed page for a specific course.

### Feature: Detailed Course View

Each course page will display:

- **Identifier**: `@username/slug` (with copy-to-clipboard button).
- **Description**: Full description from the registry metadata.
- **Quick Start**: A clearly visible command: `npx progy init @username/slug`.
- **Modules/Lessons**: (Future) Preview of the course content if indexed.
- **Versions**: List of available versions.

---

## 3. Course Indexing & Previews

To enable a rich discovery experience, we will index the course structure during the publication process. This allows the Web App to show modules, lessons, and readmes without downloading the full `.progy` artifact.

### Indexing Flow

1.  **Extraction (CLI)**: When the user runs `progy publish`, the CLI scans the course structure (reading `course.json` and optionally summary files/readmes).
2.  **Manifest Creation**: A lightweight JSON manifest is generated:
    ```json
    {
      "modules": [
        { "title": "Introduction", "lessons": ["Hello World", "Setup"] },
        { "title": "Core Concepts", "lessons": ["Variables", "Functions"] }
      ],
      "readme": "# My Course\nThis is a preview...",
      "totalLessons": 12
    }
    ```
3.  **Storage (Backend)**: The `registry_versions` table is updated with a new `manifest` column (JSON string).
4.  **Instant Preview**: The Web App fetches this manifest via `GET /registry/resolve/:query` to render the course curriculum instantly.

### Why this approach?

- **Speed**: No need to unpack heavy artifacts in the browser.
- **SEO**: Course content becomes crawlable by search engines.
- **User Insight**: Students can see exactly what they will learn before initializing.

---

## 4. Implementation Workflow

### Phase 1: Backend API

1.  Add `registry.get('/', ...)` to `registry.ts`.
2.  Query `registry_packages` where `is_public = true`.
3.  Implement basic sorting (newest first) and search.

### Phase 2: Web Registry Page

1.  Create `apps/web/app/courses/page.tsx`.
2.  Implement a beautiful grid using existing UI components (`Card`, `Badge`, `Button`).
3.  Add a search bar with real-time filtering.

### Phase 3: Course Detail Page

1.  Create `apps/web/app/courses/[...slug]/page.tsx` (using catch-all for `@user/slug`).
2.  Fetch data from `GET /registry/resolve/:query`.
3.  Design a premium-looking detailed view with the `CopyButton`.

---

## 4. User Experience (UX) Goals

- **Frictionless Discovery**: Users should find a course and be running it in the terminal in under 10 seconds.
- **Engagement**: Visualize "Official" courses (from `@progy`) with special styling.
- **Community First**: Enable users to see what's being built on the platform.
