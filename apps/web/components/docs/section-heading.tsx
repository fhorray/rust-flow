import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  id?: string;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function SectionHeading({ title, subtitle, badge, id }: SectionHeadingProps) {
  const headingId = id || slugify(title);
  return (
    <div className="space-y-3 border-b border-border pb-6 mb-8" id={headingId}>
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest">
          {badge}
        </span>
      )}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export function SubHeading({ children, icon, id }: { children: React.ReactNode; icon?: React.ReactNode; id?: string }) {
  const headingId = id || (typeof children === 'string' ? slugify(children) : undefined);
  return (
    <h2 id={headingId} className="text-xl font-bold flex items-center gap-2 mt-10 mb-4 scroll-mt-20">
      {icon}
      {children}
    </h2>
  );
}

export function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-primary/5 border-primary/20 text-primary',
    warning: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500',
    tip: 'bg-green-500/5 border-green-500/20 text-green-400',
  };

  return (
    <div className={`rounded-xl border p-4 my-4 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  );
}
