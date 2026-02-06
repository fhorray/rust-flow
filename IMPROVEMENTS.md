# 🚀 Proposed Improvements for Progy

This document details concrete, incremental improvements to the existing **Progy** codebase (`apps/prog`), focusing on user experience, performance, and code quality.

---

## 1. 🖥️ CLI Enhancements (`apps/prog/src/cli.ts`)

### **A. Smart Offline Mode**
*   **Current State:** The CLI attempts to fetch progress from the cloud if a token exists, but timeouts can be aggressive or silent failures can occur.
*   **Improvement:** Implement an explicit "Offline Mode" flag (`--offline`). If cloud sync fails, cache the request locally in a `.progy/pending_sync.json` queue and retry on the next run.
*   **Implementation:**
    *   Add `OfflineQueue` logic in `server.ts`.
    *   Update `progy init` to check for internet connectivity before attempting downloads.

### **B. Global Course Cache**
*   **Current State:** `progy init` copies course content from `courses/` or clones it.
*   **Improvement:** Store downloaded course templates in a global user directory (e.g., `~/.progy/cache/courses/rust-v1`).
*   **Benefit:** `progy init` becomes instant for subsequent projects, even without internet.

---

## 2. ⚡ Backend & Runner (`apps/prog/src/backend`)

### **A. Structured Runner Protocol (SRP) v2**
*   **Current State:** The backend spawns a process and regex-parses stdout. This is brittle.
*   **Improvement:** Standardize the runner output to a rigid JSON schema (already hinted at in `RUNNERS.md`).
    *   **Action:** Enforce that *all* runners (Rust, Go, etc.) emit `__SRP_BEGIN__ { json } __SRP_END__`.
    *   **Backend:** Replace regex guessing with `JSON.parse` validation.
    *   **UI:** Display specific "Hints" and "Diffs" provided directly by the runner JSON, rather than AI guessing.

### **B. Process Pooling (Performance)**
*   **Current State:** Every "Run" click spawns a new `cargo run` or `go test` process.
*   **Improvement:** For languages with heavy startup (like Java or heavy Rust crates), keep a "warm" runner process or use a daemon (e.g., `cargo-watch`).
    *   *Note:* This is complex, but for `bun test` or Python, we can keep a worker alive.

---

## 3. 🎨 Dashboard & UX (`apps/prog/src/frontend`)

### **A. "Zen Mode" Toggle**
*   **Current State:** The UI is dense (Sidebar, Header, Output, Editor).
*   **Improvement:** Add a button/hotkey (`Cmd+Z`) to collapse the Sidebar and Header, maximizing the Problem Description and Terminal area for small screens.

### **B. Enhanced Progress Visualization**
*   **Current State:** Simple "Streak" counter.
*   **Improvement:** Add a **Module Progress Bar** in the Sidebar.
    *   Show "3/10 completed" for the current section.
    *   Visual indicator (Gold border) for "Perfect" completion (first try).

### **C. Improved "Open in Editor"**
*   **Current State:** Tries to open the file.
*   **Improvement:** Support line numbers.
    *   If the compiler error says `main.rs:12:5`, clicking the error in the Output log should open VS Code *at line 12*.
    *   **Backend:** `api/ide/open` endpoint already accepts `path`. Add `line` and `column` params.

---

## 4. 🧹 Code Quality & Architecture

### **A. Type-Safe API Contract**
*   **Current State:** Frontend uses `fetch` with manual typing.
*   **Improvement:** Share TypeScript types (`types.ts`) between Backend and Frontend via a shared workspace package or simple import (since it's a monorepo).
    *   Use a lightweight RPC client (like `hono/client` or `tRPC`) to eliminate "stringly typed" URLs.

### **B. Configuration Validation**
*   **Current State:** `course.json` is read with loose checks.
*   **Improvement:** Add **Zod** schema validation for `course.json` and `progress.json`.
    *   Fail fast with helpful error messages if a course author makes a typo in `runner.args`.
