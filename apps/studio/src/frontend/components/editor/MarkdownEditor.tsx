import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { updateTabContent, saveActiveFile } from '../../stores/editor-store';
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Video,
  Info,
} from 'lucide-react';
import { VideoNode } from './extensions/VideoNode';
import { NoteNode } from './extensions/NoteNode';

// ─── Toolbar Button ─────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${isActive
        ? 'bg-blue-600/60 text-blue-200'
        : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
        }`}
    >
      {children}
    </button>
  );
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-zinc-800/80 bg-zinc-900/60 overflow-x-auto">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-zinc-700/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-zinc-700/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <Code size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-zinc-700/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setVideo().run()}
        title="Insert Video"
      >
        <Video size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setNote({ type: 'info' }).run()}
        title="Insert Note"
      >
        <Info size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-zinc-700/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={14} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => {
          const url = window.prompt('URL:');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        isActive={editor.isActive('link')}
        title="Insert Link"
      >
        <Link2 size={14} />
      </ToolbarButton>

      <div className="w-px h-5 bg-zinc-700/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo size={14} />
      </ToolbarButton>
    </div>
  );
}

// ─── MarkdownEditor ─────────────────────────────────────────────────────────

function preProcessMarkdown(content: string): string {
  if (!content) return '';
  // Convert ::video{src="..."} to HTML for Tiptap
  let processed = content.replace(
    /::video\{src="([^"]+)"\}/g,
    '<div data-type="video" url="$1"></div>',
  );

  // Convert :::note ... ::: to HTML for Tiptap
  // Support note, tip, warning, info, important, danger
  processed = processed.replace(
    /^:::(note|tip|warning|info|important|danger)\s*\n([\s\S]*?)\n:::/gm,
    (match, type, innerContent) => {
      // We need to recursively process inner content or just wrap it?
      // Tiptap will parse inner content as markdown if we wrap it in div
      return `<div data-type="note" data-note-type="${type}">\n${innerContent}\n</div>`;
    },
  );

  return processed;
}

export function MarkdownEditor({
  initialContent,
  path,
}: {
  initialContent: string;
  path: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
      }),
      VideoNode,
      NoteNode,
    ],
    content: preProcessMarkdown(initialContent),
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-zinc max-w-none focus:outline-none min-h-[500px] px-8 py-6 text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown.getMarkdown();
      updateTabContent(path, md);
    },
  });

  // Ctrl+S save shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveActiveFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col bg-zinc-900/30">
      <Toolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
