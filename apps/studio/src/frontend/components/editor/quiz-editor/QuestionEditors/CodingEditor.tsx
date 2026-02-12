import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@progy/ui/button';
import { Input } from '@progy/ui/input';
import { Textarea } from '@progy/ui/textarea';
import type { CodingQuestion } from '../types';

interface CodingEditorProps {
  q: CodingQuestion;
  onChange: (updates: Partial<CodingQuestion>) => void;
}

export const CodingEditor: React.FC<CodingEditorProps> = ({ q, onChange }) => {
  const updateTestCase = (idx: number, field: string, val: string) => {
    const cases = [...(q.testCases || [])];
    cases[idx] = { ...cases[idx], [field]: val };
    onChange({ testCases: cases });
  };

  const addTestCase = () => {
    onChange({
      testCases: [...(q.testCases || []), { input: '', expectedOutput: '' }],
    });
  };

  const removeTestCase = (idx: number) => {
    const cases = [...(q.testCases || [])];
    cases.splice(idx, 1);
    onChange({ testCases: cases });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">
            Language
          </label>
          <Input
            value={q.language}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ language: e.target.value })}
            placeholder="javascript, python, rust..."
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">
          Starter Code (Optional)
        </label>
        <Textarea
          value={q.startingCode || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ startingCode: e.target.value })}
          className="font-mono text-xs bg-zinc-900 border-zinc-800 min-h-[80px]"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">
          Solution Code
        </label>
        <Textarea
          value={q.solutionCode}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ solutionCode: e.target.value })}
          className="font-mono text-xs bg-zinc-900 border-zinc-800 min-h-[80px]"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">
          Test Cases
        </label>
        {(q.testCases || []).map((tc, idx) => (
          <div
            key={idx}
            className="grid grid-cols-2 gap-2 p-2 bg-zinc-900/50 rounded border border-zinc-800 relative group"
          >
            <Input
              value={tc.input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTestCase(idx, 'input', e.target.value)}
              placeholder="Input (e.g. args)"
              className="text-xs bg-zinc-950 border-zinc-800"
            />
            <Input
              value={tc.expectedOutput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTestCase(idx, 'expectedOutput', e.target.value)}
              placeholder="Expected Output"
              className="text-xs bg-zinc-950 border-zinc-800"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-5 w-5 bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100"
              onClick={() => removeTestCase(idx)}
            >
              <X size={10} />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addTestCase}
          className="text-xs border-dashed border-zinc-700 w-full"
        >
          Add Test Case
        </Button>
      </div>
    </div>
  );
};
