import React from 'react';
import { Plus, CheckCircle2, X } from 'lucide-react';
import { Button } from '@progy/ui/button';
import { Input } from '@progy/ui/input';
import type { MultipleChoiceQuestion } from '../types';

interface MultipleChoiceEditorProps {
  q: MultipleChoiceQuestion;
  onChange: (updates: Partial<MultipleChoiceQuestion>) => void;
}

export const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({
  q,
  onChange,
}) => {
  const updateOption = (idx: number, field: string, val: any) => {
    const newOptions = [...q.options];
    if (field === 'isCorrect' && val === true) {
      newOptions.forEach((o) => (o.isCorrect = false));
    }
    newOptions[idx] = { ...newOptions[idx], [field]: val };
    onChange({ options: newOptions });
  };

  const addOption = () => {
    const nextId = String.fromCharCode(97 + q.options.length); // a, b, c...
    onChange({
      options: [...q.options, { id: nextId, text: '', isCorrect: false }],
    });
  };

  const removeOption = (idx: number) => {
    const newOpts = [...q.options];
    newOpts.splice(idx, 1);
    onChange({ options: newOpts });
  };

  return (
    <div className="space-y-3">
      {q.options.map((opt, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
        >
          <button
            onClick={() => updateOption(idx, 'isCorrect', true)}
            className={`mt-2 ${opt.isCorrect ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <CheckCircle2
              size={18}
              className={opt.isCorrect ? 'fill-emerald-500/10' : ''}
            />
          </button>
          <div className="flex-1 space-y-2">
            <Input
              value={opt.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(idx, 'text', e.target.value)}
              placeholder={`Option ${opt.id}`}
              className="bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
            />
            {opt.isCorrect && (
              <Input
                value={opt.explanation || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(idx, 'explanation', e.target.value)}
                placeholder="Why is this correct?"
                className="text-xs text-emerald-500/70 bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeOption(idx)}
            className="h-6 w-6 text-zinc-600 hover:text-red-400"
          >
            <X size={14} />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={addOption}
        className="text-xs text-zinc-500"
      >
        <Plus size={12} className="mr-2" /> Add Option
      </Button>
    </div>
  );
};
