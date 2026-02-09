import { CodeBlock } from './code-block';
import { SectionHeading } from './section-heading';

export function InstallationContent() {
  return (
    <div className="space-y-10 py-6 animate-in fade-in duration-500">
      <SectionHeading
        title="Installation"
        subtitle="Get Progy running in your local environment."
      />

      <section className="space-y-4">
        <h3
          id="prerequisites"
          className="font-semibold text-foreground flex items-center gap-2 scroll-mt-20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Prerequisites
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <span className="font-bold block text-sm text-foreground">
              Bun v1.0+
            </span>
            <span className="text-xs text-muted-foreground">
              Required for CLI execution and package management.
            </span>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <span className="font-bold block text-sm text-foreground">Git</span>
            <span className="text-xs text-muted-foreground">
              Necessary for version control and progress syncing.
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3
          id="setup"
          className="font-semibold text-foreground flex items-center gap-2 scroll-mt-20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Setup
        </h3>
        <p className="text-sm text-muted-foreground">
          Global installation via Bun:
        </p>
        <CodeBlock
          code="bun install -g progy"
          language="bash"
          label="Terminal"
        />

        <p className="text-sm text-muted-foreground">
          Or run on-the-fly without installing:
        </p>
        <CodeBlock code="bunx progy --help" language="bash" label="Terminal" />

        <p className="text-sm text-muted-foreground">Verify installation:</p>
        <CodeBlock code="progy --version" language="bash" label="Terminal" />
      </section>
    </div>
  );
}
