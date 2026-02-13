import React from 'react';
import type { TextAnswerQuestion } from '../types';

interface TextAnswerViewerProps {
  q: TextAnswerQuestion;
  answer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  onSelect: (val: string) => void;
}

export function TextAnswerViewer({
  q,
  answer,
  isAnswered,
  isCorrect,
  onSelect,
}: TextAnswerViewerProps) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={answer || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isAnswered}
        placeholder="Type your answer here..."
        className={`w-full p-4 rounded-md border bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500 ${isAnswered
          ? isCorrect
            ? 'border-emerald-500/50 text-emerald-400'
            : 'border-red-500/50 text-red-400'
          : 'border-zinc-700'
          }`}
      />
      {isAnswered && !isCorrect && (
        <div className="text-sm text-emerald-400">
          Possible answers: {q.acceptedAnswers.join(', ')}
        </div>
      )}
    </div>
  );
}