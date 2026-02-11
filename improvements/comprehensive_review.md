# Progy Codebase & Architecture Comprehensive Review

## 1. Executive Summary

This document serves as an extensive audit of the current Progy codebase (`apps/cli`, `apps/backend`) and a roadmap for future improvements. It covers security vulnerabilities, performance bottlenecks, architectural scalability, and proposed AI-driven features.

**Key Findings:**
- **Security:** The local Docker runner has potential escape vectors via volume mounting configuration. The backend API relies heavily on client-side configuration for AI features, which requires careful validation.
- **Performance:** Database tables like `courseProgress` and `registryDownloads` are prone to unbounded growth. Asset delivery is unoptimized (raw images).
- **Architecture:** The "Registry" design is solid but lacks automated validation and processing pipelines (Workflows).

---

## 2. Security Audit & Vulnerability Assessment

### 2.1 Local Docker Runner (`apps/cli/src/docker/client.ts`)

**Critical: Volume Mounting & Path Traversal**
The current implementation mounts the user's current working directory (`cwd`) to `/workspace` inside the container.
```typescript
const mountArg = `${opts.cwd}:/workspace`;
```
- **Risk:** If a user accidentally runs `progy start` from their root directory (`/`) or home directory (`~`), the container gains read/write access to their entire filesystem. A malicious course could include a `runner.py` that scans `../` for SSH keys or AWS credentials.
- **Mitigation:**
    1.  **Strict Path Validation:** Ensure `opts.cwd` is a subdirectory of the intended course root.
    2.  **Allowlist:** Only allow mounting specific directories (e.g., `content/`, `src/`).
    3.  **User Confirmation:** If the path seems too broad (e.g., contains `.ssh` or is a system root), prompt the user for confirmation.

**High: Command Injection via `shell: true`**
The helper method `runCommand` uses `shell: true`:
```typescript
spawn("docker", args, { shell: true })
```
- **Risk:** While `runContainer` uses `spawn` without `shell: true` (good), `runCommand` is used for `build` and checks. If any argument passed to `runCommand` is user-controlled (e.g., a tag name from `course.json`), it could lead to Command Injection on the host machine.
- **Mitigation:** Remove `shell: true` wherever possible. Use `child_process.execFile` or strictly sanitize inputs if shell features are absolutely necessary (e.g., for piping, though Node streams are safer).

**Medium: Network Isolation**
The default is `--network none`, which is excellent. However, `course.json` allows overriding this via `network_access: true`.
- **Risk:** A malicious course could use this to exfiltrate environment variables or local files if the user enables it without understanding the risks.
- **Mitigation:**
    - Display a **Warning Banner** in the CLI when a course requests network access.
    - Implement an allowlist of domains for the runner (requires a custom Docker network driver or proxy).

### 2.2 Backend API (`apps/backend`)

**Medium: AI Configuration Leakage**
The AI endpoints (`/ai/generate`, etc.) accept a `config` object from the client.
```typescript
const { config: clientConfig } = await c.req.json();
```
- **Risk:** If a "Lifetime" user (who provides their own key) is using a compromised or shared machine, their API key might be intercepted if the connection isn't perfectly secured (MITM) or if the client-side code logs it.
- **Mitigation:**
    - Encrypt API keys at rest in the client's `localSettings`.
    - Ideally, proxy all AI requests through the backend *without* sending the key from the client every time. Store the user's key in the backend (encrypted in D1/KV) and inject it server-side.

**Low: Rate Limiting**
There is no visible rate limiting middleware on the AI endpoints.
- **Risk:** A malicious user (even a Pro user) could drain the `OPENAI_API_KEY` quota by looping requests.
- **Mitigation:** Implement `upstash/ratelimit` or Cloudflare Rate Limiting rules on `/ai/*` routes.

---

## 3. Database & Performance Optimization

### 3.1 Database Schema (`apps/backend/src/db/schema.ts`)

**Optimization: `courseProgress` Blob**
```typescript
export const courseProgress = sqliteTable("course_progress", {
  data: text("data").notNull(), // JSON blob
});
```
- **Issue:** As a course grows, this JSON blob can become large (50KB+). Fetching it on every sync is inefficient.
- **Solution:**
    - **Normalization:** Split progress into a granular table: `user_exercise_progress (user_id, course_id, exercise_id, status, metadata)`.
    - **Differential Sync:** Only sync the changed exercises instead of the full blob.

**Optimization: `registryDownloads` Growth**
```typescript
export const registryDownloads = sqliteTable('registry_downloads', {
  id: text('id').primaryKey(),
  // ...
});
```
- **Issue:** This table will grow indefinitely (millions of rows). Querying "top courses" will become slow.
- **Solution:**
    - **Aggregation:** Use a scheduled Cloudflare Workflow (Cron) to aggregate daily downloads into a `registry_stats` table and archive/delete raw rows older than 30 days.
    - **Analytics Engine:** Offload raw download logs to Cloudflare Analytics Engine or a specialized time-series DB, keeping D1 for relational data only.

### 3.2 Asset Delivery

**Feature: Image Optimization Pipeline**
Currently, images in courses are likely served as-is (PNG/JPEG).
- **Proposal:** Implement a "Build Pipeline" for the Registry.
    1.  User publishes `my-course.progy`.
    2.  Cloudflare Workflow triggers.
    3.  Unpacks the archive.
    4.  Finds all images in `assets/`.
    5.  Converts them to **WebP** and **AVIF** (using `@cloudflare/workers-types` or a Rust WASM module).
    6.  Updates the `README.md` and content Markdown to point to the optimized versions (or uses a responsive image component in the frontend).
    7.  Repacks and uploads to R2.

---

## 4. Architecture & Scalability

### 4.1 The Registry "Build System" (Cloudflare Workflows)

The Registry currently seems to be a passive storage. We should upgrade it to an active "Continuous Integration" system for courses.

**Proposed Workflow: "Course Guard"**
**Trigger:** `progy publish`
**Steps:**
1.  **Static Analysis (Security):**
    - Scan `runner/` scripts for dangerous patterns (`rm -rf`, `curl`, encoded strings).
    - Check `dockerfile` for known vulnerable base images.
    - Validate `course.json` against a strict schema.
2.  **Quality Assurance:**
    - Run the "Solution" code provided by the instructor against the tests. If the instructor's own solution fails, reject the publish.
    - Check for broken links in Markdown files.
    - **AI Review:** Use an LLM to "grade" the clarity of the instructions and suggest improvements to the instructor *before* publishing.
3.  **Optimization:** (As mentioned in 3.2).

### 4.2 Telemetry & Observability

**Missing:** The CLI has minimal telemetry. We don't know:
- Average completion time per exercise.
- Common syntax errors students face (to improve the AI hints).
- "Drop-off" points where students quit a course.

**Proposal:**
- Add an anonymous telemetry event `exercise_completed` and `exercise_failed` sent to a new `/api/telemetry` endpoint (batched).
- Use this data to generate "Heatmaps" for instructors: "80% of students fail Exercise 4 on the first try."

---

## 5. Feature Roadmap & Innovation

### 5.1 AI-Driven "Smart Tutor" Workflow
Instead of just "Hints" on demand, implement a proactive tutor.
- **Logic:** If a student fails the same test 3 times:
    1.  CLI detects the pattern.
    2.  Sends the code + error + previous attempts to the backend.
    3.  **Cloudflare Workflow** invokes a specialized "Tutor Agent" (long-running LLM context).
    4.  The Agent analyzes the *misconception*, not just the bug.
    5.  Returns a "Micro-Lesson" (Markdown) to be displayed in the CLI/Editor.

### 5.2 "Multiplayer" Coding
Leverage Cloudflare Durable Objects (DO) for real-time state syncing.
- **Idea:** Allow an instructor to "watch" a student's terminal in real-time (with permission) to help debug.
- **Implementation:**
    - The CLI `Runner` streams stdout/stderr to a DO WebSocket.
    - Instructor connects to the same DO.
    - **Security:** Requires strict "Room" authentication and student consent handshake.

### 5.3 Offline-First "Git Sync"
The current "Layering" system is great. We can enhance it with a `git`-based backup system *for the student*.
- **Feature:** `progy backup --remote <github-url>`
- **Logic:**
    - Initializes a hidden git repo in `content/`.
    - Commits on every successful run.
    - Pushes to the user's private GitHub repo.
    - Creates a "Portfolio" of their learning automatically.

---

## 6. Code Quality & Refactoring

### 6.1 `apps/cli` Structure
The `apps/cli` folder mixes `commands`, `backend`, `frontend`, and `docker`.
- **Refactor:**
    - Move `apps/cli/src/frontend` to `apps/student-ui` (or similar) to separate the React code from the Node/Bun CLI code.
    - Move `docker` logic to `packages/runner-docker`.
    - Move `backend` (local server) to `packages/local-server`.
- **Benefit:** Cleaner dependency graph, easier testing, and allows the "Visual Editor" to reuse the local server logic without importing CLI commands.

### 6.2 Error Handling
Current error handling in `DockerClient` is basic.
```typescript
resolve({ exitCode: 1, output: `Failed to spawn docker: ${err.message}`, error: err.message });
```
- **Improvement:** Create typed Error classes (`DockerDaemonNotRunningError`, `ContainerTimeoutError`, `VolumeMountError`). This allows the UI to show specific "Fix it" buttons (e.g., "Start Docker Desktop" vs "Check Permissions").

---

## 7. Conclusion

Progy has a solid foundation with a modern stack (Bun, Cloudflare, React 19). The primary areas for improvement are:
1.  **Hardening the Runner:** Preventing path traversal and command injection is paramount.
2.  **Active Registry:** Transforming the registry from a file dump to an intelligent processing pipeline.
3.  **Data Scalability:** preparing the database for high-volume analytics.

Implementing the **"Course Guard" Workflow** and **Image Optimization** should be the immediate next steps to ensure the registry remains high-quality and performant.
