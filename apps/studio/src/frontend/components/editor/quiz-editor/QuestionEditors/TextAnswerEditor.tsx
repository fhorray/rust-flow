import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@progy/ui/button';
import { Input } from '@progy/ui/input';
import type { TextAnswerQuestion } from '../types';

interface TextAnswerEditorProps {
  q: TextAnswerQuestion;
  onChange: (updates: Partial<TextAnswerQuestion>) => void;
}

export const TextAnswerEditor: React.FC<TextAnswerEditorProps> = ({
  q,
  onChange,
}) => {
  const updateAnswer = (idx: number, val: string) => {
    const newAns = [...q.acceptedAnswers];
    newAns[idx] = val;
    onChange({ acceptedAnswers: newAns });
  };

  const addAnswer = () => {
    onChange({ acceptedAnswers: [...q.acceptedAnswers, ''] });
  };

  const removeAnswer = (idx: number) => {
    const newAns = [...q.acceptedAnswers];
    newAns.splice(idx, 1);
    onChange({ acceptedAnswers: newAns });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={q.caseSensitive}
          onChange={(e) => onChange({ caseSensitive: e.target.checked })}
          className="rounded border-zinc-700 bg-zinc-900"
        />
        <span className="text-xs text-zinc-400">Case Sensitive</span>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">
          Accepted Answers
        </label>
        {q.acceptedAnswers.map((ans, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={ans}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer(idx, e.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeAnswer(idx)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addAnswer}
          className="text-xs border-dashed border-zinc-700"
        >
          Add Answer
        </Button>
      </div>
    </div>
  );
};
