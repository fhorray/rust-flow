import React from 'react';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  List,
  CheckSquare,
  Code,
  Link as LinkIcon,
  FileText,
  Type,
} from 'lucide-react';
import { Button } from '@progy/ui/button';
import { Textarea } from '@progy/ui/textarea';
import type { QuizQuestion, QuestionType } from './types';

// Editors
import { MultipleChoiceEditor } from './QuestionEditors/MultipleChoiceEditor';
import { TrueFalseEditor } from './QuestionEditors/TrueFalseEditor';
import { TextAnswerEditor } from './QuestionEditors/TextAnswerEditor';
import { CodingEditor } from './QuestionEditors/CodingEditor';
import { MatchingEditor } from './QuestionEditors/MatchingEditor';
import { EssayEditor } from './QuestionEditors/EssayEditor';

const getTypeIcon = (type: QuestionType) => {
  switch (type) {
    case 'multiple-choice':
      return <List size={16} />;
    case 'true-false':
      return <CheckSquare size={16} />;
    case 'coding':
      return <Code size={16} />;
    case 'matching':
      return <LinkIcon size={16} />;
    case 'essay':
      return <FileText size={16} />;
    default:
      return <Type size={16} />;
  }
};

interface QuestionCardProps {
  q: QuizQuestion;
  qIndex: number;
  totalQuestions: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updates: Partial<QuizQuestion>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  q,
  qIndex,
  totalQuestions,
  isExpanded,
  onToggle,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
}) => {
  const handleTypeChange = (newType: QuestionType) => {
    const base = { id: q.id, question: q.question, explanation: q.explanation };
    let newQuestion: QuizQuestion;

    switch (newType) {
      case 'multiple-choice':
        newQuestion = {
          ...base,
          type: 'multiple-choice',
          options: [{ id: 'a', text: '', isCorrect: true }],
        };
        break;
      case 'true-false':
        newQuestion = { ...base, type: 'true-false', correctAnswer: true };
        break;
      case 'short-answer':
      case 'fill-in-the-blank':
        newQuestion = {
          ...base,
          type: newType,
          acceptedAnswers: [],
          caseSensitive: false,
        };
        break;
      case 'coding':
        newQuestion = {
          ...base,
          type: 'coding',
          language: 'sql', // Default to SQL for the example course
          solutionCode: '',
        };
        break;
      case 'matching':
        newQuestion = { ...base, type: 'matching', pairs: [] };
        break;
      case 'essay':
        newQuestion = { ...base, type: 'essay' };
        break;
      default:
        return;
    }
    onUpdate(qIndex, newQuestion);
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'bg-zinc-900/40 border-zinc-800 shadow-lg' : 'bg-zinc-900/20 border-zinc-800/50 hover:border-zinc-700'}`}
    >
      {/* Header (Accordion Trigger) */}
      <div
        className={`flex items-center gap-3 p-3 cursor-pointer select-none group ${isExpanded ? 'border-b border-zinc-800/50 bg-zinc-900/30' : ''}`}
        onClick={onToggle}
      >
        <div
          className={`p-1 rounded-md transition-colors ${isExpanded ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/30">
            Q{qIndex + 1}
          </span>
          <span
            className={`text-sm font-medium truncate ${!q.question ? 'text-zinc-500 italic' : 'text-zinc-200'}`}
          >
            {q.question || 'New Question'}
          </span>
        </div>

        {/* Header Actions */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Type Selector */}
          <div className="relative group mr-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-zinc-500">
              {getTypeIcon(q.type)}
            </div>
            <select
              value={q.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="h-8 pl-8 pr-3 text-xs font-medium bg-zinc-950 border border-zinc-800 rounded-md text-zinc-300 focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 appearance-none cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="short-answer">Short Answer</option>
              <option value="fill-in-the-blank">Fill in Blank</option>
              <option value="coding">Coding</option>
              <option value="matching">Matching</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-1"></div>

          {/* Reorder Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveUp(qIndex)}
            disabled={qIndex === 0}
            className="h-7 w-7 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
            title="Move Up"
          >
            <ChevronUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveDown(qIndex)}
            disabled={qIndex === totalQuestions - 1}
            className="h-7 w-7 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
            title="Move Down"
          >
            <ChevronDown size={14} />
          </Button>

          <div className="h-4 w-px bg-zinc-800 mx-1"></div>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(qIndex)}
            className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
            title="Delete Question"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <Textarea
            value={q.question}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(qIndex, { question: e.target.value })}
            placeholder="Enter your question here..."
            className="bg-zinc-950/50 border-zinc-800 text-base font-medium min-h-[60px] resize-none focus:border-orange-500/50 placeholder-zinc-700 text-zinc-200"
          />

          {/* Dynamic Editor based on Type */}
          <div className="pl-4 border-l-2 border-zinc-800 ml-1 py-1">
            {q.type === 'multiple-choice' && (
              <MultipleChoiceEditor
                q={q as any}
                onChange={(u) => onUpdate(qIndex, u)}
              />
            )}
            {q.type === 'true-false' && (
              <TrueFalseEditor
                q={q as any}
                onChange={(u) => onUpdate(qIndex, u)}
              />
            )}
            {(q.type === 'short-answer' || q.type === 'fill-in-the-blank') && (
              <TextAnswerEditor
                q={q as any}
                onChange={(u) => onUpdate(qIndex, u)}
              />
            )}
            {q.type === 'coding' && (
              <CodingEditor
                q={q as any}
                onChange={(u) => onUpdate(qIndex, u)}
              />
            )}
            {q.type === 'matching' && (
              <MatchingEditor
                q={q as any}
                onChange={(u) => onUpdate(qIndex, u)}
              />
            )}
            {q.type === 'essay' && (
              <EssayEditor
                q={q as any}
                onChange={(u) => onUpdate(qIndex, u)}
              />
            )}
          </div>

          {/* Explanation Footer */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase">
                General Explanation
              </span>
            </div>
            <Textarea
              value={q.explanation || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(qIndex, { explanation: e.target.value })}
              placeholder="Explain the answer to the student (shown after submission)..."
              className="text-xs bg-zinc-900/30 border-zinc-800/50 min-h-[40px] text-zinc-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
