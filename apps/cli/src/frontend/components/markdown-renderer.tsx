import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkCallouts from 'remark-callouts';
import { visit } from 'unist-util-visit';
import { VideoPlayer } from './video-player';
import {
  Copy,
  Play,
  Check,
  Info,
  AlertTriangle,
  Lightbulb,
  Terminal,
} from 'lucide-react';
import { runTests } from '../stores/course-store';
import mermaid from 'mermaid';

// Traditional Highlight.js languages
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import dockerfile from 'highlight.js/lib/languages/dockerfile';

import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

const hljsLanguages = {
  rust,
  go,
  typescript,
  javascript,
  bash,
  sql,
  python,
  json,
  yaml,
  dockerfile,
};

// Initialize Mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

// Custom plugin to transform directives into standard HTML elements or components
function remarkDirectiveTransformer() {
  return (tree: any) => {
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};

        if (
          ['note', 'video', 'tip', 'warning', 'info', 'danger'].includes(
            node.name,
          )
        ) {
          data.hName = node.name;
          data.hProperties = attributes;
        }
      }
    });
  };
}

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const isMermaid = className === 'language-mermaid' || className === 'mermaid';
  const language = className ? className.replace('language-', '') : '';

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isMermaid) {
    return <MermaidChart preview={String(children)} />;
  }

  return (
    <div className="group relative my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-x border-t border-zinc-700/50 rounded-t-lg text-xs text-zinc-400 font-mono">
        <span className="flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          {language || 'text'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => runTests()}
            className="text-rust hover:text-rust-light transition-colors flex items-center gap-1 font-bold"
          >
            <Play className="w-3 h-3" /> Run
          </button>
        </div>
      </div>
      <div className="bg-zinc-950 border border-zinc-700/50 rounded-b-lg overflow-hidden">
        <pre
          className="m-0 p-4 overflow-x-auto text-sm leading-relaxed"
          {...props}
        >
          <code className={className}>{children}</code>
        </pre>
      </div>
    </div>
  );
};

const MermaidChart = ({ preview }: { preview: string }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.removeAttribute('data-processed');
      const render = async () => {
        try {
          await mermaid.run({
            nodes: [elementRef.current!],
          });
          setError(null);
        } catch (e) {
          console.error('Mermaid run failed:', e);
          setError(String(e));
        }
      };
      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(render, 50);
      return () => clearTimeout(timer);
    }
  }, [preview]);

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
        <p className="font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Mermaid Render Error
        </p>
        <pre className="whitespace-pre-wrap">{preview}</pre>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/10 p-6 rounded-xl border border-zinc-800/50 my-8 flex justify-center overflow-x-auto shadow-inner min-h-[50px]">
      <div ref={elementRef} className="mermaid">
        {preview}
      </div>
    </div>
  );
};

const Callout = ({
  children,
  type = 'info',
  title,
}: {
  children: React.ReactNode;
  type?: string;
  title?: string;
}) => {
  const icons: Record<string, any> = {
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    tip: <Lightbulb className="w-5 h-5" />,
    danger: <AlertTriangle className="w-5 h-5" />,
    note: <Info className="w-5 h-5" />,
  };

  const styleMap: Record<
    string,
    { border: string; bg: string; text: string; icon: string }
  > = {
    info: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      text: 'text-blue-100',
      icon: 'text-blue-400',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      text: 'text-amber-100',
      icon: 'text-amber-400',
    },
    tip: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-100',
      icon: 'text-emerald-400',
    },
    danger: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      text: 'text-red-100',
      icon: 'text-red-400',
    },
    note: {
      border: 'border-zinc-500/30',
      bg: 'bg-zinc-500/5',
      text: 'text-zinc-100',
      icon: 'text-zinc-400',
    },
  };

  const style = styleMap[type] || styleMap.info;

  return (
    <div
      className={`my-8 border-l-4 p-4 rounded-r-xl shadow-lg border-opacity-50 ${style?.border} ${style?.bg} ${style?.text}`}
    >
      <div
        className={`flex items-center gap-2 mb-2 font-black uppercase tracking-widest text-[10px] ${style?.icon}`}
      >
        {icons[type] || icons.info}
        {title || type}
      </div>
      <div className="text-sm leading-relaxed opacity-90 prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="markdown-body text-zinc-300">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkCallouts,
          remarkDirective,
          remarkDirectiveTransformer,
          remarkMath,
          remarkBreaks,
        ]}
        rehypePlugins={[
          [rehypeHighlight, { languages: hljsLanguages }],
          rehypeKatex,
        ]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-3xl font-black text-white mt-12 mb-6 first:mt-0 tracking-tight"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl font-bold text-zinc-100 mt-10 mb-5 border-b border-zinc-800 pb-3 tracking-tight"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-xl font-bold text-zinc-100 mt-8 mb-4 tracking-tight"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="text-lg font-bold text-zinc-200 mt-6 mb-3"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <div className="mb-5 leading-relaxed last:mb-0" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-outside mb-6 ml-6 space-y-2"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-outside mb-6 ml-6 space-y-2"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className="pl-1 text-zinc-300" {...props} />
          ),
          hr: () => <hr className="my-12 border-zinc-800/50" />,

          // Tables
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-8 border border-zinc-800/50 rounded-xl bg-zinc-900/20 shadow-inner">
              <table
                className="w-full text-sm text-left border-collapse"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead
              className="bg-zinc-800/40 border-b border-zinc-800"
              {...props}
            />
          ),
          th: ({ ...props }) => (
            <th
              className="px-6 py-4 font-bold text-zinc-100 text-xs uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="px-6 py-4 border-b border-zinc-800/30 text-zinc-400 transition-colors"
              {...props}
            />
          ),

          // Code
          code: ({ inline, ...props }: any) => {
            if (props.className?.includes('language-')) {
              return <CodeBlock {...props} />;
            }
            return (
              <code
                className="bg-zinc-800/50 text-rust-light px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-zinc-700/30 whitespace-nowrap"
                {...props}
              />
            );
          },
          pre: ({ children }) => <>{children}</>,

          // Links & Format
          strong: ({ ...props }) => (
            <strong className="text-rust-light font-bold" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-zinc-400" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-rust hover:text-rust-light underline underline-offset-4 decoration-rust/30 hover:decoration-rust transition-all font-medium"
              {...props}
            />
          ),

          // Blockquotes
          blockquote: ({ children, ...props }: any) => {
            // Attempt to match data-callout set by remark-callouts
            const dataAttributes = props as any;
            if (dataAttributes?.['data-callout']) {
              return (
                <Callout
                  type={dataAttributes['data-callout']}
                  title={dataAttributes['data-callout-title']}
                >
                  {children}
                </Callout>
              );
            }

            // Fallback for manual check (if plugin fails for some reason)
            const childArray = React.Children.toArray(children);
            const firstChild = childArray[0] as any;
            if (
              firstChild?.props?.children?.[0] &&
              typeof firstChild.props.children[0] === 'string' &&
              firstChild.props.children[0].trim().startsWith('[!')
            ) {
              const text = firstChild.props.children[0].trim();
              const match = text.match(/^\[!(.*?)\]/);
              if (match) {
                const type = match[1]?.toLowerCase();
                const remainingText = text.replace(/^\[!(.*?)\]/, '').trim();

                const newFirstChild = React.cloneElement(firstChild, {
                  children: [
                    remainingText,
                    ...(Array.isArray(firstChild.props.children)
                      ? firstChild.props.children.slice(1)
                      : []),
                  ],
                });

                return (
                  <Callout type={type}>
                    {newFirstChild}
                    {childArray.slice(1)}
                  </Callout>
                );
              }
            }

            return (
              <blockquote
                className="border-l-4 border-rust bg-rust/5 pl-6 py-4 pr-4 italic text-zinc-400 my-8 rounded-r-xl text-base leading-relaxed"
                {...props}
              />
            );
          },

          // Directives and Unknown tags
          ...({
            video: ({ src }: any) => (
              <div className="my-10">
                <VideoPlayer src={src} />
              </div>
            ),
            note: ({ children, type, title }: any) => (
              <Callout type={type || 'note'} title={title}>
                {children}
              </Callout>
            ),
            tip: ({ children, title }: any) => (
              <Callout type="tip" title={title}>
                {children}
              </Callout>
            ),
            warning: ({ children, title }: any) => (
              <Callout type="warning" title={title}>
                {children}
              </Callout>
            ),
            info: ({ children, title }: any) => (
              <Callout type="info" title={title}>
                {children}
              </Callout>
            ),
            danger: ({ children, title }: any) => (
              <Callout type="danger" title={title}>
                {children}
              </Callout>
            ),
          } as any),

          input: ({ type, checked, ...props }: any) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-rust"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
