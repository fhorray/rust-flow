import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { Command, Plus, Package, TestTube, Search } from 'lucide-react';

export function InstructorCLIContent() {
  const commands = [
    {
      cmd: 'progy create <name> --template rust',
      desc: 'Create a new course from a template.',
      icon: Plus,
    },
    {
      cmd: 'progy dev',
      desc: 'Start in GUEST mode (no cloud sync). Hot-reload enabled.',
      icon: TestTube,
    },
    {
      cmd: 'progy test <path>',
      desc: 'Run a single exercise from terminal without UI.',
      icon: Search,
    },
    {
      cmd: 'progy validate [path]',
      desc: 'Static analysis for course structure errors.',
      icon: Search,
    },
    {
      cmd: 'progy pack --out my-course.progy',
      desc: 'Create a secure distribution file.',
      icon: Package,
    },
    {
      cmd: 'progy publish',
      desc: '(Coming Soon) Publish to the Progy registry.',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Instructor CLI Tools"
        subtitle="Commands for creating, testing, and distributing your courses."
      />

      <div className="grid gap-3">
        {commands.map((item) => (
          <div
            key={item.cmd}
            className="group p-4 border border-border rounded-xl bg-card hover:bg-secondary/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-1">
              <item.icon size={14} className="text-primary" />
              <code className="text-sm font-bold font-mono text-foreground">
                {item.cmd}
              </code>
            </div>
            <p className="text-xs text-muted-foreground pl-7">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <SubHeading>Scaffolding Shortcuts</SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Use shortcut paths to quickly add modules and exercises:
        </p>
        <CodeBlock
          code={`# Add a new module
$ progy add module basics
✅ Created module: 02_basics

# Add exercise to module 1
$ progy add exercise 1 greetings
✅ Created exercise: 02_greetings in 1

# Add quiz to exercise 2 of module 1
$ progy add quiz 1/2
✅ Added quiz to: 1/2`}
          language="bash"
          label="Terminal"
        />
        <Callout type="warning">
          <code className="text-xs bg-muted px-1 rounded">
            progy add exercise
          </code>{' '}
          creates an extensionless file. You must rename it with the correct
          extension (e.g.{' '}
          <code className="text-xs bg-muted px-1 rounded">exercise.py</code>).
        </Callout>
      </section>
    </div>
  );
}
