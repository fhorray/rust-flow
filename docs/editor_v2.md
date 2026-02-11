# Progy Studio (Visual Course Editor) Documentation

Progy Studio (formerly "Visual Course Editor") is the integrated development environment (IDE) for creating and managing Progy courses. It provides a rich, graphical interface for editing course content, configuration, and metadata, replacing manual JSON/TOML editing.

Progy Studio is distributed as a standalone CLI tool (`@progy/studio`), separate from the student runner (`progy`).

## 1. Getting Started

To launch the editor in your course directory:

```bash
cd my-course
bunx @progy/studio start
```

This will start the Studio server (usually on `http://localhost:3001`) and open your browser.

> **Note:** The legacy method `progy dev --ui` is deprecated. Please use `bunx @progy/studio start`.

---

## 2. Technical Overview

Progy Studio is built as a standalone **Bun** application (`apps/editor`) that serves a **React 19** SPA.

### Tech Stack

*   **Runtime**: **Bun** (Server-side) + **React 19** (Client-side).
*   **State Management**: **Nanostores** (Atomic, framework-agnostic state).
*   **Form Management**: **TanStack Form** (for complex configuration validation).
*   **Rich Text Editor**: **Tiptap** (ProseMirror wrapper with custom directives).
*   **Code Editor**: **CodeMirror 6**.
*   **Styling**: **Tailwind CSS** + **Radix UI**.

### Architecture

Unlike the student runner (`progy start`), which is optimized for lightweight execution, the Studio server is a full-featured development backend.

1.  **Studio Backend (`apps/editor/src/server.ts`)**:
    *   Starts a dedicated Bun HTTP server (default port: `3001` or `PORTS.EDITOR`).
    *   Mounts the core logic from `packages/core` but exposes instructor-only endpoints.
    *   **Endpoints**:
        *   `/api/fs/*`: Full read/write access to the local filesystem.
        *   `/api/git/*`: Git operations (commit, push, pull).
        *   `/api/instructor/*`: Specialized endpoints for course validation and scaffolding.

2.  **Frontend (`apps/editor/src/frontend`)**:
    *   A heavy-duty React application designed for desktop-class editing.
    *   Connects to the backend via REST and WebSockets.

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

To work on the Editor codebase itself (contributing to Progy):

1.  **Navigate to Editor App**: `cd apps/editor`
2.  **Run Dev Server**: `bun run dev` (Starts server with Hot Module Replacement).
3.  **Test with Course**: Set `PROG_CWD=/path/to/test-course` env var to point the editor to a real course.

*   *Tip*: For end-users, always use `bunx @progy/studio start`.

## 7. Troubleshooting & FAQ

### 7.1 "Backend Disconnected"
If you see a red "Disconnected" banner, the frontend has lost connection to the Studio backend.

*   **Cause**: The `progy-editor` process crashed or was terminated.
*   **Fix**: Restart the `bunx` command. Check the terminal for backend errors.

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