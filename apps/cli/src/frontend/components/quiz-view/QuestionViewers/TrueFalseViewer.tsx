import React from 'react';
import { Button } from '@progy/ui/button';
import type { TrueFalseQuestion } from '../types';

interface TrueFalseViewerProps {
  q: TrueFalseQuestion;
  answer: boolean | null;
  isAnswered: boolean;
  onSelect: (val: boolean) => void;
}

export function TrueFalseViewer({
  q,
  answer,
  isAnswered,
  onSelect,
}: TrueFalseViewerProps) {
  return (
    <div className="flex gap-4">
      {[true, false].map((val) => {
        const isSelected = answer === val;
        let className = `flex-1 py-8 text-lg border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800`;

        if (isSelected) className += ' border-orange-500 bg-orange-500/10 text-orange-500';

        if (isAnswered) {
          if (val === q.correctAnswer) {
            className = 'flex-1 py-8 text-lg border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
          } else if (isSelected && val !== q.correctAnswer) {
            className = 'flex-1 py-8 text-lg border-red-500/50 bg-red-500/10 text-red-400';
          } else {
            className = 'flex-1 py-8 text-lg border-zinc-800 opacity-50';
          }
        }

        return (
          <Button
            key={String(val)}
            variant="outline"
            className={className}
            onClick={() => !isAnswered && onSelect(val)}
            disabled={isAnswered}
          >
            {val ? 'TRUE' : 'FALSE'}
          </Button>
        );
      })}
    </div>
  );
}
