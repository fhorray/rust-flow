import * as React from 'react';
import { cn } from '../../lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'border-transparent bg-rust text-white shadow hover:bg-rust-dark',
    secondary: 'border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
    destructive: 'border-transparent bg-red-900 text-red-100 hover:bg-red-800',
    outline: 'text-zinc-100 border-zinc-700',
  };
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
