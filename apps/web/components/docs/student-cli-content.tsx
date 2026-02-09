import { Zap, Play, CheckCircle, Settings, Command } from 'lucide-react';
import { SectionHeading } from './section-heading';

export function StudentCLIContent() {
  const commands = [
    {
      cmd: 'progy init',
      desc: 'Bootstrap a course in the current folder.',
      icon: Zap,
    },
    {
      cmd: 'progy start',
      desc: 'Launches the local engine & browser UI.',
      icon: Play,
    },
    {
      cmd: 'progy save',
      desc: 'Git commit and push in one go.',
      icon: CheckCircle,
    },
    {
      cmd: 'progy sync',
      desc: 'Upstream sync for course updates.',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500">
      <SectionHeading
        title="CLI Reference"
        subtitle="Power commands for productive students."
      />

      <div className="grid gap-3">
        {commands.map((item) => (
          <div
            key={item.cmd}
            className="group flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-secondary/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
                <item.icon size={16} />
              </div>
              <div>
                <code className="text-sm font-bold font-mono text-foreground">
                  {item.cmd}
                </code>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <Command
              size={14}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
