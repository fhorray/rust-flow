import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@progy/ui/button';
import type { MultipleChoiceQuestion } from '../types';

interface MultipleChoiceViewerProps {
  q: MultipleChoiceQuestion;
  answer: string | null;
  isAnswered: boolean;
  onSelect: (id: string) => void;
}

export function MultipleChoiceViewer({
  q,
  answer,
  isAnswered,
  onSelect,
}: MultipleChoiceViewerProps) {
  return (
    <div className="grid gap-3">
      {q.options.map((option) => {
        let className = 'justify-start text-left h-auto py-4 px-4 border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800';

        if (answer === option.id) {
          className += ' border-orange-500 text-orange-500 bg-orange-500/10';
        }

        if (isAnswered) {
          if (option.isCorrect) {
            className = 'justify-start text-left h-auto py-4 px-4 border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
          } else if (answer === option.id && !option.isCorrect) {
            className = 'justify-start text-left h-auto py-4 px-4 border-red-500/50 bg-red-500/10 text-red-400';
          } else {
            className = 'justify-start text-left h-auto py-4 px-4 border-zinc-800 opacity-50';
          }
        }

        return (
          <Button
            key={option.id}
            variant="outline"
            className={className}
            onClick={() => !isAnswered && onSelect(option.id)}
            disabled={isAnswered}
          >
            <div className="flex items-start w-full">
              <span className="flex-1">{option.text}</span>
              {isAnswered && option.isCorrect && <CheckCircle2 className="w-4 h-4 ml-2 shrink-0" />}
              {isAnswered && answer === option.id && !option.isCorrect && <XCircle className="w-4 h-4 ml-2 shrink-0" />}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
