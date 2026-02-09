# Progy Instructor Guide

Welcome to the Progy Instructor Guide. This document is the definitive reference for creating, structuring, and distributing interactive coding courses on the Progy platform. Whether you are building a simple "Hello World" tutorial or a complex microservices architecture course, this guide will walk you through every concept.

---

## 1. Introduction

A Progy Course is more than just a collection of Markdown files. It is an interactive learning environment that combines:
*   **Structured Content**: Lessons and modules organized logically.
*   **Live Code Execution**: Students run code directly in their environment.
*   **Smart Feedback**: Automated tests and diagnostics (Smart Runner Protocol).
*   **Rich Media**: Quizzes, diagrams, and explanations.

Progy courses are designed to be **git-native**. Students clone a repository, and the Progy CLI layers interactive content on top of their workspace.

---

## 2. Project Structure

A standard Progy course follows a strict directory structure to ensure the CLI can parse and run it correctly.

```text
my-awesome-course/
├── course.json          # Main configuration file (The "Manifest")
├── progy.toml           # Workspace configuration (Student's state)
├── Dockerfile           # (Optional) For custom environments
├── runner.py            # (Optional) Wrapper script for SRP
├── content/             # (Optional) Static content like images
└── exercises/           # The core learning material
    ├── 01_intro/        # Module 1
    │   ├── 01_hello/    # Exercise 1
    │   │   ├── main.py  # Starter code
    │   │   ├── README.md# Instructions
    │   │   └── quiz.json# (Optional) Quiz
    │   └── info.toml    # Module metadata
    └── 02_advanced/     # Module 2
        └── ...
```

### Key Files
*   **`course.json`**: Defines the runner type, command to execute code, and course metadata.
*   **`exercises/`**: Contains the actual lessons. The folder structure dictates the menu in the UI.
*   **`README.md` (inside exercise)**: The lesson text displayed to the student. Supports standard Markdown.
*   **`main.*` (inside exercise)**: The entry point file the student will edit.

---

## 3. Course Configuration (`course.json`)

This is the heart of your course. It tells Progy how to run the student's code.

### Schema

```json
{
  "id": "python-mastery",
  "name": "Python Mastery: From Zero to Hero",
  "description": "A comprehensive guide to modern Python.",
  "runner": {
    "type": "process",
    "command": "python3 {{exercise}}"
  },
  "content": {
    "exercises": "exercises"
  }
}
```

### Runner Types

The `runner.type` field determines *where* and *how* the code executes.

1.  **`process` (Default)**: Runs directly on the student's host machine.
    *   **Pros**: Zero setup, fast.
    *   **Cons**: Requires student to have languages installed (e.g., Python, Rust). insecure (runs on host).
    *   **Best For**: Simple syntax tutorials, CLI tools.

2.  **`docker-local`**: Runs inside a Docker container on the student's machine.
    *   **Pros**: reproducible environment, isolated, supports complex dependencies.
    *   **Cons**: Requires Docker Desktop.
    *   **Best For**: Web servers, databases, specific compiler versions.

3.  **`docker-compose`**: Runs a multi-container stack.
    *   **Pros**: Full integration testing (App + DB + Cache).
    *   **Best For**: Full-stack engineering courses.

---

## 4. The Smart Runner Protocol (SRP)

The **Smart Runner Protocol (SRP)** is how the executed code communicates back to the Progy UI. It allows you to show rich results like "✅ 5/5 Tests Passed" instead of just raw text output.

### The Format
The runner (or your code) must print a JSON block wrapped in special markers to `stdout`:

```text
__SRP_BEGIN__
{
  "success": true,
  "summary": "All tests passed!",
  "diagnostics": [],
  "tests": [
    { "name": "Function add(2,2)", "status": "pass" },
    { "name": "Function sub(5,3)", "status": "pass" }
  ],
  "raw": "Output: 4\nOutput: 2"
}
__SRP_END__
```

### Fields
*   `success` (bool): Did the exercise pass? Controls the green/red status.
*   `summary` (string): A short message displayed prominently.
*   `tests` (array): List of individual test cases.
*   `diagnostics` (array): Compiler errors or linter warnings (file, line, message).
*   `raw` (string): The actual stdout/stderr to show in the console log.

---

## 5. Implementing a Custom Runner (The Wrapper Pattern)

**Crucial Concept**: You typically do **not** want students to write `print("__SRP_BEGIN__")` in their code. It's ugly and confusing.

Instead, you use the **Wrapper Pattern**. You create a script (e.g., `runner.py`, `runner.js`) that runs the student's code, captures the output, and prints the SRP JSON.

### Step-by-Step Guide: Docker Local Runner

Let's create a robust Python course using `docker-local`.

#### 1. Configuration (`course.json`)
Point the command to your *wrapper script*, passing the student's file as an argument.

```json
{
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}"
  }
}
```
*Note*: `{{exercise}}` is a placeholder Progy replaces with the path to the student's file (e.g., `exercises/01_hello/main.py`).

#### 2. The `Dockerfile`
Install Python and copy your wrapper script into the image.

```dockerfile
FROM python:3.9-slim

# Set workdir
WORKDIR /workspace

# Copy the wrapper script (which you will create in the root of your repo)
COPY runner.py /workspace/runner.py

# Default command (fallback)
CMD ["python3", "/workspace/runner.py"]
```

#### 3. The Wrapper Script (`runner.py`)
This script does the heavy lifting: executes code -> catches errors -> formats JSON.

```python
import sys
import subprocess
import json

def main():
    # 1. Get the file path from arguments
    if len(sys.argv) < 2:
        print("Error: No file provided.")
        sys.exit(1)

    file_path = sys.argv[1]

    # 2. Run the student's code
    try:
        result = subprocess.run(
            ["python3", file_path],
            capture_output=True, # Capture stdout/stderr
            text=True,
            timeout=5 # Prevent infinite loops
        )

        success = result.returncode == 0
        output = result.stdout + result.stderr

        # 3. Construct SRP JSON
        response = {
            "success": success,
            "summary": "Execution Successful" if success else "Runtime Error",
            "raw": output
        }

    except subprocess.TimeoutExpired:
        response = {
            "success": False,
            "summary": "Timeout: Code took too long to run.",
            "raw": ""
        }

    # 4. Print the Protocol
    print("__SRP_BEGIN__")
    print(json.dumps(response))
    print("__SRP_END__")

if __name__ == "__main__":
    main()
```

#### 4. The Student Experience
The student opens `exercises/01_hello/main.py`.
They see:
```python
print("Hello World")
```
They click "Run".
They see:
**✅ Execution Successful**
```text
Hello World
```

They never see `runner.py` or `__SRP_BEGIN__`. This is the ideal experience.

---

## 6. Advanced: Multi-Container Environments (`docker-compose`)

For full-stack courses (e.g., "Node.js with Redis"), a single container isn't enough. Use `docker-compose`.

### Configuration
```json
{
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "app_test"
  }
}
```
*   `service_to_run`: The specific service name in compose that runs the tests.

### `docker-compose.yml`
```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine

  app_test:
    build: .
    volumes:
      - .:/workspace # Mount code
    depends_on:
      - redis
    environment:
      REDIS_URL: redis://redis:6379
    command: npm test
```

When the student runs code:
1.  Progy runs `docker compose up redis` (implicitly via `run`).
2.  Progy runs `docker compose run --rm app_test`.
3.  The `app_test` container executes `npm test`.
4.  Progy cleans up with `docker compose down`.

---

## 7. Content Creation Details

### Metadata (`info.toml`)
Place an `info.toml` file in each module folder (e.g., `exercises/01_intro/info.toml`) to order exercises and define titles.

```toml
[module]
title = "Introduction to Python"
message = "Let's start your journey!"

[exercises]
# Order matters!
01_hello = "Hello World"
02_variables = { title = "Variables & Types", xp = 50 }
```

### Quizzes (`quiz.json`)
Place `quiz.json` inside an exercise folder to add a multiple-choice quiz tab.

```json
[
  {
    "question": "Which keyword defines a function in Python?",
    "options": [
      "func",
      "def",
      "function",
      "define"
    ],
    "answer": 1,
    "explanation": "Python uses 'def' to define functions."
  }
]
```
*Note*: `answer` is the zero-based index of the correct option.

### Markdown Features (`README.md`)
You can use standard Markdown. Progy also supports:
*   **Code Blocks**: Syntax highlighted.
*   **Images**: `![Alt](image.png)` (place images in `content/` and reference relatively or absolutely).
*   **Links**: Links to other exercises? (Planned feature).

---

## 8. CLI Tooling for Instructors

### `progy init`
Starts a new course boilerplate.
```bash
progy init --course rust
```

### `progy dev`
Runs the course in "hot-reload" mode. It serves the files directly from your disk.
*   Edit `course.json` -> Restart required.
*   Edit `README.md` -> Refresh browser.
*   Edit `runner.py` -> Next run uses new logic.

### `progy validate`
Runs static analysis to catch common errors.
*   Checks if `course.json` exists and is valid JSON.
*   Verifies `runner.command` formatting.
*   Ensures exercise directories matches structure.
*   Scans for potential security issues (e.g., hardcoded secrets).

### `progy pack`
Creates a `.progy` distribution file. This is a zip archive of your course, excluding `node_modules`, `.git`, etc.
```bash
progy pack --out my-course.progy
```

---

## 9. Best Practices Checklist

1.  **Isolation**: Always assume the student's machine is messy. Use Docker runners for anything beyond basic syntax.
2.  **Immutability**: The runner script should never modify the student's source file unless explicitly intended (e.g., code formatters).
3.  **Feedback**: Your runner should always catch `stderr` and print it. If the student makes a syntax error, they need to see the compiler output, not just "Failed".
4.  **Timeouts**: Always set a timeout in your runner (e.g., 5-10 seconds). Infinite loops in student code are common and will hang the Docker container.
5.  **Security**:
    *   Do not mount sensitive host directories.
    *   Run containers as non-root users where possible (use `USER student` in Dockerfile).
    *   Disable network (`network: "none"`) unless the exercise explicitly needs API access.

---

## 10. Troubleshooting Common Issues

### "Docker not found"
*   **Cause**: Docker Desktop is not running or not in PATH.
*   **Fix**: Ensure `docker info` works in the terminal.

### "Volume Mount Failed" (Windows)
*   **Cause**: Docker Desktop on Windows sometimes struggles with paths if not using WSL2.
*   **Fix**: Recommend students use WSL2 or ensure the drive is shared in Docker settings.

### "SRP JSON Decode Error"
*   **Cause**: Your runner script printed something *before* or *after* the JSON block, or the JSON is invalid.
*   **Fix**: Ensure `__SRP_BEGIN__` is on its own line. Ensure `stdout` from the student code isn't mixing with your JSON. Capture student output into a variable and put it inside the `raw` field of the JSON.

---

## 11. Example: A Complete Rust Course

**`course.json`**
```json
{
  "id": "rustlings-pro",
  "name": "Rustlings Pro",
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "/workspace/runner.sh {{exercise}}"
  }
}
```

**`Dockerfile`**
```dockerfile
FROM rust:1.75-slim
WORKDIR /workspace
COPY runner.sh /workspace/runner.sh
RUN chmod +x /workspace/runner.sh
```

**`runner.sh`**
```bash
#!/bin/bash
FILE=$1
# Extract filename without extension
BASENAME=$(basename "$FILE" .rs)

# Compile
rustc "$FILE" -o "/tmp/$BASENAME" 2> /tmp/build_error.log
COMPILE_STATUS=$?

echo "__SRP_BEGIN__"

if [ $COMPILE_STATUS -eq 0 ]; then
    # Run
    OUTPUT=$(/tmp/$BASENAME)
    echo "{\"success\": true, \"summary\": \"Compiled and Ran!\", \"raw\": \"$OUTPUT\"}"
else
    # Build Error
    ERROR=$(cat /tmp/build_error.log)
    # We escape quotes for JSON manually or use a tool like jq
    # Ideally, use a python/node script for the runner to handle JSON escaping safely.
    echo "{\"success\": false, \"summary\": \"Compilation Failed\", \"raw\": \"Build Failed\"}"
fi

echo "__SRP_END__"
```
*(Note: Bash string escaping for JSON is painful. Using Python/Node/Go for the runner script is recommended).*
