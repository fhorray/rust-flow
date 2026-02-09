import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';

export function InstructorContentContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Content & Quizzes"
        subtitle="Write rich lesson content with Markdown and add interactive quizzes."
      />

      <section className="space-y-4">
        <SubHeading>Module Metadata (info.toml)</SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Place an{' '}
          <code className="bg-muted px-1 rounded text-xs">info.toml</code> in
          each module folder to order exercises:
        </p>
        <CodeBlock
          code={`[module]
title = "Introduction to Python"
message = "Let's start your journey!"

[exercises]
# Order matters!
01_hello = "Hello World"
02_variables = { title = "Variables & Types", xp = 50 }`}
          language="toml"
          label="info.toml"
        />
      </section>

      <section className="space-y-4">
        <SubHeading>Markdown Features</SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Progy supports standard Markdown with custom extensions:
        </p>
        <div className="grid gap-3">
          {[
            {
              syntax: '::video[https://example.com/video.mp4]',
              desc: 'Embed a video player',
            },
            {
              syntax: '::note[Important info for the student.]',
              desc: 'Highlighted note block',
            },
            {
              syntax: '![Alt](image.png)',
              desc: 'Images (relative or absolute paths)',
            },
          ].map((ext) => (
            <div
              key={ext.syntax}
              className="p-3 rounded-xl border border-border bg-card"
            >
              <code className="text-xs font-mono text-primary">
                {ext.syntax}
              </code>
              <p className="text-xs text-muted-foreground mt-1">{ext.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SubHeading>Quizzes (quiz.json)</SubHeading>
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
          any answer option.
        </Callout>
      </section>
    </div>
  );
}
