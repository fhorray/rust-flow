import React from 'react';
import { Button } from '@progy/ui/button';
import type { TrueFalseQuestion } from '../types';

interface TrueFalseEditorProps {
  q: TrueFalseQuestion;
  onChange: (updates: Partial<TrueFalseQuestion>) => void;
}

export const TrueFalseEditor: React.FC<TrueFalseEditorProps> = ({
  q,
  onChange,
}) => {
  return (
    <div className="flex gap-4">
      <Button
        variant={q.correctAnswer ? 'default' : 'outline'}
        onClick={() => onChange({ correctAnswer: true })}
        className={`w-1/2 ${q.correctAnswer ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-800'}`}
      >
        True
      </Button>
      <Button
        variant={!q.correctAnswer ? 'default' : 'outline'}
        onClick={() => onChange({ correctAnswer: false })}
        className={`w-1/2 ${!q.correctAnswer ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}`}
      >
        False
      </Button>
    </div>
  );
};
