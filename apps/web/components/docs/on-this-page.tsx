import { useEffect, useState } from 'react';
import type { TocItem } from './toc-data';

interface OnThisPageProps {
  items: TocItem[];
}

export function OnThisPage({ items }: OnThisPageProps) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-20 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">
          On this page
        </p>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(item.id)
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`block px-3 py-1.5 text-xs rounded-md transition-colors border-l-2 ${
              activeId === item.id
                ? 'border-primary text-primary font-medium bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
