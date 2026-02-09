# Progy Instructor Guide

This guide details how to create, structure, validate, and package Progy courses.

## Getting Started

To create a new course, use the `create-course` command. This scaffolds a new directory with the necessary configuration and a sample lesson.

```bash
# Create a new Rust course
progy create-course --name my-rust-course --course rust

# Create a new Go course
progy create-course --name my-go-course --course go
```

## Course Structure

A valid Progy course must follow this directory structure:

```
my-course/
├── course.json          # Main configuration file
├── SETUP.md             # Initial setup instructions for students
├── runner/              # Custom runner logic (optional but recommended)
│   ├── Dockerfile       # (If using containerized runners)
│   └── ...
└── content/             # Course content organized by modules/lessons
    ├── 01_intro/        # Module 1
    │   ├── README.md    # Lesson instructions
    │   └── main.rs      # Exercise code (with errors for students to fix)
    └── 02_variables/    # Module 2
        ├── README.md
        └── main.rs
```

## Configuration: `course.json`

The `course.json` file is the heart of your course. It defines metadata and how exercises are executed.

```json
{
  "id": "my-rust-course",
  "name": "Rust Fundamentals",
  "description": "Learn Rust from scratch.",
  "runner": {
    "command": "cargo run --quiet",
    "args": [],
    "entry": "main.rs"
  },
  "content": "content"
}
```

- **id**: Unique identifier for the course (kebab-case).
- **name**: Display name.
- **description**: Short description.
- **runner**: Configuration for the test runner.
    - **command**: The command to execute the student's code (e.g., `cargo run`, `go run`, `node`).
    - **args**: Array of additional arguments.
    - **entry**: The entry point file for exercises (e.g., `main.rs`, `index.js`).
    - **cwd**: (Optional) Working directory for execution.

## Writing Content

Each lesson lives in its own subdirectory under `content/`.

### 1. `README.md` (The Lesson)
This file contains the lesson text, theory, and instructions.

**Header Format:**
You *must* include a specific header comment block in your exercise file (e.g., `main.rs`) for metadata, but the `README.md` is standard Markdown.

### 2. The Exercise File
This is the code file students will edit (e.g., `main.rs`). It should:
1.  Include the required header block.
2.  Contain code that *fails* to compile or pass tests initially.
3.  Require the student to fix it based on the README instructions.

**Example Header (`main.rs`):**
```rust
// Difficulty: Easy
// Topic: Variables
// Description: Fix the variable declaration to make the code compile.
// Hints: Rust variables are immutable by default. Use 'mut'.

fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    x = 6; // Error here!
    println!("The value of x is: {}", x);
}
```

## Development Workflow

1.  **Initialize**: Run `progy create-course` to start.
2.  **Develop**: Run `progy dev` in your course directory.
    -   This starts a local server where you can view and test your course exactly as a student would.
    -   Changes to files are reflected immediately (hot-reload).
3.  **Validate**: Run `progy validate` frequently to catch structure errors.
    ```bash
    progy validate .
    ```
4.  **Package**: When ready, package your course into a `.progy` file.
    ```bash
    progy pack --out my-course-v1.progy
    ```

## Publishing

Currently, courses are distributed via Git repositories or `.progy` files.
-   **Git**: Push your course to a public Git repository. Students can start it via `progy init --course <git-url>`.
-   **File**: Share the `.progy` file directly. Students run `progy start my-course.progy`.

## Best Practices

-   **Keep it Atomic**: Each lesson should teach *one* concept.
-   **Clear Errors**: Ensure the initial error message seen by the student gives a clue about what's wrong.
-   **Validation**: Always run `progy validate` before pushing updates.
-   **Runner Security**: If your course involves complex dependencies, ensure the runner environment (e.g., `runner/`) is self-contained.
