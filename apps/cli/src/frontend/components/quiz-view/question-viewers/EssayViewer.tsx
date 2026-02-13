import React from 'react';
import type { EssayQuestion } from '../types';

interface EssayViewerProps {
  q: EssayQuestion;
  answer: string;
  isAnswered: boolean;
  onSelect: (val: string) => void;
}

export function EssayViewer({ q, answer, isAnswered, onSelect }: EssayViewerProps) {
  const safeAnswer = typeof answer === 'string' ? answer : '';
  const wordCount = safeAnswer
    .trim()
    .split(/\s+/)
    .filter((w: string) => w.length > 0).length;

  return (
    <div className="space-y-4">
      <textarea
        value={answer || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isAnswered}
        placeholder="Write your response..."
        className="w-full h-48 p-4 rounded-md border border-zinc-700 bg-zinc-900/50 text-zinc-100 resize-none focus:outline-none focus:border-orange-500"
      />
      <div className="text-xs text-zinc-500 flex justify-end">
        {wordCount} / {q.minWords || 0} words required
      </div>
    </div>
  );
}