import { Zap, CheckCircle, X } from 'lucide-react';
import { SectionHeading } from './section-heading';

export function StudentTutorialContent() {
  const steps = [
    {
      step: 1,
      title: 'The Workspace',
      desc: (
        <>
          Run{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs">
            progy start
          </code>{' '}
          to open your dashboard. Any code you save in your editor is instantly
          watched by Progy.
        </>
      ),
      preview: (
        <div className="rounded-xl border border-code-border bg-code p-2 shadow-2xl">
          <div className="aspect-video bg-background rounded-lg flex flex-col overflow-hidden border border-border">
            <div className="h-7 bg-secondary border-b border-border flex items-center px-3 gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive/30" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
              <div className="w-2 h-2 rounded-full bg-green-500/30" />
            </div>
            <div className="flex-1 flex gap-2 p-3 font-mono text-[10px]">
              <div className="w-1/4 space-y-2 border-r border-border pr-2 opacity-40">
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-3/4 bg-muted rounded" />
              </div>
              <div className="flex-1 space-y-2 text-muted-foreground">
                <p>
                  <span className="text-purple-400">fn</span>{' '}
                  <span className="text-blue-400">solve</span>() {'{'}
                </p>
                <p className="pl-4">
                  <span className="text-foreground">let</span> x ={' '}
                  <span className="text-primary">10</span>;
                </p>
                <p>{'}'}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: 2,
      title: 'Validation Loop',
      desc: (
        <>
          Hit{' '}
          <kbd className="bg-secondary border border-border border-b-2 px-1.5 py-0.5 rounded text-[10px] shadow-sm font-mono">
            Cmd+Enter
          </kbd>{' '}
          to trigger the runner. Progy will parse the output and give you
          instant feedback.
        </>
      ),
      preview: (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-2 text-green-500 font-bold text-xs mb-2">
              <CheckCircle className="w-3 h-3" /> PASS
            </div>
            <div className="h-1.5 w-full bg-green-500/20 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500 rounded-full" />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 opacity-60">
            <div className="flex items-center gap-2 text-destructive font-bold text-xs mb-2">
              <X className="w-3 h-3" /> FAIL
            </div>
            <div className="h-1.5 w-full bg-destructive/20 rounded-full" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-700 max-w-3xl">
      <SectionHeading
        title="Interactive Workspace"
        subtitle="The Progy Workspace is where the magic happens. It connects your local editor to our real-time validation engine."
        badge="⚡ Quick Start Guide"
      />

      <div className="space-y-16 relative border-l-2 border-border pl-10 ml-4">
        {steps.map((item) => (
          <div key={item.step} className="relative group">
            <div className="absolute -left-[53px] top-0 w-6 h-6 rounded-full bg-background border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-primary z-10">
              {item.step}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              {item.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-xl">
              {item.desc}
            </p>
            {item.preview}
          </div>
        ))}
      </div>
    </div>
  );
}
