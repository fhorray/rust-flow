import React from 'react';
import type { CodingQuestion } from '../types';

interface CodingViewerProps {
  q: CodingQuestion;
  answer: string;
  isAnswered: boolean;
  onSelect: (val: string) => void;
}

export function CodingViewer({
  q,
  answer,
  isAnswered,
  onSelect,
}: CodingViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 uppercase font-bold tracking-wider">
        <span>{q.language}</span>
        <span>Editor</span>
      </div>
      <textarea
        value={answer || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isAnswered}
        placeholder="// Write your code here..."
        className="w-full h-48 p-4 rounded-md border border-zinc-700 bg-zinc-950 font-mono text-sm text-zinc-300 resize-none focus:outline-none focus:border-orange-500"
        spellCheck={false}
      />
      {isAnswered && (
        <div className="p-3 bg-zinc-900 rounded border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2 font-bold uppercase">
            Solution Reference:
          </p>
          <pre className="text-xs text-emerald-400 overflow-x-auto font-mono">
            {q.solutionCode}
          </pre>
        </div>
      )}
    </div>
  );
}