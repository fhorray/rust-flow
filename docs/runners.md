# Runners

Runners are the core of Progy's interactive feedback system. A runner is a script or binary that executes the student's code, runs tests, and outputs the results in a specific JSON format.

## How it Works

1.  The CLI/Server calls the command specified in `course.json`.
2.  It replaces placeholders like `{{id}}` with the path to the current exercise.
3.   The runner executes the tests.
4.  The runner prints the result JSON wrapped in `__SRP_BEGIN__` and `__SRP_END__`.

## Protocol (SRPOutput)

The runner must output JSON matching this structure:

```typescript
type SRPOutput = {
  success: boolean;       // Overall pass/fail status
  summary: string;        // Short summary message
  diagnostics?: Array<{   // Optional compiler/linter errors
    severity: "error" | "warning";
    message: string;
    file?: string;
    line?: number;
  }>;
  tests?: Array<{         // Individual test results
    name: string;
    status: "pass" | "fail";
    message?: string;
  }>;
  raw: string;           // Raw stdout/stderr for debugging
}
```

## Example: Node.js Runner

```javascript
// runner/index.js
const { spawn } = require("child_process");
const { resolve, join } = require("path");

const targetDir = resolve(process.argv[2]); // Passed from CLI
const mainFile = join(targetDir, "index.js");

const srp = {
    success: false,
    summary: "",
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
    console.log("__SRP_BEGIN__");
    console.log(JSON.stringify(srp, null, 2));
    console.log("__SRP_END__");
});
```

## High-Performance Rust Runner

Progy also includes a runner written in Rust (`apps/progy/runner/src/main.rs`) for maximum performance.
- It invokes `cargo test --message-format json`.
- It parses the stream of Cargo JSON events.
- It transforms them into the SRP format.
- This creates a bridge between raw compiler output and Progy's friendly UI.

## Configuration

In `course.json`:

```json
"runner": {
  "command": "node",
  "args": ["./runner/index.js", "test", "content/{{id}}"],
  "cwd": "."
}
```
