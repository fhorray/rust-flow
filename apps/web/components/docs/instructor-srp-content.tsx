import { CodeBlock } from './code-block';
import { SectionHeading, SubHeading, Callout } from './section-heading';
import { Zap } from 'lucide-react';

export function InstructorSRPContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Smart Runner Protocol (SRP)"
        subtitle='The SRP is how executed code communicates back to the Progy UI, enabling rich feedback like "✅ 5/5 Tests Passed".'
        badge="⚡ Core Concept"
      />

      <section className="space-y-4">
        <SubHeading>The Format</SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your runner must print a JSON block wrapped in special markers to{' '}
          <code className="bg-muted px-1 rounded text-xs">stdout</code>:
        </p>
        <CodeBlock
          code={`__SRP_BEGIN__
{
  "success": true,
  "summary": "All tests passed!",
  "diagnostics": [],
  "tests": [
    { "name": "Function add(2,2)", "status": "pass" },
    { "name": "Function sub(5,3)", "status": "pass" }
  ],
  "raw": "Output: 4\\nOutput: 2"
}
__SRP_END__`}
          language="json"
          label="SRP Output"
        />
      </section>

      <section className="space-y-4">
        <SubHeading>Fields Reference</SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 font-semibold text-foreground">
                  Field
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Type
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                [
                  'success',
                  'bool',
                  'Required. Controls green/red status in UI.',
                ],
                [
                  'summary',
                  'string',
                  'Required. Short message displayed prominently.',
                ],
                [
                  'raw',
                  'string',
                  'Required. Actual output shown in both views.',
                ],
                [
                  'tests',
                  'array',
                  'Optional. Individual test cases with name/status.',
                ],
                [
                  'diagnostics',
                  'array',
                  'Optional. Compiler errors with file/line info.',
                ],
              ].map(([f, t, d]) => (
                <tr key={f} className="border-t border-border">
                  <td className="p-3 font-mono text-primary text-xs">{f}</td>
                  <td className="p-3 font-mono text-xs">{t}</td>
                  <td className="p-3 text-xs">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <SubHeading>Best Practices</SubHeading>

        <h4 className="text-sm font-semibold text-foreground mt-6">
          1. Make summary meaningful
        </h4>
        <CodeBlock
          code={`# ❌ Bad - Too generic
summary = "Success"

# ✅ Good - Tells student what happened
summary = "Correct! You selected all 3 users."
summary = "Query returned 5 rows (expected 3)"`}
          language="python"
          label="Python"
        />

        <h4 className="text-sm font-semibold text-foreground mt-6">
          2. Use tests for multi-step validation
        </h4>
        <CodeBlock
          code={`response = {
    "success": all_passed,
    "summary": f"{passed_count}/{total_count} tests passed",
    "tests": [
        {"name": "Returns correct type", "status": "pass"},
        {"name": "Handles empty input", "status": "fail",
         "message": "Expected [] but got None"},
        {"name": "Handles negative numbers", "status": "pass"}
    ],
    "raw": full_output
}`}
          language="python"
          label="Python"
        />

        <h4 className="text-sm font-semibold text-foreground mt-6">
          3. Use diagnostics for code issues
        </h4>
        <CodeBlock
          code={`response = {
    "success": False,
    "summary": "Syntax Error",
    "diagnostics": [
        {
            "severity": "error",
            "message": "expected ';' after expression",
            "file": "main.rs",
            "line": 15,
            "snippet": "let x = 5"
        }
    ],
    "raw": full_compiler_output
}`}
          language="python"
          label="Python"
        />
      </section>
    </div>
  );
}
