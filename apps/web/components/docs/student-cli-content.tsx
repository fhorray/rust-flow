import {
  Zap,
  Play,
  CheckCircle,
  Settings,
  Command,
  LogIn,
  LogOut,
  RotateCcw,
  CloudUpload,
  RefreshCw,
  Sliders,
  Flag,
} from 'lucide-react';
import { SectionHeading, SubHeading, Callout } from './section-heading';

export function StudentCLIContent() {
  const commands = [
    {
      cmd: 'progy login',
      desc: 'Authenticate with your Progy account. Opens a browser for device authorization.',
      icon: LogIn,
    },
    {
      cmd: 'progy init',
      desc: 'Bootstrap a course in the current folder.  Clones the course repo and sets up your workspace.',
      icon: Zap,
    },
    {
      cmd: 'progy start',
      desc: 'Launches the local engine & browser UI at http://localhost:3001.',
      icon: Play,
    },
    {
      cmd: 'progy save -m "message"',
      desc: 'Git commit and push your progress to the cloud in one command.',
      icon: CloudUpload,
    },
    {
      cmd: 'progy sync',
      desc: 'Pull the latest course updates from the instructor and merge with your progress.',
      icon: RefreshCw,
    },
    {
      cmd: 'progy reset <path>',
      desc: 'Restore an exercise file to its original state from the course cache.',
      icon: RotateCcw,
    },
    {
      cmd: 'progy config set <key> <value>',
      desc: 'Update a global configuration setting (e.g., editor, theme).',
      icon: Sliders,
    },
    {
      cmd: 'progy config list',
      desc: 'Display all current global configuration values.',
      icon: Settings,
    },
    {
      cmd: 'progy logout',
      desc: 'Clear your authentication token and end your session.',
      icon: LogOut,
    },
  ];

  const flags = [
    {
      flag: '--offline',
      applies: 'start, init',
      desc: 'Run without authentication or cloud sync. Progress is saved locally.',
    },
    {
      flag: '--help',
      applies: 'All commands',
      desc: 'Display help and usage information for any command.',
    },
    {
      flag: '-m "message"',
      applies: 'save',
      desc: 'Commit message for your save snapshot (default: "progy save").',
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="CLI Reference"
        subtitle="Every command you need to manage your learning workflow."
        badge="⌨️ Student CLI"
      />

      <section className="space-y-1">
        <SubHeading id="cli-commands">Commands</SubHeading>
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
      </section>

      <section className="space-y-4">
        <SubHeading
          id="common-flags"
          icon={<Flag className="text-primary" size={18} />}
        >
          Common Flags
        </SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left p-3 font-semibold text-foreground">
                  Flag
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Applies To
                </th>
                <th className="text-left p-3 font-semibold text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {flags.map((f) => (
                <tr key={f.flag} className="border-t border-border">
                  <td className="p-3 font-mono text-primary text-xs">
                    {f.flag}
                  </td>
                  <td className="p-3 text-xs">{f.applies}</td>
                  <td className="p-3 text-xs">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Callout type="tip">
        You can run any command with{' '}
        <code className="text-xs bg-muted px-1 rounded">
          bunx progy &lt;command&gt;
        </code>{' '}
        without a global install. Just make sure{' '}
        <code className="text-xs bg-muted px-1 rounded">bun</code> is installed.
      </Callout>
    </div>
  );
}
