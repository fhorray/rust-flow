import { SectionHeading, SubHeading, Callout } from './section-heading';
import { Shield, Clock, Bug, Server, Lock } from 'lucide-react';

export function InstructorBestPracticesContent() {
  const practices = [
    {
      icon: <Shield className="text-blue-400" size={18} />,
      title: 'Isolation',
      desc: "Always assume the student's machine is messy. Use Docker runners for anything beyond basic syntax exercises.",
      do: [
        'Use Docker for courses that require specific library or compiler versions.',
        'Set network: "none" in Docker to prevent external requests (unless needed).',
        'Run containers as non-root users where possible (USER student in Dockerfile).',
      ],
      dont: [
        'Never mount sensitive host directories (e.g., /, ~/.ssh).',
        'Never assume students have specific tools installed on their host.',
      ],
    },
    {
      icon: <Lock className="text-green-400" size={18} />,
      title: 'Immutability',
      desc: "The runner script should never modify the student's source file unless explicitly intended.",
      do: [
        'Copy the student file to /tmp before running transformations.',
        'Use read-only volume mounts when possible.',
        "Keep the student's original code untouched after execution.",
      ],
      dont: [
        "Never write back to the student file (unless it's a formatter exercise).",
        'Never delete student files from the runner.',
      ],
    },
    {
      icon: <Bug className="text-yellow-400" size={18} />,
      title: 'Feedback Quality',
      desc: 'Your runner should always capture stderr and provide meaningful output. Students need compiler output, not just "Failed".',
      do: [
        'Always capture both stdout and stderr.',
        'Use meaningful summary messages that tell the student what went wrong.',
        'Include diagnostics with file and line info for compiled languages.',
        'Use the tests array for step-by-step validation.',
      ],
      dont: [
        'Don\'t use generic summaries like "Error" or "Failed".',
        "Don't swallow stderr silently.",
      ],
    },
    {
      icon: <Clock className="text-orange-400" size={18} />,
      title: 'Timeouts',
      desc: 'Always set a timeout (e.g., 5-10 seconds). Infinite loops in student code are common and will hang the container.',
      do: [
        'Set subprocess timeout to 5 seconds (or 10 for complex builds).',
        'Return a clear "Timeout" message via SRP when time limit is exceeded.',
        'Use ulimit or cgroups for additional resource constraints in Docker.',
      ],
      dont: [
        'Never run student code without a timeout.',
        "Don't set timeouts too high (>30s) — students expect fast feedback.",
      ],
    },
    {
      icon: <Server className="text-purple-400" size={18} />,
      title: 'Docker Best Practices',
      desc: 'Optimize your Docker setup for fast execution and small image sizes.',
      do: [
        'Use slim or alpine base images to reduce download time.',
        'Pin image versions (rust:1.75-slim, not rust:latest).',
        'Layer your Dockerfile — put COPY runner.py before COPY student code.',
        'Use .dockerignore to avoid copying node_modules, .git, etc.',
      ],
      dont: [
        'Avoid using :latest tags — they lead to non-reproducible environments.',
        "Don't install unnecessary packages in your Docker image.",
      ],
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Best Practices"
        subtitle="Essential guidelines for building robust, secure, and student-friendly courses."
        badge="✅ Checklist"
      />

      <div className="space-y-6">
        {practices.map((practice) => (
          <div
            key={practice.title}
            className="p-5 rounded-xl border border-border bg-card space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">{practice.icon}</div>
              <div>
                <h3 className="font-bold text-foreground">{practice.title}</h3>
                <p className="text-xs text-muted-foreground">{practice.desc}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 mb-2 block">
                  ✅ Do
                </span>
                <ul className="space-y-1">
                  {practice.do.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="text-[10px] uppercase tracking-widest font-bold text-red-400 mb-2 block">
                  ❌ Don&apos;t
                </span>
                <ul className="space-y-1">
                  {practice.dont.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground leading-relaxed"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Callout type="tip">
        <strong>Quick Checklist before Publishing:</strong> ✅ Timeouts are set
        → ✅ stderr is captured → ✅ Docker images are slim → ✅ Network is
        disabled → ✅ Non-root user → ✅ Summaries are meaningful
      </Callout>
    </div>
  );
}
