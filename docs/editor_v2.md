# Progy Studio (Visual Course Editor) Documentation

Progy Studio (formerly "Visual Course Editor") is the integrated development environment (IDE) for creating and managing Progy courses. It provides a rich, graphical interface for editing course content, configuration, and metadata, replacing manual JSON/TOML editing.

## 1. Technical Overview

Progy Studio is built as a Single Page Application (SPA) served by the Progy CLI's local server.

### Tech Stack

*   **Runtime**: **Bun** (Server-side) + **React 19** (Client-side).
*   **State Management**: **Nanostores** (Atomic, framework-agnostic state).
    *   Why? To share state easily between React components and non-React logic (like WebSocket handlers) without context hell.
*   **Form Management**: **TanStack Form**.
    *   Why? For complex, deeply nested configuration forms (`course.json`, `info.toml`) with validation.
*   **Rich Text Editor**: **Tiptap** (Headless wrapper around ProseMirror).
    *   Custom extensions for Markdown directives (`::video`, `::note`).
*   **Code Editor**: **CodeMirror 6**.
    *   Used for editing source code files (`.py`, `.rs`, `.js`, etc.).
*   **Styling**: **Tailwind CSS** + **Radix UI** primitives.
*   **Icons**: **Lucide React**.

### Architecture: Client-Server Model

When you run `progy dev --ui`, the following happens:

1.  **CLI Backend (`apps/cli/src/backend`)**:
    *   Starts a Bun HTTP server (e.g., `http://localhost:3000`).
    *   Exposes API endpoints for file operations (`/api/fs/*`), git operations (`/api/git/*`), and course validation.
    *   Serves the static frontend assets from `apps/cli/dist/frontend`.

2.  **Frontend (`apps/cli/src/frontend`)**:
    *   Loads the React application.
    *   Connects to the backend via REST API (mostly) and potentially WebSockets for terminal streaming.
    *   Manages local state using Nanostores (`editor-store.ts`).

---

## 2. Core Components

### 2.1 File Tree (`FileTree.tsx`)

The File Tree is the primary navigation component. It visualizes the `content/` directory structure.

*   **Features**:
    *   **Drag & Drop**: Reorder modules and exercises (updates `01_` prefixes automatically on the backend).
    *   **Context Menu**: Right-click to Rename, Delete, or Duplicate files.
    *   **Special File Handling**:
        *   `course.json`: Opens the **Course Settings** tab.
        *   `info.toml`: Opens the **Module Settings** tab (metadata editor).
        *   `README.md`: Opens the **Visual Markdown Editor**.
        *   `code files`: Opens the **Code Editor**.

### 2.2 Visual Markdown Editor (`MarkdownEditor.tsx`)

This is a WYSIWYG editor for course content. It abstracts away raw Markdown syntax while maintaining full compatibility.

*   **Custom Directives**:
    *   **Videos**: `::video{src="..."}` renders a playable video player.
    *   **Callouts**: `::note{title="Tip"}` renders a colored alert box.
    *   **Quizzes**: `::quiz{id="..."}` embeds a quiz block.
*   **Toolbar**: Formatting options (Bold, Italic, Code, Link, Image Upload).
*   **Image Upload**: Dragging an image into the editor automatically uploads it to `assets/` and inserts the markdown link.

### 2.3 Configuration Forms (`ConfigForm.tsx`)

Managing `course.json` manually is error-prone. The **Config Form** provides a validated UI for all settings.

*   **Fields**:
    *   **Course Details**: ID, Name, Description.
    *   **Runner Configuration**: Dropdown for Runner Type (`process`, `docker`, `compose`).
    *   **Progression**: Toggle for Sequential/Open mode.
    *   **Repository**: Git URL/Registry package.
*   **Validation**: Uses **Zod** schemas (shared with `packages/core`) to ensure the configuration is valid before saving.

### 2.4 Terminal Integration (`Terminal.tsx`)

The Studio includes a built-in terminal emulator (xterm.js) connected to the backend.

*   **Purpose**:
    *   Running `progy test` on the current exercise.
    *   Executing arbitrary shell commands (e.g., `git status`, `npm install`).
    *   Viewing runner output in real-time.

---

## 3. State Management (`editor-store.ts`)

The application state is centralized in `apps/cli/src/frontend/stores/editor-store.ts`.

### Key Stores

*   **`$files`**: A map of open files and their content (dirty/clean state).
*   **`$activeTab`**: The currently selected file path.
*   **`$fileTree`**: The cached directory structure.
*   **`$settings`**: The parsed `course.json` object.

### Actions

*   **`openFile(path)`**: Fetches content from backend, adds to `$files`, sets `$activeTab`.
*   **`saveFile(path)`**: Pushes content to backend, marks as clean.
*   **`updateSettings(newSettings)`**: Optimistically updates UI, sends PATCH request to backend.

---

## 4. Backend API Reference

The frontend communicates with the CLI backend via these endpoints:

### Filesystem API (`/api/fs`)

*   `GET /api/fs/tree`: Returns the directory structure of `content/` and `runner/`.
*   `GET /api/fs/file?path=...`: Returns file content.
*   `POST /api/fs/file`: Writes file content (Save).
*   `POST /api/fs/rename`: Renames a file or directory.
*   `DELETE /api/fs/file`: Deletes a file or directory.

### Course API (`/api/course`)

*   `GET /api/course/config`: Returns the parsed `course.json`.
*   `PATCH /api/course/config`: Updates `course.json`.
*   `GET /api/course/validate`: Runs `CourseLoader.validateCourse()` and returns errors.

### Runner API (`/api/runner`)

*   `POST /api/runner/exec`: Triggers execution of a specific exercise.
*   `WS /api/runner/stream`: WebSocket connection for streaming stdout/stderr.

---

## 5. Extending the Editor

To add a new view (e.g., a "Quiz Builder"):

1.  **Create View Component**: Add `QuizBuilder.tsx` in `views/`.
2.  **Register Route**: Add the route in `App.tsx` (or the router config).
3.  **Update File Tree**: Modify `FileTree.tsx` to open your new view when clicking specific file types (e.g., `quiz.json`).
4.  **Add Store Logic**: Update `editor-store.ts` to handle the new file type's state.

## 6. Development Workflow

To work on the Editor itself:

1.  **Run Backend**: `cd apps/cli && bun run dev` (Starts server on port 3000).
2.  **Run Frontend**: The frontend is bundled with the CLI in production, but for dev, you can run `bun run dev:web` (if configured) or rely on the backend to serve the `dist/` folder after a build.
    *   *Tip*: Use `progy dev --ui` in a sample course directory to test changes in a real context.

## 7. Troubleshooting & FAQ

### 7.1 "Backend Disconnected"
If you see a red "Disconnected" banner, the frontend has lost connection to the CLI backend.

*   **Cause**: The `progy dev` process crashed or was terminated.
*   **Fix**: Restart `progy dev --ui`. Check the terminal for backend errors.

### 7.2 File Tree Not Updating
If you add files manually outside the editor, they might not appear immediately.

*   **Cause**: The OS file watcher (chokidar) might be slow or configured incorrectly.
*   **Fix**: Click the refresh icon in the File Tree header to force a re-scan.

### 7.3 Markdown Preview Broken
If complex diagrams (Mermaid) or math (LaTeX) fail to render:

*   **Cause**: Syntax error in the Markdown directive.
*   **Fix**: Check the browser console for specific parsing errors. Ensure directives like `::video` are closed properly.

### 7.4 "Unable to Save"
If saving fails:

*   **Cause**: Permission denied or file locked by another process.
*   **Fix**:
    1.  Check file permissions (`ls -l`).
    2.  Ensure no other editor has the file open in exclusive mode.
    3.  Check the backend logs for specific `fs.writeFile` errors.

## 8. Keyboard Shortcuts

Progy Studio supports standard shortcuts for efficiency:

*   `Cmd/Ctrl + S`: Save current file.
*   `Cmd/Ctrl + P`: Quick Open file (fuzzy search).
*   `Cmd/Ctrl + B`: Toggle Sidebar.
*   `Cmd/Ctrl + \`: Split Editor (if supported).
*   `Cmd/Ctrl + J`: Toggle Terminal panel.
