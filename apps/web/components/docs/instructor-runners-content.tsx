import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';

export function InstructorRunnersContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Custom Runners"
        subtitle="Use the Wrapper Pattern to give students clean feedback without exposing SRP internals."
        badge="🔧 Advanced"
      />

      <Callout type="tip">
        <strong>Crucial Concept:</strong> Students should never see{' '}
        <code className="text-xs bg-muted px-1 rounded">__SRP_BEGIN__</code> in
        their code. Use a wrapper script that runs student code, captures
        output, and prints the SRP JSON.
      </Callout>

      <section className="space-y-4">
        <SubHeading>Step 1: Configuration</SubHeading>
        <p className="text-sm text-muted-foreground">
          Point the command to your wrapper script:
        </p>
        <CodeBlock
          code={`{
  "runner": {
    "type": "docker-local",
    "dockerfile": "Dockerfile",
    "command": "python3 /workspace/runner.py {{exercise}}"
  }
}`}
          language="json"
          label="course.json"
        />
      </section>

      <section className="space-y-4">
        <SubHeading>Step 2: Dockerfile</SubHeading>
        <CodeBlock
          code={`FROM python:3.9-slim
WORKDIR /workspace
COPY runner.py /workspace/runner.py
CMD ["python3", "/workspace/runner.py"]`}
          language="dockerfile"
          label="Dockerfile"
        />
      </section>

      <section className="space-y-4">
        <SubHeading>Step 3: The Wrapper Script</SubHeading>
        <CodeBlock
          code={`import sys
import subprocess
import json

def main():
    if len(sys.argv) < 2:
        print("Error: No file provided.")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        result = subprocess.run(
            ["python3", file_path],
            capture_output=True,
            text=True,
            timeout=5
        )

        success = result.returncode == 0
        output = result.stdout + result.stderr

        response = {
            "success": success,
            "summary": "Execution Successful" if success else "Runtime Error",
            "raw": output
        }

    except subprocess.TimeoutExpired:
        response = {
            "success": False,
            "summary": "Timeout: Code took too long to run.",
            "raw": ""
        }

    print("__SRP_BEGIN__")
    print(json.dumps(response))
    print("__SRP_END__")

if __name__ == "__main__":
    main()`}
          language="python"
          label="runner.py"
          showLineNumbers
        />
      </section>

      <section className="space-y-4">
        <SubHeading>Docker Compose (Multi-Container)</SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For full-stack courses (e.g. Node.js + Redis), use{' '}
          <code className="bg-muted px-1 rounded text-xs">docker-compose</code>:
        </p>
        <CodeBlock
          code={`{
  "runner": {
    "type": "docker-compose",
    "compose_file": "docker-compose.yml",
    "service_to_run": "app_test"
  }
}`}
          language="json"
          label="course.json"
        />
        <CodeBlock
          code={`services:
  redis:
    image: redis:alpine

  app_test:
    build: .
    volumes:
      - .:/workspace
    depends_on:
      - redis
    environment:
      REDIS_URL: redis://redis:6379
    command: npm test`}
          language="yaml"
          label="docker-compose.yml"
        />
      </section>
    </div>
  );
}
