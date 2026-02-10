import {
  Node,
  mergeAttributes,
  type NodeViewProps,
  type RawCommands,
} from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';
import { Video } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoNode: {
      setVideo: (attributes?: { url: string }) => ReturnType;
    };
  }
}

const VideoComponent = (props: NodeViewProps) => {
  const { node, updateAttributes } = props;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttributes({ url: e.target.value });
  };

  return (
    <div className="my-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
          <Video size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Video Lesson
          </h4>
          <input
            type="text"
            className="w-full bg-transparent border-none text-sm text-zinc-100 focus:ring-0 p-0 placeholder-zinc-700"
            placeholder="Paste video URL (YouTube, Vimeo...)"
            value={node.attrs.url || ''}
            onChange={handleUrlChange}
          />
        </div>
      </div>

      {node.attrs.url ? (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden relative">
          <img
            src={`https://img.youtube.com/vi/${getYouTubeId(node.attrs.url)}/maxresdefault.jpg`}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => (e.currentTarget.style.display = 'none')}
            alt=""
          />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-xl">
              <Video size={24} className="text-white fill-current" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950/80 px-2 py-1 rounded backdrop-blur-sm">
              {node.attrs.url}
            </span>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-zinc-950 rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-600">
          <Video size={32} />
          <span className="text-xs">No video URL provided</span>
        </div>
      )}
    </div>
  );
};

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const VideoNode = Node.create({
  name: 'videoNode',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'video' })];
  },

  addCommands() {
    return {
      setVideo:
        (attributes: any) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    } as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },
});
