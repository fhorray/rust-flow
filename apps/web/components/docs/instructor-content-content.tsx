import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { FileText, Sparkles, BookOpen } from 'lucide-react';

export function InstructorContentContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Content & Quizzes"
        subtitle="Write rich lesson content with premium Markdown features and add interactive quizzes."
      />

      <section className="space-y-4">
        <SubHeading icon={<FileText className="text-primary" size={20} />}>
          Module Metadata (info.toml)
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Place an{' '}
          <code className="bg-muted px-1 rounded text-xs">info.toml</code> in
          each module folder to control exercise ordering and titles:
        </p>
        <CodeBlock
          code={`[module]
title = "Introduction to Python"
message = "Let's start your journey!"

[exercises]
# Order matters! Exercises appear in this order.
01_hello = "Hello World"
02_variables = { title = "Variables & Types", xp = 50 }`}
          language="toml"
          label="info.toml"
        />
        <Callout type="info">
          If an exercise is not listed in{' '}
          <code className="text-xs bg-muted px-1 rounded">info.toml</code>, it
          is still included but sorted numerically by filename.
        </Callout>
      </section>

      <section className="space-y-4">
        <SubHeading icon={<Sparkles className="text-yellow-400" size={20} />}>
          Markdown Features
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Progy uses a premium Markdown renderer. Beyond standard Markdown, you
          have access to the following advanced features:
        </p>

        <div className="space-y-3">
          {/* Callouts */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                Callouts
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Obsidian-style callouts for highlighting important information.
            </p>
            <CodeBlock
              code={`> [!INFO]
> This is an informative callout.

> [!WARNING]
> This is a warning callout.

> [!TIP]
> Helpful advice for the student.`}
              language="markdown"
              label="README.md"
            />
          </div>

          {/* Mermaid Diagrams */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                Diagrams
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Render Mermaid.js flowcharts, sequence diagrams, and more directly
              from text.
            </p>
            <CodeBlock
              code={`\`\`\`mermaid
graph TD
    A[Start] --> B{Is it SQL?}
    B -- Yes --> C[Run Query]
    B -- No --> D[Edit Code]
\`\`\``}
              language="markdown"
              label="README.md"
            />
          </div>

          {/* LaTeX */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                LaTeX Math
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Render mathematical expressions for AI, Data Science, or
              Algorithms courses.
            </p>
            <CodeBlock
              code={`Inline: $e = mc^2$

Block:
$$
\\int_{a}^{b} x^2 \\,dx = \\frac{b^3 - a^3}{3}
$$`}
              language="markdown"
              label="README.md"
            />
          </div>

          {/* Interactive Code Blocks */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
                Interactive Code
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              All code blocks automatically get a <strong>Copy</strong> button
              and a <strong>Run</strong> button that triggers the exercise
              runner.
            </p>
          </div>

          {/* Video Embeds */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                Video Embeds
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Integrate video lessons using custom directives.
            </p>
            <CodeBlock
              code={`::video{src="https://example.com/intro.mp4"}`}
              language="markdown"
              label="README.md"
            />
          </div>

          {/* GFM */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-zinc-500/10 text-zinc-400 px-2 py-0.5 rounded-full">
                GFM
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Full GitHub Flavored Markdown: tables, task lists, strikethrough,
              and auto-links.
            </p>
          </div>
        </div>

        <Callout type="tip">
          Standard Markdown images{' '}
          <code className="text-xs bg-muted px-1 rounded">
            {'![Alt](image.png)'}
          </code>{' '}
          work normally. Place images in the exercise folder or use absolute
          URLs.
        </Callout>
      </section>

      <section className="space-y-4">
        <SubHeading icon={<BookOpen className="text-primary" size={20} />}>
          Quizzes (quiz.json)
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Place <code className="bg-muted px-1 rounded text-xs">quiz.json</code>{' '}
          inside an exercise folder for multiple-choice questions:
        </p>
        <CodeBlock
          code={`{
  "title": "Check Your Understanding",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Which keyword defines a constant in JavaScript?",
      "options": [
        { "id": "a", "text": "var", "isCorrect": false },
        { "id": "b", "text": "let", "isCorrect": false },
        {
          "id": "c",
          "text": "const",
          "isCorrect": true,
          "explanation": "Correct! 'const' is used for variables that should not be reassigned."
        }
      ]
    }
  ]
}`}
          language="json"
          label="quiz.json"
          showLineNumbers
        />
        <Callout type="info">
          The platform automatically calculates scores and provides feedback.
          You can add{' '}
          <code className="text-xs bg-muted px-1 rounded">explanation</code> for
          any answer option — both correct and incorrect answers can have
          explanations to deepen understanding.
        </Callout>
      </section>
    </div>
  );
}
