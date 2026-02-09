import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { FileJson, Server } from 'lucide-react';

export function InstructorConfigContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Course Configuration"
        subtitle="The course.json file is the heart of your course. It defines how Progy executes student code."
      />

      <section className="space-y-4">
        <SubHeading icon={<FileJson className="text-blue-400" size={20} />}>
          Schema
        </SubHeading>
        <CodeBlock
          code={`{
  "id": "python-mastery",
  "name": "Python Mastery: From Zero to Hero",
  "description": "A comprehensive guide to modern Python.",
  "runner": {
    "type": "process",
    "command": "python3 {{exercise}}"
  },
  "content": {
    "root": ".",
    "exercises": "content"
  },
  "setup": {
    "checks": [
      { "name": "Python", "type": "command", "command": "python3 --version" }
    ],
    "guide": "SETUP.md"
  }
}`}
          language="json"
          label="course.json"
          showLineNumbers
        />
        <Callout type="tip">
          The{' '}
          <code className="text-xs bg-muted px-1 rounded">
            {'{{exercise}}'}
          </code>{' '}
          placeholder is replaced with the path to the student's file at
          runtime.
        </Callout>
      </section>

      <section className="space-y-4">
        <SubHeading icon={<Server className="text-blue-400" size={20} />}>
          Runner Types
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <code className="bg-muted px-1 rounded text-xs">runner.type</code>{' '}
          field determines where and how code executes:
        </p>
        <div className="grid gap-4">
          {[
            {
              type: 'process',
              label: 'Default',
              pros: 'Zero setup, fast execution',
              cons: 'Requires language installed on host',
              best: 'Simple syntax tutorials, CLI tools',
            },
            {
              type: 'docker-local',
              label: 'Isolated',
              pros: 'Reproducible environment, isolated',
              cons: 'Requires Docker Desktop',
              best: 'Web servers, databases, specific compiler versions',
            },
            {
              type: 'docker-compose',
              label: 'Multi-Service',
              pros: 'Full integration testing (App + DB + Cache)',
              cons: 'More complex setup',
              best: 'Full-stack engineering courses',
            },
          ].map((r) => (
            <div
              key={r.type}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <code className="text-primary font-mono text-sm font-bold">
                  {r.type}
                </code>
                <span className="text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">
                  {r.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="text-green-400 font-medium">Pros:</span>{' '}
                  {r.pros}
                </div>
                <div>
                  <span className="text-yellow-400 font-medium">Cons:</span>{' '}
                  {r.cons}
                </div>
                <div>
                  <span className="text-blue-400 font-medium">Best for:</span>{' '}
                  {r.best}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
