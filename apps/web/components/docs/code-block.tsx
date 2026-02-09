import React, { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'text',
  label,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border border-code-border bg-code overflow-hidden my-4 shadow-lg">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-code-border bg-code-header">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {label}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-muted" />
              <div className="w-2.5 h-2.5 rounded-full bg-muted" />
              <div className="w-2.5 h-2.5 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-md bg-secondary/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all z-10"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <Highlight
          theme={themes.nightOwl}
          code={code.trim()}
          language={language}
        >
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="p-5 overflow-x-auto text-sm leading-relaxed">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {showLineNumbers && (
                    <span className="inline-block w-8 text-right mr-4 text-muted-foreground/40 select-none text-xs">
                      {i + 1}
                    </span>
                  )}
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
