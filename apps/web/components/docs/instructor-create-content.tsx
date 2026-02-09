import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { Rocket, FolderTree } from 'lucide-react';

export function InstructorCreateContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Creating Courses"
        subtitle="Scaffold, structure, and configure your interactive coding course."
        badge="🚀 Instructor Guide"
      />

      <section className="space-y-4">
        <SubHeading icon={<Rocket className="text-primary" size={20} />}>
          Scaffold a New Course
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Use the built-in templates to quickly bootstrap a new course project:
        </p>
        <CodeBlock
          code={`# Create a Rust course
progy create-course --name my-rust-course --course rust

# Create a Go course
progy create-course --name my-go-course --course go`}
          language="bash"
          label="Terminal"
        />
      </section>

      <section className="space-y-4">
        <SubHeading icon={<FolderTree className="text-primary" size={20} />}>
          Directory Structure
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A Progy course follows a strict directory structure so the CLI can
          parse and run it correctly:
        </p>
        <CodeBlock
          code={`my-course/
├── course.json        # Course configuration (The "Manifest")
├── progy.toml         # Workspace state
├── Dockerfile         # (Optional) Custom environment
├── runner.py          # (Optional) SRP wrapper script
├── SETUP.md           # Setup instructions
└── content/           # The core curriculum
    ├── 01_intro/      # Module 1
    │   ├── info.toml  # Module metadata
    │   ├── 01_hello/  # Exercise 1
    │   │   ├── main.py    # Starter code
    │   │   ├── README.md  # Instructions
    │   │   └── quiz.json  # (Optional) Quiz
    │   └── 02_vars/   # Exercise 2
    └── 02_advanced/   # Module 2
        └── ...`}
          language="text"
          label="File Hierarchy"
          showLineNumbers
        />

        <Callout type="info">
          <strong>Key files:</strong>{' '}
          <code className="text-xs bg-muted px-1 rounded">course.json</code>{' '}
          defines the runner,
          <code className="text-xs bg-muted px-1 rounded ml-1">
            content/
          </code>{' '}
          contains lessons, and each exercise has a
          <code className="text-xs bg-muted px-1 rounded ml-1">README.md</code>{' '}
          for instructions.
        </Callout>
      </section>

      <section className="space-y-4">
        <SubHeading>File Naming Conventions</SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 font-semibold text-foreground">
                  Item
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Convention
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Example
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['Exercise file', 'exercise.<ext>', 'exercise.py, exercise.rs'],
                ['Module folder', 'XX_name', '01_intro, 02_variables'],
                ['Exercise folder', 'XX_name', '01_hello, 02_types'],
                ['Lesson content', 'README.md', 'In exercise folder'],
                ['Quiz', 'quiz.json', 'Optional, in exercise folder'],
                ['Module metadata', 'info.toml', 'In module folder'],
                ['Course config', 'course.json', 'In root'],
              ].map(([item, conv, ex]) => (
                <tr key={item} className="border-t border-border">
                  <td className="p-3 text-foreground font-medium">{item}</td>
                  <td className="p-3 font-mono text-xs">{conv}</td>
                  <td className="p-3 text-xs">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
