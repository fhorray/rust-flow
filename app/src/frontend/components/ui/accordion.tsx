import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

const AccordionContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type?: 'single' | 'multiple';
    collapsible?: boolean;
    defaultValue?: string;
  }
>(
  (
    { className, type = 'single', collapsible, defaultValue, ...props },
    ref,
  ) => {
    const [value, setValue] = React.useState(defaultValue || '');

    return (
      <AccordionContext.Provider
        value={{
          value,
          onValueChange: (newValue) => {
            if (type === 'single') {
              setValue(collapsible && value === newValue ? '' : newValue);
            }
          },
        }}
      >
        <div ref={ref} className={cn('', className)} {...props} />
      </AccordionContext.Provider>
    );
  },
);
Accordion.displayName = 'Accordion';

const AccordionItemContext = React.createContext<{ value?: string }>({});

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value: itemValue, ...props }, ref) => {
  const { value: rootValue } = React.useContext(AccordionContext);
  const isOpen = rootValue === itemValue;

  return (
    <AccordionItemContext.Provider value={{ value: itemValue }}>
      <div
        ref={ref}
        className={cn('border-b border-zinc-800', className)}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      />
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { value: rootValue, onValueChange } =
    React.useContext(AccordionContext);
  const { value: itemValue } = React.useContext(AccordionItemContext);
  const isOpen = rootValue === itemValue;

  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        onClick={() => itemValue && onValueChange?.(itemValue)}
        className={cn(
          'cursor-pointer flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-rust text-zinc-400 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </div>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value: rootValue } = React.useContext(AccordionContext);
  const { value: itemValue } = React.useContext(AccordionItemContext);
  const isOpen = rootValue === itemValue;

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden text-sm transition-all',
        isOpen ? 'block animate-accordion-down' : 'hidden animate-accordion-up',
        className,
      )}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      <div className="pb-4 pt-0 h-full">{children}</div>
    </div>
  );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
