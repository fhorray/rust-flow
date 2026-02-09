# Course Configuration Guide (`course.json`)

The `course.json` file is the heart of a Progy course. It defines metadata, execution environments, content structure, and environment requirements.

## Core Structure

```json
{
  "id": "sql-basics",
  "name": "SQL Basics with Postgres",
  "description": "Learn SQL by running queries against a real PostgreSQL database.",
  "runner": { ... },
  "content": { ... },
  "setup": { ... }
}
```

### Top-level Fields

| Field         | Type     | Description                                                          |
| :------------ | :------- | :------------------------------------------------------------------- |
| `id`          | `string` | Unique identifier for the course (used in registry and local paths). |
| `name`        | `string` | Display name for students.                                           |
| `description` | `string` | (Optional) A brief overview of the course content.                   |
| `runner`      | `object` | Configuration for the exercise execution engine.                     |
| `content`     | `object` | Defines directory structure for exercises.                           |
| `setup`       | `object` | Defines environment checks and installation guides.                  |

---

## The `runner` Object

Defines how Progy validates student solutions. There are three main runner types:

### 1. Process Runner (`process`)

Runs a command directly on the student's host operating system.

```json
"runner": {
  "type": "process",
  "command": "python3",
  "args": ["runner.py", "{{exercise}}"],
  "cwd": "."
}
```

- `type`: `"process"` (default if omitted).
- `command`: The base command to execute.
- `args`: List of arguments.
- `cwd`: Working directory (relative to course root).

### 2. Docker Local Runner (`docker-local`)

Builds and runs a custom Docker image for each exercise.

```json
"runner": {
  "type": "docker-local",
  "dockerfile": "Dockerfile",
  "image_tag": "my-course-env",
  "command": "pytest {{exercise}}",
  "network_access": false
}
```

- `dockerfile`: Path to the `Dockerfile`.
- `image_tag`: Name for the generated image.
- `network_access`: If `true`, the container has bridge network access.

### 3. Docker Compose Runner (`docker-compose`)

Ideal for courses requiring databases or multiple services.

```json
"runner": {
  "type": "docker-compose",
  "compose_file": "docker-compose.yml",
  "service_to_run": "tester",
  "command": "python3 /app/runner.py {{exercise}}"
}
```

- `compose_file`: Path to the `docker-compose.yml`.
- `service_to_run`: The service inside the compose file where the test command runs.

---

## The `setup` Object (Environment Verification)

The `setup` block is critical for ensuring students have the necessary tools installed before they begin the course. It displays a checklist in the UI when the course is first opened.

```json
"setup": {
  "checks": [
    {
      "name": "Docker",
      "type": "command",
      "command": "docker info"
    },
    {
      "name": "Python 3",
      "type": "command",
      "command": "python3 --version"
    }
  ],
  "guide": "SETUP.md"
}
```

### Setup Fields

| Field    | Description                                                                 |
| :------- | :-------------------------------------------------------------------------- |
| `checks` | An array of check objects (see below).                                      |
| `guide`  | Path to a Markdown file (`SETUP.md`) with manual installation instructions. |

### Check Object

| Field     | Description                                                           |
| :-------- | :-------------------------------------------------------------------- |
| `name`    | The name of the tool/dependency shown to the user.                    |
| `type`    | Currently only `"command"` is supported.                              |
| `command` | A shell command that must return exit code `0` for the check to pass. |

> **Pro Tip:** For Docker, use `docker info` instead of `docker --version` to ensure the Docker Daemon is actually running, not just installed.

---

## The `content` Object

Defines where course source files are located.

```json
"content": {
  "root": ".",
  "exercises": "content"
}
```

- `root`: Root directory for the content (usually `.`).
- `exercises`: Directory containing modules and exercise folders.

### Directory Naming Conventions

Modules and exercises must follow the `NN_name` pattern (`NN` = two digits).

- Module Example: `01_introduction`
- Exercise Example: `05_basic_select`

---

## Dynamic Placeholders

You can use these placeholders in `command`, `args`, and `cwd` fields:

| Placeholder    | Description                       | Example Value       |
| :------------- | :-------------------------------- | :------------------ |
| `{{exercise}}` | Current exercise folder name.     | `01_hello`          |
| `{{id}}`       | Relative path to the exercise.    | `01_intro/01_hello` |
| `{{module}}`   | Name of the parent module folder. | `01_intro`          |

## Full Example (`sql-basics`)

```json
{
  "id": "sql-basics",
  "name": "SQL Basics with Postgres",
  "description": "Learn SQL by running tests against a real Postgres instance.",
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "tester",
    "command": "python3 /app/runner.py {{exercise}}"
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      {
        "name": "Docker Daemon",
        "type": "command",
        "command": "docker info"
      }
    ],
    "guide": "SETUP.md"
  }
}
```
