import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { FolderTree } from 'lucide-react';

export function InstructorStructureContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Course Structure"
        subtitle="Understand how Progy courses are organized as git-native repositories."
      />

      <section className="space-y-4">
        <SubHeading icon={<FolderTree className="text-primary" size={20} />}>
          What is a Progy Course?
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A Progy Course is more than just Markdown files. It's an interactive
          learning environment combining:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              title: 'Structured Content',
              desc: 'Lessons and modules organized logically.',
            },
            {
              title: 'Live Code Execution',
              desc: 'Students run code directly in their environment.',
            },
            {
              title: 'Smart Feedback',
              desc: 'Automated tests via the Smart Runner Protocol.',
            },
            {
              title: 'Rich Media',
              desc: 'Quizzes, diagrams, videos, and explanations.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <span className="text-sm font-bold text-foreground">
                {f.title}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
        <Callout type="info">
          Courses are <strong>git-native</strong>. Students clone a repository
          and the Progy CLI layers interactive content on top.
        </Callout>
      </section>

      <section className="space-y-4">
        <SubHeading>Environment Detection</SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 font-semibold text-foreground">
                  Feature
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Instructor
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Student
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['Detection', 'course.json & content/', '.progy file'],
                ['progy start', 'GUEST (no sync)', 'Authenticated (saves XP)'],
                ['progy dev', 'Allowed', 'Blocked'],
                ['progy test', 'Allowed', 'Blocked'],
              ].map(([f, i, s]) => (
                <tr key={f} className="border-t border-border">
                  <td className="p-3 font-medium text-foreground">{f}</td>
                  <td className="p-3 text-xs">{i}</td>
                  <td className="p-3 text-xs">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
