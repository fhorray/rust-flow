import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { useState } from 'react';

const examples = [
  {
    id: 'python',
    title: 'Python + Docker',
    desc: 'Isolated Python environment using Docker. Ideal for beginners and data science.',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "python-basics",
  "name": "Python Fundamentals",
  "runner": {
    "type": "docker-local",
    "command": "python3",
    "args": ["/workspace/runner.py", "{{exercise}}"],
    "cwd": "/workspace",
    "dockerfile": "Dockerfile",
    "image_tag": "progy-python-basics",
    "network_access": false
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Docker", "type": "command", "command": "docker --version" }
    ],
    "guide": "SETUP.md"
  }
}`,
      },
      {
        label: 'Dockerfile',
        language: 'dockerfile',
        code: `FROM python:3.11-slim
WORKDIR /workspace
COPY runner.py /workspace/runner.py
USER nobody
CMD ["python3", "/workspace/runner.py"]`,
      },
      {
        label: 'runner.py',
        language: 'python',
        code: `import sys, subprocess, json, os

def main():
    if len(sys.argv) < 2:
        print_srp(False, "No file provided", "Usage: runner.py <exercise_path>")
        return

    file_path = f"/workspace/{sys.argv[1]}"
    if not os.path.exists(file_path):
        print_srp(False, "File Not Found", f"Could not find: {sys.argv[1]}")
        return

    try:
        result = subprocess.run(
            ["python3", file_path],
            capture_output=True, text=True, timeout=5
        )
        output = result.stdout + result.stderr
        success = result.returncode == 0
        summary = "Code executed successfully!" if success else f"Error (exit {result.returncode})"
        print_srp(success, summary, output)
    except subprocess.TimeoutExpired:
        print_srp(False, "Timeout", "Code took too long (>5s)")

def print_srp(success, summary, raw):
    print("__SRP_BEGIN__")
    print(json.dumps({"success": success, "summary": summary, "raw": raw}))
    print("__SRP_END__")

if __name__ == "__main__":
    main()`,
      },
      {
        label: 'content/01_intro/01_hello/exercise.py',
        language: 'python',
        code: `# Write a function that returns "Hello, World!"
def hello():
    pass  # Replace with your solution`,
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL + Docker Compose',
    desc: 'Multi-container setup with PostgreSQL database. Perfect for SQL and backend courses.',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "sql-basics",
  "name": "SQL Basics with Postgres",
  "runner": {
    "type": "docker-compose",
    "command": "python3",
    "args": ["/app/runner.py", "{{exercise}}"],
    "cwd": "/app",
    "compose_file": "docker-compose.yml",
    "service_to_run": "runner"
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Docker", "type": "command", "command": "docker --version" },
      { "name": "Docker Compose", "type": "command", "command": "docker compose version" }
    ],
    "guide": "SETUP.md"
  }
}`,
      },
      {
        label: 'docker-compose.yml',
        language: 'yaml',
        code: `services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: progy
      POSTGRES_PASSWORD: password
      POSTGRES_DB: course_db
    volumes:
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U progy"]
      interval: 2s
      timeout: 5s
      retries: 5

  runner:
    build: ./runner
    volumes:
      - .:/workspace:ro
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_HOST: db
      DB_USER: progy
      DB_PASS: password
      DB_NAME: course_db`,
      },
      {
        label: 'runner/runner.py',
        language: 'python',
        code: `import sys, json, os
import psycopg2

def main():
    file_path = sys.argv[1]
    with open(f"/workspace/{file_path}") as f:
        student_sql = f.read()

    conn = psycopg2.connect(
        host=os.environ["DB_HOST"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASS"],
        dbname=os.environ["DB_NAME"]
    )
    cur = conn.cursor()

    try:
        cur.execute(student_sql)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        output = f"Columns: {columns}\\nRows: {len(rows)}\\n"
        for row in rows:
            output += str(row) + "\\n"
        print_srp(True, f"Query returned {len(rows)} rows", output)
    except Exception as e:
        print_srp(False, "Query Error", str(e))
    finally:
        conn.close()

def print_srp(success, summary, raw):
    print("__SRP_BEGIN__")
    print(json.dumps({"success": success, "summary": summary, "raw": raw}))
    print("__SRP_END__")

if __name__ == "__main__":
    main()`,
      },
    ],
  },
  {
    id: 'rust',
    title: 'Rust + Docker',
    desc: 'Compiled language with full compiler diagnostics. Great for systems programming.',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "rust-fundamentals",
  "name": "Rust Fundamentals",
  "runner": {
    "type": "docker-local",
    "command": "python3",
    "args": ["/workspace/runner.py", "{{exercise}}"],
    "cwd": "/workspace",
    "dockerfile": "Dockerfile",
    "image_tag": "progy-rust-fundamentals",
    "network_access": false
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Docker", "type": "command", "command": "docker --version" }
    ],
    "guide": "SETUP.md"
  }
}`,
      },
      {
        label: 'Dockerfile',
        language: 'dockerfile',
        code: `FROM rust:1.75-slim
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY runner.py /workspace/runner.py
USER nobody`,
      },
      {
        label: 'runner.py',
        language: 'python',
        code: `import sys, subprocess, json, os, re

def main():
    file_path = f"/workspace/{sys.argv[1]}"
    if not os.path.exists(file_path):
        print_srp(False, "File Not Found", f"Could not find: {sys.argv[1]}")
        return

    # Compile first
    try:
        compile_result = subprocess.run(
            ["rustc", file_path, "-o", "/tmp/exercise"],
            capture_output=True, text=True, timeout=15
        )
        if compile_result.returncode != 0:
            diagnostics = parse_rustc_errors(compile_result.stderr)
            print_srp(False, "Compilation Failed", compile_result.stderr, diagnostics)
            return
    except subprocess.TimeoutExpired:
        print_srp(False, "Compilation Timeout", "Compilation took too long (>15s)")
        return

    # Run
    try:
        run_result = subprocess.run(
            ["/tmp/exercise"],
            capture_output=True, text=True, timeout=5
        )
        success = run_result.returncode == 0
        output = run_result.stdout + run_result.stderr
        summary = "All tests passed!" if success else f"Runtime Error (exit {run_result.returncode})"
        print_srp(success, summary, output)
    except subprocess.TimeoutExpired:
        print_srp(False, "Timeout", "Execution took too long (>5s)")

def parse_rustc_errors(stderr):
    diagnostics = []
    for match in re.finditer(r"error\\[E\\d+\\]: (.+)\\n\\s+--> (.+):(\\d+):(\\d+)", stderr):
        diagnostics.append({
            "severity": "error",
            "message": match.group(1),
            "file": match.group(2),
            "line": int(match.group(3))
        })
    return diagnostics

def print_srp(success, summary, raw, diagnostics=None):
    payload = {"success": success, "summary": summary, "raw": raw}
    if diagnostics:
        payload["diagnostics"] = diagnostics
    print("__SRP_BEGIN__")
    print(json.dumps(payload))
    print("__SRP_END__")

if __name__ == "__main__":
    main()`,
      },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript + Process',
    desc: 'No Docker needed. Runs directly on the host using Node.js. Fastest setup.',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "typescript-essentials",
  "name": "TypeScript Essentials",
  "runner": {
    "type": "process",
    "command": "npx",
    "args": ["tsx", "runner.ts", "{{exercise}}"],
    "cwd": "."
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Node.js", "type": "command", "command": "node --version" },
      { "name": "npm", "type": "command", "command": "npm --version" }
    ],
    "guide": "SETUP.md"
  }
}`,
      },
      {
        label: 'runner.ts',
        language: 'typescript',
        code: `import { execSync } from 'child_process';
import { existsSync } from 'fs';

interface SRPOutput {
  success: boolean;
  summary: string;
  raw: string;
  diagnostics?: { severity: string; message: string; file: string; line: number }[];
}

function printSRP(output: SRPOutput) {
  console.log('__SRP_BEGIN__');
  console.log(JSON.stringify(output));
  console.log('__SRP_END__');
}

const filePath = process.argv[2];
if (!filePath || !existsSync(filePath)) {
  printSRP({ success: false, summary: 'File Not Found', raw: \`Could not find: \${filePath}\` });
  process.exit(0);
}

try {
  const output = execSync(\`npx tsx \${filePath}\`, { encoding: 'utf-8', timeout: 5000 });
  printSRP({ success: true, summary: 'Code executed successfully!', raw: output });
} catch (error: any) {
  const stderr = error.stderr || error.stdout || String(error);
  printSRP({ success: false, summary: 'Runtime Error', raw: stderr });
}`,
      },
    ],
  },
  {
    id: 'go',
    title: 'Go + Docker',
    desc: 'Compiled Go environment with test runner support. Great for backend engineers.',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "go-fundamentals",
  "name": "Go Fundamentals",
  "runner": {
    "type": "docker-local",
    "command": "python3",
    "args": ["/workspace/runner.py", "{{exercise}}"],
    "cwd": "/workspace",
    "dockerfile": "Dockerfile",
    "image_tag": "progy-go-fundamentals",
    "network_access": false
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Docker", "type": "command", "command": "docker --version" }
    ],
    "guide": "SETUP.md"
  }
}`,
      },
      {
        label: 'Dockerfile',
        language: 'dockerfile',
        code: `FROM golang:1.22-alpine
RUN apk add --no-cache python3
WORKDIR /workspace
COPY runner.py /workspace/runner.py`,
      },
      {
        label: 'runner.py',
        language: 'python',
        code: `import sys, subprocess, json, os

def main():
    file_path = f"/workspace/{sys.argv[1]}"
    if not os.path.exists(file_path):
        print_srp(False, "File Not Found", f"Could not find: {sys.argv[1]}")
        return

    try:
        result = subprocess.run(
            ["go", "run", file_path],
            capture_output=True, text=True, timeout=10,
            env={**os.environ, "GOPATH": "/tmp/gopath"}
        )
        output = result.stdout + result.stderr
        success = result.returncode == 0
        summary = "Code executed successfully!" if success else "Build/Runtime Error"
        print_srp(success, summary, output)
    except subprocess.TimeoutExpired:
        print_srp(False, "Timeout", "Execution took too long (>10s)")

def print_srp(success, summary, raw):
    print("__SRP_BEGIN__")
    print(json.dumps({"success": success, "summary": summary, "raw": raw}))
    print("__SRP_END__")

if __name__ == "__main__":
    main()`,
      },
    ],
  },
];

export function InstructorExamplesContent() {
  const [activeExample, setActiveExample] = useState('python');

  const current = examples.find((e) => e.id === activeExample)!;

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Complete Examples"
        subtitle="Production-ready course setups for different languages and environments. All course.json files include every required field."
        badge="📦 Templates"
      />

      <Callout type="warning">
        Every <code className="text-xs bg-muted px-1 rounded">course.json</code>{' '}
        must include <strong>id</strong>, <strong>name</strong>,{' '}
        <strong>runner</strong> (with{' '}
        <code className="text-xs bg-muted px-1 rounded">command</code>,{' '}
        <code className="text-xs bg-muted px-1 rounded">args</code>, and{' '}
        <code className="text-xs bg-muted px-1 rounded">cwd</code>),{' '}
        <strong>content</strong> (with{' '}
        <code className="text-xs bg-muted px-1 rounded">root</code> and{' '}
        <code className="text-xs bg-muted px-1 rounded">exercises</code>), and{' '}
        <strong>setup</strong> (with{' '}
        <code className="text-xs bg-muted px-1 rounded">checks</code> and{' '}
        <code className="text-xs bg-muted px-1 rounded">guide</code>). Missing
        fields will cause a validation error.
      </Callout>

      <div className="flex gap-2 flex-wrap">
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveExample(ex.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeExample === ex.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed italic">
        {current.desc}
      </p>

      <div className="space-y-2">
        {current.files.map((file) => (
          <CodeBlock
            key={file.label}
            code={file.code}
            language={file.language}
            label={file.label}
            showLineNumbers
          />
        ))}
      </div>
    </div>
  );
}
