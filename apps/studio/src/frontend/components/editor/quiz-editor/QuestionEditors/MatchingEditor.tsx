import React from 'react';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@progy/ui/button';
import { Input } from '@progy/ui/input';
import type { MatchingQuestion } from '../types';

interface MatchingEditorProps {
  q: MatchingQuestion;
  onChange: (updates: Partial<MatchingQuestion>) => void;
}

export const MatchingEditor: React.FC<MatchingEditorProps> = ({ q, onChange }) => {
  const updatePair = (idx: number, field: 'left' | 'right', val: string) => {
    const newPairs = [...q.pairs];
    newPairs[idx] = { ...newPairs[idx], [field]: val };
    onChange({ pairs: newPairs });
  };

  const addPair = () => {
    onChange({ pairs: [...q.pairs, { left: '', right: '' }] });
  };

  const removePair = (idx: number) => {
    const newPairs = [...q.pairs];
    newPairs.splice(idx, 1);
    onChange({ pairs: newPairs });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">
          Left Side
        </label>
        <label className="text-[10px] font-bold text-zinc-500 uppercase">
          Right Side
        </label>
      </div>
      {q.pairs.map((pair, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <Input
            value={pair.left}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePair(idx, 'left', e.target.value)}
            className="bg-zinc-900 border-zinc-800"
            placeholder="Term"
          />
          <LinkIcon size={12} className="text-zinc-600 shrink-0" />
          <Input
            value={pair.right}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePair(idx, 'right', e.target.value)}
            className="bg-zinc-900 border-zinc-800"
            placeholder="Definition"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removePair(idx)}
            className="text-zinc-600 hover:text-red-400"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addPair}
        className="text-xs border-dashed border-zinc-700"
      >
        Add Pair
      </Button>
    </div>
  );
};
