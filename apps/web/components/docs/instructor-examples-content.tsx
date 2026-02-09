import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading } from './section-heading';
import { useState } from 'react';

const examples = [
  {
    id: 'python',
    title: 'Python + Docker',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "python-basics",
  "name": "Python Fundamentals",
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}"
  },
  "content": { "root": ".", "exercises": "content" }
}`,
      },
      {
        label: 'Dockerfile',
        language: 'dockerfile',
        code: `FROM python:3.11-slim
WORKDIR /workspace
COPY runner.py /workspace/runner.py
CMD ["python3", "/workspace/runner.py"]`,
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
    ],
  },
  {
    id: 'sql',
    title: 'SQL + Docker Compose',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "sql-basics",
  "name": "SQL Basics with Postgres",
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "tester",
    "command": "python3 /app/runner.py {{exercise}}"
  },
  "content": { "root": ".", "exercises": "content" }
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

  tester:
    build: ./tester
    volumes:
      - .:/workspace
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_HOST: db
      DB_USER: progy
      DB_PASS: password
      DB_NAME: course_db`,
      },
    ],
  },
  {
    id: 'rust',
    title: 'Rust + Docker',
    files: [
      {
        label: 'course.json',
        language: 'json',
        code: `{
  "id": "rust-fundamentals",
  "name": "Rust Fundamentals",
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}"
  },
  "content": { "root": ".", "exercises": "content" }
}`,
      },
      {
        label: 'Dockerfile',
        language: 'dockerfile',
        code: `FROM rust:1.75-slim
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace
COPY runner.py /workspace/runner.py`,
      },
    ],
  },
  {
    id: 'typescript',
    title: 'TypeScript + Process',
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
    "args": ["tsx", "runner.ts", "{{exercise}}"]
  },
  "content": { "root": ".", "exercises": "content" },
  "setup": {
    "checks": [
      { "name": "Node.js", "type": "command", "command": "node --version" }
    ]
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
];

export function InstructorExamplesContent() {
  const [activeExample, setActiveExample] = useState('python');

  const current = examples.find((e) => e.id === activeExample)!;

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Complete Examples"
        subtitle="Copy-paste ready course setups for different languages and environments."
        badge="📦 Templates"
      />

      <div className="flex gap-2 flex-wrap">
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveExample(ex.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeExample === ex.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

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
