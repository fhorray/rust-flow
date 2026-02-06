# Progy Course Creator Guide

Welcome to Progy! This guide explains how to create courses, write lessons, add rich media, and configure quizzes.

## 📚 Course Structure

Values in `{{ }}` are placeholders.

```
my-course/
├── course.json          # Main configuration file
├── SETUP.md             # Setup instructions for the student
├── content/             # Course content directory
│   ├── 01_module_name/  # Modules are directories
│   │   ├── intro/       # Lessons are sub-directories
│   │   │   ├── README.md   # Lesson instructions (Markdown)
│   │   │   ├── main.rs     # Starter code (or main.go, index.ts, etc.)
│   │   │   └── quiz.json   # (Optional) Quiz for this lesson
│   │   └── info.toml    # Module metadata (title, ordering)
│   └── ...
└── runner/              # (Optional) Custom runner logic (for Go, etc.)
```

### Quick Start

Use the CLI to scaffold a new course:

```bash
bunx progy create-course --name my-rust-course --course rust
```

---

## 📝 Writing Content

Each lesson is a directory inside `content/<module>/`. It **must** contain:

1.  **`README.md`**: The lesson text, instructions, and theory.
2.  **Code File**: The starting code for the student (e.g., `main.rs`, `main.go`).

### Rich Content Tags

You can enhance your `README.md` with special directives that Progy renders beautifully:

#### Callouts / Notes

Use `::note[]` to highlight important information.

```markdown
::note[Don't forget to borrow the variable here!]
```

> Renders as a styled blockquote with a 📝 icon.

#### Videos

Use `::video[]` to embed a video player.

```markdown
::video[https://www.youtube.com/watch?v=dQw4w9WgXcQ]
```

> Renders an embedded YouTube player. Also supports direct `.mp4` links.

---

## 🧠 Integrated Quizzes

You can add a quiz to any lesson by creating a `quiz.json` file in the lesson directory.

**File:** `content/01_module/lesson1/quiz.json`

```json
{
  "title": "Check Your Understanding",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Which keyword is used to define a variable in Rust?",
      "options": [
        { "id": "a", "text": "var", "isCorrect": false },
        {
          "id": "b",
          "text": "let",
          "isCorrect": true,
          "explanation": "Correct! 'let' binds a value to a variable."
        },
        { "id": "c", "text": "const", "isCorrect": false }
      ]
    }
  ]
}
```

- **`explanation`**: (Optional) Text shown after the user answers, explaining why they were right or wrong.

---

## ⚙️ Configuration (`course.json`)

The `course.json` file controls how your course runs and is structured.

```json
{
  "id": "rust-basics",
  "name": "Rust Basics",
  "runner": {
    "command": "cargo",
    "args": [
      "test",
      "--quiet",
      "--manifest-path",
      "./content/{{id}}/Cargo.toml"
    ],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "guide": "SETUP.md",
    "checks": [
      {
        "name": "Rust Compiler",
        "type": "command",
        "command": "rustc --version"
      }
    ]
  }
}
```

### Runner Variables

- `{{exercise}}`: The folder name of the current exercise (e.g., `variables1`).
- `{{id}}`: The full ID/path (e.g., `01_variables/variables1`).
- `{{module}}`: The module name (e.g., `01_variables`).

### Setup Checks

Define commands that must pass for the student's environment to be considered ready. If `rustc --version` fails, Progy will show the `SETUP.md` guide.

---

## 📂 Module Metadata (`info.toml`)

Create an `info.toml` in a module folder (`content/01_module/info.toml`) to control titles and ordering.

```toml
[module]
message = "Introduction to Variables" # The nice display title for the module

# Optional: explicitly order or rename exercises
[exercises]
variables1 = { title = "Variables 1" }
variables2 = { title = "Mutability" }
```
