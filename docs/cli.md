# CLI Reference

The `progy` CLI is the main tool for students and course creators.

## Installation

```bash
bun install -g progy
# or run via bunx
bunx progy <command>
```

## Global Options

- `--offline`: Run the command in offline mode (where applicable).
- `-h, --help`: Display help for command.

## Commands

### `progy init`

Initializes a course in the current directory. This sets up the directory structure and fetches the course content.

```bash
progy init --course <course-id-or-url> [--offline]
```

- **--course (-c)**: The course identifier (e.g., `rust`, `go`) or a Git URL.
- **--offline**: Initializes in offline mode (limited functionality).

**Behavior**:
1.  Resolves the course from the official registry or provided Git URL.
2.  Authenticates with the backend to ensure repository access.
3.  Clones or pulls the course content.
4.  Caches the official content in `~/.progy/courses/`.
5.  Layers the content into the current directory, respecting existing user changes.
6.  Generates a `progy.toml` configuration file.

### `progy start`

Starts the course learning environment. This is the default command if no arguments are provided.

```bash
progy start [file.progy] [--offline]
```

- **[file.progy]**: Optional path to a `.progy` package file. If omitted, it looks for a `.progy` file in the current directory or runs from the source directory.
- **--offline**: Runs the server without attempting to connect to the backend.

**Behavior**:
1.  If a `.progy` file is provided/found, it unpacks it to a runtime directory.
2.  Starts a local web server (frontend + backend).
3.  Opens the browser to the course interface.
4.  Syncs changes back to the `.progy` file (or source) on exit.

### `progy save`

Saves your progress to the cloud (Git push).

```bash
progy save --message "my progress update"
```

- **--message (-m)**: The commit message (default: "update progress").

**Behavior**:
1.  Checks for a valid `.git` repository.
2.  Locks the workspace to prevent concurrent sync operations.
3.  Authenticates with the backend to refresh Git credentials.
4.  Commits all changes in the current directory.
5.  Pulls latest changes from remote (rebase/merge).
6.  Pushes commits to the remote repository.

### `progy sync`

Synchronizes your local workspace with official course updates and your remote progress.

```bash
progy sync
```

**Behavior**:
1.  Checks for updates to the official course content (based on `progy.toml`).
2.  Updates the local cache (`~/.progy/courses/`).
3.  "Layers" the updates: Applies changes to non-exercise files while preserving your work in exercise files.
4.  Pulls the latest changes from your personal remote repository.
5.  Updates the `last_sync` timestamp in `progy.toml`.

### `progy reset`

Resets a specific file to its original state from the official course content.

```bash
progy reset <path>
```

- **<path>**: The relative path to the file you want to reset (e.g., `content/01_intro/hello.rs`).

**Behavior**:
1.  Locates the original file in the local cache (`~/.progy/courses/`).
2.  Overwrites the local file with the cached version.
3.  Useful if you've messed up an exercise and want to start over.

### `progy create-course`

Scaffolds a new course project (for Instructors).

```bash
progy create-course --name <my-course> --course <template>
```

- **--name (-n)**: Name of the directory to create.
- **--course (-c)**: Template to use (e.g., `rust`, `go`).

**Behavior**:
1.  Creates the directory structure.
2.  Generates a valid `course.json`.
3.  Creates a sample `SETUP.md`, runner configuration, and intro lesson.

### `progy validate`

Validates a course's structure and configuration (for Instructors).

```bash
progy validate [path]
```

- **[path]**: Path to the course directory (default: current directory).

**Behavior**:
1.  Checks `course.json` for required fields.
2.  Verifies the existence of content directories and runners.
3.  Ensures the structure complies with Progy standards.

### `progy pack`

Packs a course into a portable `.progy` file (for Instructors/Distribution).

```bash
progy pack [--out filename.progy]
```

- **--out (-o)**: Output filename.

**Behavior**:
1.  Validates the course first.
2.  Compresses the course content into a single file for easy distribution.

### `progy dev`

Starts the Progy server in development mode for course creators.

```bash
progy dev [--offline]
```

**Behavior**:
1.  Validates the course in the current directory.
2.  Starts the server directly from the source files (no unpacking).
3.  Watches for changes (hot reload logic may apply).

### `progy login`

Authenticates the device with the Progy platform.

```bash
progy login
```

**Behavior**:
1.  Initiates an OAuth device flow.
2.  Opens the browser for the user to authorize.
3.  Saves the authentication token to `~/.progy/config.json`.

### `progy config`

Manage Progy configuration values.

#### `progy config set`
Set a configuration value.
```bash
progy config set <path> <value>
# Example: progy config set ai.provider openai
```

#### `progy config list`
List all configuration values.
```bash
progy config list
```
