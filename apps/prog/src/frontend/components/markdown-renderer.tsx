import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import { VideoPlayer } from './video-player';

interface MarkdownRendererProps {
  content: string;
}

const languages = {
  rust,
  go,
  typescript,
  javascript,
  bash,
  shell,
};

const preprocessMarkdown = (content: string) => {
  if (!content) return '';
  return content
    .replace(/::note\[(.*?)\]/g, '> 📝 **Note**\n> $1')
    .replace(/::video\[(.*?)\]/g, '![VIDEO]($1)');
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="text-zinc-300">
      <ReactMarkdown
        rehypePlugins={[[rehypeHighlight, { languages }]]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-3xl font-bold text-zinc-100 mt-0 mb-4"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl font-bold text-zinc-100 mt-5 mb-3"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-xl font-bold text-zinc-100 mt-4 mb-2"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
          ),
          li: ({ ...props }) => <li className="ml-4" {...props} />,
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !match ? (
              <code
                className="bg-zinc-900/50 text-rust-light px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ ...props }) => (
            <pre
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4 overflow-x-auto"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong className="text-rust font-bold" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="text-rust hover:text-rust-light underline underline-offset-4"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-rust bg-rust/5 pl-4 py-2 pr-2 italic text-zinc-400 my-4 rounded-r-lg text-sm"
              {...props}
            />
          ),
          img: ({ src, alt, ...props }) => {
            if (alt === 'VIDEO' && src) return <VideoPlayer src={src} />;
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full rounded-lg my-4 border border-zinc-800"
                {...props}
              />
            );
          },
        }}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
