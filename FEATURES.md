# 🚀 prog (Prog) - Future Features & Roadmap

This document outlines a comprehensive vision for the evolution of the `prog` platform. It details advanced features designed to enhance the learning experience for students, provide powerful tools for instructors, and ensure a robust, scalable technical foundation.

---

## 📚 Table of Contents

1. [Gamification & Structured Progress](#1-gamification--structured-progress)
2. [Smart Runners: Sandboxing & WebAssembly](#2-smart-runners-sandboxing--webassembly)
3. [Rich Interactive Content & Quizzes](#3-rich-interactive-content--quizzes)
4. [Cloud Integration & Real-World Deployment](#4-cloud-integration--real-world-deployment)
5. [Proactive AI Mentor](#5-proactive-ai-mentor)
6. [Course Creator CLI Mode](#6-course-creator-cli-mode)

---

## 1. Gamification & Structured Progress

Moving beyond simple "pass/fail" results to a rich, rewarding progression system.

### 🎓 For the Student

- **Experience Points (XP)**: Earn XP based on exercise difficulty and efficiency (e.g., passing on the first try).
- **Streaks**: Visual indicators of daily learning consistency.
- **Skill Tree**: Visual map showing mastery of concepts (e.g., "Memory Safety", "Async Programming", "HTTP APIs").
- **Badges**: Unlockable achievements like _"Bug Hunter"_ (Fixed 10 compilation errors) or _"Speedster"_ (Solved under 2 mins).

### 👨‍🏫 For the Instructor

- **Detailed Analytics**: Define custom metrics. Instead of just "Tests Passed", an instructor can define a check for "Used Pattern Matching" vs "Used If/Else".
- **Leaderboards**: Optional configurations to enable class-wide leaderboards for competitive workshops.

### 🛠️ Implementation Details

**Structured Runner Output:**
Runners will no longer output just text. They will emit a standardized JSON format that the UI parses.

```json
// Runner Output (stdout)
{
  "status": "passed",
  "execution_time_ms": 450,
  "tests": [
    { "name": "test_greeting", "passed": true },
    { "name": "test_edge_case_empty", "passed": true }
  ],
  "metrics": {
    "cyclomatic_complexity": 3,
    "lines_of_code": 12
  },
  "achievements_unlocked": ["clean_code_v1"]
}
```

**State Persistence (`progress.json`):**
Enhanced schema to track metadata.

```json
{
  "user": "student_1",
  "courses": {
    "rust": {
      "xp": 1200,
      "completed_exercises": ["01_variables", "02_functions"],
      "badges": ["first_blood"],
      "skills": {
        "borrow_checker": 0.8,
        "syntax": 1.0
      }
    }
  }
}
```

---

## 2. Smart Runners: Sandboxing & WebAssembly

Ensuring security, consistency, and portability for code execution.

### 🎓 For the Student

- **Zero Setup**: For Wasm-supported languages, run code instantly in the browser without installing Go/Rust/Node locally.
- **Safe Experimentation**: Try dangerous commands (`rm -rf /`) in a Docker sandbox without destroying their own machine.

### 👨‍🏫 For the Instructor

- **Reproducibility**: Guarantee that "it works on my machine" applies to everyone by defining a Docker image for the course.
- **System-Level Exercises**: Teach networking, file systems, and process management safely.

### 🛠️ Implementation Details

**Strategy A: Docker Sandboxing**
The `course.json` defines a Docker image. The `prog` runner spawns a container for each test run.

- **Config**: `"runner": { "type": "docker", "image": "golang:1.21-alpine" }`
- **Flow**:
  1.  UI sends code to Backend.
  2.  Backend writes code to a temporary volume.
  3.  Backend runs: `docker run --rm -v /tmp/code:/app golang:1.21 go test ./...`
  4.  Output is streamed back to UI.

**Strategy B: WebAssembly (Client-Side)**
For lightweight exercises, compile the runner to Wasm.

- **Rust Example**: The Rust compiler (rustc) can be compiled to Wasm (or use an API like glot.io, though local Wasm is preferred for offline).
- **Flow**:
  1.  UI loads `rust_runner.wasm`.
  2.  Code is compiled in-browser (using a Wasm-based compiler port) or sent to a stateless compilation server that returns a `.wasm` binary.
  3.  The browser executes the binary in a Web Worker.
  4.  Result: Near-instant feedback, zero server load.

---

## 3. Rich Interactive Content & Quizzes

Mixing coding practice with theoretical reinforcement.

### 🎓 For the Student

- **Multimedia Learning**: Watch a 2-minute concept video inside the IDE before coding.
- **Instant Verification**: Answer multiple-choice questions to unlock the coding exercise.
- **Interactive Diagrams**: Click on memory layouts (Stack vs Heap) to visualize ownership.

### 👨‍🏫 For the Instructor

- **Markdown Extensions**: Use custom tags in `README.md`.
  - `::video[https://youtu.be/xyz]`
  - `::quiz[quiz_id]`
- **Quiz Schema**: Define quizzes in simple TOML/JSON files alongside exercises.

### 🛠️ Implementation Details

**Quiz Definition (`quiz.toml`):**

```toml
[[questions]]
id = "ownership_1"
text = "What happens when you pass a String to a function without &?"
type = "single_choice"
options = [
  "It is borrowed",
  "It is moved",
  "It is copied"
]
correct_answer = 1
explanation = "String does not implement Copy, so ownership is transferred."
```

**UI Rendering:**
The React frontend detects `quiz.toml` in the lesson folder. It renders a "Quiz Tab". The student must pass the quiz (local validation) before the "Run Code" button becomes active (optional gatekeeping).

---

## 4. Cloud Integration & Real-World Deployment

bridging the gap between "Hello World" and Production.

### 🎓 For the Student

- **Real Feedback**: See their code running on the real internet, not just `localhost`.
- **DevOps Skills**: Learn the flow of `Code -> Test -> Deploy`.
- **Portfolio**: Automatically build a portfolio of deployed mini-apps (e.g., "Here is my Cloudflare Worker URL").

### 👨‍🏫 For the Instructor

- **End-to-End Projects**: Create courses that result in a deployed chat app, API, or blog.
- **Environment Management**: Define `wrangler.toml` or `fly.toml` templates that are auto-filled with student API keys.

### 🛠️ Implementation Details

**Deployment Hook in `course.json`:**

```json
{
  "commands": {
    "test": "bun test",
    "deploy": "wrangler deploy --dry-run --outdir dist",
    "verify_deploy": "curl -f https://student-app.workers.dev/health"
  }
}
```

**Workflow:**

1.  **Test Phase**: Student passes all unit tests (`prog` runner).
2.  **Deploy Phase**: UI shows "Deploy" button.
    - Backend executes the `deploy` command.
    - Requires student to have authenticated CLI tools (e.g., `wrangler login` done previously).
3.  **Verification**: Backend runs `verify_deploy` against the live URL to confirm it actually works in production.

---

## 5. Proactive AI Mentor

Moving from "Error Explainer" to "Coding Coach".

### 🎓 For the Student

- **Style Guide Enforcement**: "Your code works, but in Go we prefer early returns. Try refactoring this `if/else`."
- **Refactoring Challenges**: "Great job! Now try solving this using `map` instead of a `for` loop."
- **Concept Deep Dive**: "You seemed to struggle with `Lifetime`. Here is a custom mini-exercise generated just for you."

### 👨‍🏫 For the Instructor

- **Persona Configuration**: Configure the AI to be a "Strict Senior Engineer" or a "Patient Tutor".
- **Knowledge Base**: Feed the AI specific course notes so it answers using _your_ terminology.

### 🛠️ Implementation Details

**Context-Aware Prompts:**
The backend constructs a rich prompt context:

- Current Code
- Compiler Errors
- **Previous Attempts** (History)
- **Course Topic** (e.g., "We are learning Structs right now").

**Adaptive Generation Loop:**

1.  **Trigger**: Student fails the same test 3 times.
2.  **Action**: AI generates a simplified version of the problem (a "bridge exercise").
3.  **Storage**: Saved to `lessons/practice/bridge_exercise_123.rs`.
4.  **UI**: "It looks like you're stuck. Try this simpler challenge first!"

---

## 6. Course Creator CLI Mode

Empowering the community to build and share courses.

### 🎓 For the Student

- Access to a wide variety of community-created courses (Python, C++, Solidity, etc.).

### 👨‍🏫 For the Instructor

- **Scaffolding**: Generate a full course structure in seconds.
- **Packaging**: Bundle the course into a single distributable file (or git repo).

### 🛠️ Implementation Details

**CLI Command: `prog create-course`**

```bash
$ prog create-course --name "advanced-python" --lang python
> Created courses/advanced-python/
> Created courses/advanced-python/course.json
> Created courses/advanced-python/lessons/01_intro/
```

**Template Generation:**
The CLI will generate a starter `course.json` with sensible defaults for the chosen language (e.g., pre-filling `pytest` for Python).

**Validation:**
`prog validate-course ./my-course`

- Checks JSON schema of `course.json`.
- Verifies all lessons have a `README.md` and an entry point file.
- Runs all solutions (expecting them to pass) to ensure the course is broken-free before publishing.
