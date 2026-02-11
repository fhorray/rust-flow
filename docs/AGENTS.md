# Progy Course Generation Guide for AI Agents

This document serves as the **definitive instruction set** for AI agents (LLMs) tasked with generating educational courses for the Progy platform.

## 1. Project Structure

A Progy course is a directory containing a manifest, content, and runner configuration. You **MUST** strictly adhere to the following directory structure:

```text
my-course-name/
├── course.json          # [REQUIRED] The course manifest and configuration.
├── runner/              # [OPTIONAL] Custom runner scripts/Dockerfiles.
│   └── README.md
├── content/             # [REQUIRED] The educational content.
│   ├── 01_intro/        # Module 1 (Must start with 2 digits + underscore)
│   │   ├── info.toml    # [REQUIRED] Module metadata (Title, Prerequisites).
│   │   ├── 01_hello/    # Exercise 1 (Must start with 2 digits + underscore)
│   │   │   ├── README.md# Lesson text (Markdown).
│   │   │   ├── main.py  # Student's starter code.
│   │   │   └── test.py  # (Optional) Hidden test file.
│   │   └── 02_variables/
│   │       └── ...
│   └── 02_advanced/     # Module 2
│       └── ...
```

### Critical Rules

1.  **Naming Convention**: All modules and exercises inside `content/` **MUST** be prefixed with a two-digit number and an underscore (e.g., `01_intro`, `02_advanced`, `10_final`). The Progy CLI uses this for sorting.
2.  **`info.toml`**: Every module directory **MUST** contain an `info.toml` file defining its title and exercises.
3.  **`course.json`**: This file **MUST** exist at the root.

---

## 2. Configuration Schemas

### 2.1 `course.json` (The Manifest)

This file defines the global settings and the runner environment.

```json
{
  "id": "course-slug",         // [REQUIRED] URL-safe unique identifier (a-z, 0-9, -).
  "name": "Course Title",      // [REQUIRED] Display name.
  "version": "1.0.0",          // [OPTIONAL] Semantic versioning.
  "runner": {
    "type": "process",         // [REQUIRED] One of: "process", "docker-local", "docker-compose".
    "command": "python3 {{exercise}}", // [REQUIRED] Command to execute. {{exercise}} is the file path placeholder.
    "dockerfile": "Dockerfile", // [OPTIONAL] Path to Dockerfile (relative to root).
    "image_tag": "python:3.9"   // [OPTIONAL] If using a pre-built image instead of Dockerfile.
  },
  "content": {
    "root": "content",         // [REQUIRED] Usually "content".
    "exercises": "content"     // [REQUIRED] Usually "content".
  },
  "progression": {
    "mode": "sequential",      // "sequential" (lock next) or "open" (free roam).
    "strict_module_order": true // If true, Module 2 is locked until Module 1 is done.
  }
}
```

### 2.2 `info.toml` (Metadata)

This file controls the module's presentation and prerequisites.

```toml
# Module Metadata
[module]
title = "Introduction to Python"  # Display title in the sidebar
message = "Welcome to the course!" # Optional completion message
prerequisites = ["module:00_setup"] # Optional: Lock this module until 00_setup is done

# Exercise Metadata
# Format: "directory_name" = { title = "Display Title", prerequisites = [...] }

[exercises]
01_hello = "Hello World"  # Simple string = Title only

02_variables = { title = "Variables & Types", xp = 50 } # Advanced object

03_challenge = {
    title = "Final Challenge",
    prerequisites = ["exercise:01_intro/02_variables", "quiz:01_intro/01_hello:80"]
}
```

#### Prerequisite Syntax

*   `module:<id>`: Requires an entire module to be completed.
*   `exercise:<module_id>/<exercise_id>`: Requires a specific exercise to be passed.
*   `quiz:<module_id>/<exercise_id>:<min_score>`: Requires a quiz to be passed with a minimum score (0-100).

---

## 3. The Smart Runner Protocol (SRP)

When a student runs code, the output is parsed by the Progy CLI. To provide rich feedback (Green Checkmarks, structured errors), your runner **MUST** output a JSON block wrapped in specific markers.

**Do NOT** ask the student to write this JSON. You must use a **Wrapper Script**.

### 3.1 The Wrapper Pattern

1.  Create a script (e.g., `runner/wrapper.py`) that runs the student's code.
2.  The wrapper captures `stdout`/`stderr` and exit code.
3.  The wrapper prints the **SRP JSON**.

### 3.2 SRP JSON Schema

```json
__SRP_BEGIN__
{
  "success": true,           // [REQUIRED] boolean.
  "summary": "Short Text",   // [REQUIRED] 1-line result summary.
  "raw": "Full Output...",   // [REQUIRED] The actual student code output.
  "tests": [                 // [OPTIONAL] List of test cases.
    { "name": "Test 1", "status": "pass" },
    { "name": "Test 2", "status": "fail", "message": "Expected 5, got 3" }
  ],
  "diagnostics": [           // [OPTIONAL] Compiler errors.
    { "severity": "error", "message": "Syntax Error", "line": 10 }
  ]
}
__SRP_END__
```

### 3.3 Example Wrapper (Python)

```python
import sys, subprocess, json

# 1. Run Student Code
# args: python3 wrapper.py <student_file.py>
student_file = sys.argv[1]
result = subprocess.run(["python3", student_file], capture_output=True, text=True)

# 2. Construct JSON
output = {
    "success": result.returncode == 0,
    "summary": "Execution Successful" if result.returncode == 0 else "Runtime Error",
    "raw": result.stdout + result.stderr
}

# 3. Print Protocol
print("__SRP_BEGIN__")
print(json.dumps(output))
print("__SRP_END__")
```

### 3.4 Example Runner (Rust)

For compiled languages, the runner must handle compilation **and** execution.

```rust
// runner/src/main.rs
use std::process::Command;
use std::env;
use serde_json::json;

fn main() {
    let args: Vec<String> = env::args().collect();
    let student_file = &args[1]; // e.g., "content/01/main.rs"

    // 1. Compile
    let compile = Command::new("rustc")
        .arg(student_file)
        .arg("-o")
        .arg("/tmp/student_bin")
        .output()
        .expect("Failed to execute rustc");

    if !compile.status.success() {
        print_srp(false, "Compilation Error", &String::from_utf8_lossy(&compile.stderr));
        return;
    }

    // 2. Run
    let run = Command::new("/tmp/student_bin")
        .output()
        .expect("Failed to run binary");

    let success = run.status.success();
    let output = String::from_utf8_lossy(&run.stdout).to_string()
               + &String::from_utf8_lossy(&run.stderr).to_string();

    print_srp(success, if success { "Success" } else { "Runtime Error" }, &output);
}

fn print_srp(success: bool, summary: &str, raw: &str) {
    let json = json!({
        "success": success,
        "summary": summary,
        "raw": raw
    });
    println!("__SRP_BEGIN__");
    println!("{}", json.to_string());
    println!("__SRP_END__");
}
```

### 3.5 Example Runner (Node.js)

```javascript
// runner/index.js
const { spawnSync } = require('child_process');

const file = process.argv[2];
const result = spawnSync('node', [file], { encoding: 'utf-8' });

const output = {
  success: result.status === 0,
  summary: result.status === 0 ? "Execution Successful" : "Runtime Error",
  raw: result.stdout + result.stderr,
  // Parse error stack traces here to generate diagnostics if needed
};

console.log("__SRP_BEGIN__");
console.log(JSON.stringify(output));
console.log("__SRP_END__");
```

---

## 4. Content Creation Guidelines

### 4.1 Markdown Features (`README.md`)

Progy supports standard Markdown + GitHub Flavored Markdown (GFM). Additionally, use these **Directives** for interactive content:

*   **Videos**: `::video{src="https://..."}`
*   **Callouts/Notes**:
    ```markdown
    ::note{title="Pro Tip"}
    This is a helpful tip!
    ::
    ```
*   **Quizzes**: `::quiz{id="quiz-filename"}` (if defined in `quiz.json`).

### 4.2 Quizzes (`quiz.json`)

To add a quiz to an exercise, create a `quiz.json` file in the exercise directory:

```json
[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5"],
    "answer": 1, // Index of correct answer (0-based)
    "explanation": "Math is universal."
  }
]
```

---

## 5. Step-by-Step Generation Prompt for Agents

When generating a course, follow this exact sequence:

**Step 1: Define the Manifesto**
Create `course.json`. Decide on the `runner.type`. If the course requires complex dependencies (databases, specific versions), use `docker-local`. If it's simple Python/JS, `process` is fine (but note security implications).

**Step 2: Create Directory Skeleton**
Generate the folder structure with `01_` prefixes.
`mkdir -p content/01_intro/01_hello`

**Step 3: Create Metadata**
Write `content/01_intro/info.toml`. Define the human-readable titles for the module and its exercises.

**Step 4: Create Content**
For each exercise:
1.  Write `README.md`: Explain the concept clearly. Use a `::note` for the key takeaway.
2.  Write `main.ext`: The starter code. It should be runnable but incomplete (or contain a bug to fix).
3.  Write `solution.ext` (Optional but recommended): The reference solution.

**Step 5: Create the Runner**
If using `process` or `docker-local`:
1.  Write the `wrapper` script (e.g., `runner/wrapper.py`).
2.  Update `course.json`'s `command` to point to it: `"python3 runner/wrapper.py {{exercise}}"`.

**Step 6: Validation**
Ensure strict JSON syntax in `course.json` and strict TOML in `info.toml`. Verify that all `prerequisites` reference valid IDs.

### 5.1 Verification Commands

Instruct the user to verify the course with:
*   `progy dev`: To run the course as a student (cli runner).
*   `bunx @progy/studio start`: To open the visual editor for final tweaks.