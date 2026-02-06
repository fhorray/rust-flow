import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full 
        border-2 border-transparent shadow-sm transition-colors 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
        disabled:cursor-not-allowed disabled:opacity-50 
        ${checked ? 'bg-rust' : 'bg-zinc-700'}
        ${className || ''}
      `}
    >
      <span
        className={`
          pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 
          transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function Label({ htmlFor, children, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}
    >
      {children}
    </label>
  );
}
