# Creating Courses

This guide explains how to create and structure a course for Progy.

## Creating a New Course

You can scaffold a new course using the built-in templates:

```bash
# Create a Rust course
progy create-course --name my-rust-course --course rust

# Create a Go course
progy create-course --name my-go-course --course go
```

These templates (`apps/progy/src/templates.ts`) provide a working `course.json` and directory structure.

## Directory Structure

A Progy course has the following structure:

```
my-course/
├── course.json        # Course configuration
├── SETUP.md          # Setup instructions for the user
├── content/          # Content directory
    ├── 01_intro/     # Module directory
        ├── info.toml # Module metadata
        ├── ex1/      # Exercise/Lesson directory
            ├── README.md    # Exercise instructions
            ├── index.js     # Starter code
            ├── quiz.json    # (Optional) Quiz
```

## `course.json`

The `course.json` file defines the course metadata and runner configuration. For a complete guide on all available fields and configurations, see the [Course Configuration Guide](./course-configuration.md).

```json
{
  "id": "my-course",
  "name": "My Awesome Course",
  "runner": {
    "command": "node",
    "args": ["./runner/index.js", "test", "content/{{id}}"],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      {
        "name": "Node.js",
        "type": "command",
        "command": "node --version"
      }
    ],
    "guide": "SETUP.md"
  }
}
```

- **runner**: Configures how to execute the code. `{{id}}` is replaced by the exercise ID/path.
- **setup.checks**: Commands to verify the user's environment before starting.

## Writing Content

### Markdown Syntax

Progy uses standard Markdown with some custom extensions:

- **Videos**: Embed a video player.

  ```markdown
  ::video[https://example.com/video.mp4]
  ```

- **Notes**: specific note blocks.
  ```markdown
  ::note[This is an important note for the student.]
  ```

### Modules (`info.toml`)

Each module directory (e.g., `01_intro`) should have an `info.toml` file to define its title and the order of exercises.

```toml
[module]
message = "Module Title"

[exercises]
ex1 = "Exercise 1 Title"
ex2 = "Exercise 2 Title"
quiz1 = "Module Quiz"
```

The keys (e.g., `ex1`, `quiz1`) must match the directory names inside the module.

### Exercises

An exercise directory contains:

1.  **`README.md`**: The lesson text and instructions.
2.  **Code Files**: The starter code (e.g., `index.js`, `main.rs`). The system automatically detects:
    - `exercise.rs`, `main.rs` (Rust)
    - `index.ts`, `index.js` (Node/JS)
    - `main.go` (Go)
3.  **Tests**: Files needed for the runner to verify the solution.
