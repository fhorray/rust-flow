# CLI Reference

The `progy` CLI is the main tool for students and course creators.

## Installation

```bash
bun install -g progy
# or run via bunx
bunx progy <command>
```

## Commands

### `progy init`

Initializes a course in the current directory.

```bash
progy init --course <course-name-or-url> [--offline]
```

- **--course**: The course identifier (e.g., `rust`, `go`) or a Git URL.
- **--offline**: Initializes in offline mode (no login required).

**Behavior**:
1.  Resolves the course from the registry or Git.
2.  Downloads and validates the course content.
3.  Packages the course into a `.progy` file (if not already local).
4.  Starts the course.

### `progy start`

Starts the course learning environment.

```bash
progy start [file.progy] [--offline]
```

- **[file.progy]**: Optional path to a `.progy` file. If omitted, looks for one in the current directory.
- **--offline**: Runs in offline mode.

**Behavior**:
1.  Unpacks the `.progy` file to a runtime directory (`~/.progy/runtime`).
2.  Starts a local web server (default port 3001).
3.  Opens the browser to the course interface.
4.  Syncs changes back to the `.progy` file on exit.

### `progy create-course`

Scaffolds a new course project.

```bash
progy create-course --name <my-course> --course <template>
```

- **--name**: Name of the directory to create.
- **--course**: Template to use (e.g., `rust`, `go`).

**Behavior**:
1.  Creates the directory structure.
2.  Generates a valid `course.json`.
3.  Creates a sample `SETUP.md` and intro lesson.

### `progy login`

Authenticates the device with the Progy platform.

```bash
progy login
```

**Behavior**:
1.  Initiates an OAuth device flow.
2.  Opens the browser for the user to authorize.
3.  Saves the authentication token to `~/.progy/config.json`.
