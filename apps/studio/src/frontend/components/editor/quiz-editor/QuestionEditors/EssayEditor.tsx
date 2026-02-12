import React from 'react';
import { Settings2 } from 'lucide-react';
import { Input } from '@progy/ui/input';
import type { EssayQuestion } from '../types';

interface EssayEditorProps {
  q: EssayQuestion;
  onChange: (updates: Partial<EssayQuestion>) => void;
}

export const EssayEditor: React.FC<EssayEditorProps> = ({ q, onChange }) => {
  return (
    <div className="text-xs text-zinc-500 italic flex items-center gap-2">
      <Settings2 size={12} /> Configure rubric or word counts if needed
      <Input
        type="number"
        placeholder="Min words"
        className="w-24 bg-zinc-900 border-zinc-800 h-7 text-xs"
        value={q.minWords || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ minWords: parseInt(e.target.value) || 0 })}
      />
    </div>
  );
};
