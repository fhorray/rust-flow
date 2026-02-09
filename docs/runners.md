# Runners

Runners are the core of Progy's interactive feedback system. A runner is a script or binary that executes the student's code, runs tests, and outputs the results in a specific JSON format.

## How it Works

1.  The `progy` CLI or Server determines which exercise needs to be run.
2.  It looks up the `runner` configuration in `course.json`.
3.  It constructs the command, replacing placeholders like `{{file}}` or `{{dir}}` with the path to the current exercise.
4.  It executes the runner process.
5.  The runner executes the user's code/tests.
6.  The runner prints the result JSON wrapped in `__SRP_BEGIN__` and `__SRP_END__` to `stdout`.

## Protocol (SRPOutput)

The runner must output JSON matching this structure between the marker lines:

```typescript
type SRPOutput = {
  success: boolean;       // Overall pass/fail status
  summary: string;        // Short summary message (e.g., "Tests Passed", "Compilation Error")
  score?: number;         // Optional score (0-100)
  diagnostics?: Array<{   // Optional compiler/linter errors
    severity: "error" | "warning";
    message: string;
    file?: string;
    line?: number;
    code?: string;        // Error code (e.g., E0123)
  }>;
  tests?: Array<{         // Individual test results
    name: string;
    status: "pass" | "fail";
    message?: string;     // Failure details
    duration?: number;    // Execution time in ms
  }>;
  raw?: string;           // Raw stdout/stderr for debugging (displayed in UI console)
}
```

## Example: Node.js Runner

```javascript
// runner/index.js
const { spawn } = require("child_process");
const { resolve, join } = require("path");

// Argument 2 is passed by progy as the exercise directory
const targetDir = resolve(process.argv[2]);
const mainFile = join(targetDir, "index.js");

const srp = {
    success: false,
    summary: "Running...",
    raw: ""
};

const proc = spawn("node", [mainFile], { cwd: targetDir });

let output = "";
proc.stdout.on("data", d => output += d);
proc.stderr.on("data", d => output += d);

proc.on("close", (code) => {
    srp.success = code === 0;
    srp.raw = output;
    srp.summary = srp.success ? "Execution Successful" : "Execution Failed";

    console.log("__SRP_BEGIN__");
    console.log(JSON.stringify(srp, null, 2));
    console.log("__SRP_END__");
});
```

## Configuration in `course.json`

```json
{
  "runner": {
    "command": "bun",
    "args": ["runner/index.ts", "{{dir}}"],
    "cwd": "."
  }
}
```

- **`command`**: The executable (e.g., `bun`, `cargo`, `go`).
- **`args`**: Arguments to pass. `{{dir}}` is replaced by the absolute path to the exercise directory. `{{file}}` is replaced by the exercise entry file.
- **`cwd`**: Working directory relative to the course root.

## Performance & Caching

Runners should be fast. For compiled languages like Rust or Go, consider:
- Pre-compiling dependencies.
- Using a shared target directory (ignored by git).
- Providing a "watch" mode if possible (Progy handles file watching, but the runner can optimize repeated runs).
