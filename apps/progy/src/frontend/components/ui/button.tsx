import * as React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'cursor-pointer bg-rust text-white hover:bg-rust-dark shadow-sm',
    destructive: 'bg-red-900 text-red-100 hover:bg-red-800 shadow-sm',
    outline:
      'border border-zinc-700 bg-transparent shadow-sm hover:bg-zinc-800 hover:text-zinc-100',
    secondary: 'bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700',
    ghost: 'hover:bg-zinc-800 hover:text-zinc-100',
    link: 'text-primary underline-offset-4 hover:underline',
  };
  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  };
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
