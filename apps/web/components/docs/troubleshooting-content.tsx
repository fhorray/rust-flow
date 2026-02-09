import { SectionHeading, SubHeading, Callout } from './section-heading';
import {
  AlertTriangle,
  HelpCircle,
  Terminal,
  Server,
  Database,
  FileWarning,
} from 'lucide-react';

export function TroubleshootingContent() {
  const issues = [
    {
      icon: <Server className="text-red-400" size={18} />,
      title: '"Docker not found" or "Cannot connect to Docker daemon"',
      cause: 'Docker Desktop is not running or is not in your system PATH.',
      fixes: [
        'Ensure Docker Desktop is installed and running.',
        'Verify with: docker info in your terminal.',
        'On Windows, make sure Docker Desktop has WSL2 integration enabled.',
      ],
    },
    {
      icon: <Terminal className="text-red-400" size={18} />,
      title: '"Port 3001 is already in use"',
      cause:
        'Another Progy instance or another application is already using port 3001.',
      fixes: [
        'Close any existing Progy windows or processes.',
        'Run: bunx progy kill-port 3001',
        'Or find and kill the process manually: lsof -i :3001 (macOS/Linux) or netstat -ano | findstr :3001 (Windows).',
      ],
    },
    {
      icon: <FileWarning className="text-yellow-400" size={18} />,
      title: '"SRP JSON Decode Error"',
      cause:
        'Your runner printed extra text before __SRP_BEGIN__ or after __SRP_END__, or the JSON is malformed.',
      fixes: [
        'Ensure __SRP_BEGIN__ is on its very own line with no leading spaces.',
        'Capture ALL student stdout into a variable (do not let it leak).',
        'Place student output inside the "raw" field of the JSON.',
        'If using bash, consider switching to Python/Node for safer JSON escaping.',
      ],
    },
    {
      icon: <Database className="text-yellow-400" size={18} />,
      title: '"Volume Mount Failed" (Windows)',
      cause:
        'Docker Desktop on Windows sometimes struggles with path formats if not using WSL2 backend.',
      fixes: [
        'Make sure the drive is shared in Docker Desktop → Settings → Resources → File Sharing.',
        'Recommend students use WSL2 backend for Docker Desktop.',
        'Avoid spaces and special characters in project path names.',
      ],
    },
    {
      icon: <AlertTriangle className="text-orange-400" size={18} />,
      title: '"progy: command not found"',
      cause:
        'Progy is not installed globally or the install path is not in your PATH.',
      fixes: [
        'Install globally: bun install -g progy',
        'Or run via: bunx progy <command>',
        'Verify Bun is installed: bun --version',
      ],
    },
    {
      icon: <HelpCircle className="text-blue-400" size={18} />,
      title: '"Authentication required" / Login issues',
      cause:
        "Your session token may have expired, or you haven't logged in yet.",
      fixes: [
        'Run progy login to start a new authentication session.',
        "If the browser doesn't open, manually navigate to the URL shown in the terminal.",
        "If the code doesn't work, restart the login process.",
      ],
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Troubleshooting"
        subtitle="Solutions for common issues encountered when using Progy."
        badge="🔧 Help"
      />

      <div className="space-y-4">
        {issues.map((issue) => (
          <details
            key={issue.title}
            className="group rounded-xl border border-border bg-card overflow-hidden"
          >
            <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors select-none">
              <div className="p-1.5 rounded-lg bg-muted">{issue.icon}</div>
              <span className="font-semibold text-sm text-foreground flex-1">
                {issue.title}
              </span>
              <svg
                className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-0 border-t border-border space-y-3">
              <div className="pt-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Cause
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {issue.cause}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  How to Fix
                </span>
                <ul className="mt-1 space-y-1.5">
                  {issue.fixes.map((fix, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary font-bold text-xs mt-0.5">
                        {i + 1}.
                      </span>
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        ))}
      </div>

      <Callout type="info">
        Still stuck? Check the Progy GitHub repository for known issues or open
        a new issue with your error output.
      </Callout>
    </div>
  );
}
