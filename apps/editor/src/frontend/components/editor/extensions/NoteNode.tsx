import {
  Node,
  mergeAttributes,
  type NodeViewProps,
  type RawCommands,
} from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import React from 'react';
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    noteNode: {
      setNote: (attributes?: { type: string }) => ReturnType;
    };
  }
}

const NoteComponent = (props: NodeViewProps) => {
  const { node, updateAttributes } = props;
  const type = node.attrs.type || 'info';

  const icons: Record<string, any> = {
    info: <Info size={18} className="text-blue-400" />,
    warning: <AlertTriangle size={18} className="text-amber-400" />,
    tip: <Lightbulb size={18} className="text-emerald-400" />,
    important: <AlertCircle size={18} className="text-purple-400" />,
  };

  const colors: Record<string, string> = {
    info: 'bg-blue-500/5 border-blue-500/20',
    warning: 'bg-amber-500/5 border-amber-500/20',
    tip: 'bg-emerald-500/5 border-emerald-500/20',
    important: 'bg-purple-500/5 border-purple-500/20',
  };

  return (
    <div className={`my-6 border rounded-xl overflow-hidden ${colors[type]}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/30 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          {icons[type]}
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {type} Note
          </span>
        </div>
        <select
          value={type}
          onChange={(e) => updateAttributes({ type: e.target.value })}
          className="bg-transparent border-none text-[10px] font-bold text-zinc-500 uppercase focus:ring-0 p-0 cursor-pointer hover:text-zinc-300"
        >
          <option value="info">Info</option>
          <option value="tip">Tip</option>
          <option value="warning">Warning</option>
          <option value="important">Important</option>
        </select>
      </div>
      <div className="p-4 prose prose-sm prose-invert max-w-none">
        <NodeViewContent />
      </div>
    </div>
  );
};

export const NoteNode = Node.create({
  name: 'noteNode',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="note"]',
        getAttrs: (dom) => ({
          type: (dom as HTMLElement).getAttribute('data-note-type') || 'info',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'note',
        'data-note-type': node.attrs.type,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setNote:
        (attributes: any) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Important information' }],
              },
            ],
          });
        },
    } as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteComponent);
  },
});
