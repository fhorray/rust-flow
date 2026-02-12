import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  updateTabContent,
  saveFile,
  loadFileTree,
} from '../../../stores/editor-store';
import { Button } from '@progy/ui/button';
import { Input } from '@progy/ui/input';
import { Textarea } from '@progy/ui/textarea';
import type { QuizData, QuizQuestion } from './types';
import { QuestionCard } from './QuestionCard';

interface QuizEditorProps {
  initialContent: string;
  path: string;
}

export function QuizEditor({ initialContent, path }: QuizEditorProps) {
  const [data, setData] = useState<QuizData>(() => {
    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed)) {
        return { title: 'Quiz', questions: parsed };
      }
      return parsed;
    } catch (e) {
      return { title: 'Untitled Quiz', questions: [] };
    }
  });

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Sync with tab changes
  useEffect(() => {
    updateTabContent(path, JSON.stringify(data, null, 2));
  }, [data, path]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFile(path);
      await loadFileTree();
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const newQuestions = [...data.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates } as QuizQuestion;
    setData({ ...data, questions: newQuestions });
  };

  const handleRemoveQuestion = (index: number) => {
    const q = data.questions[index];
    const newQuestions = data.questions.filter((_, i) => i !== index);
    setData({ ...data, questions: newQuestions });

    const newExpanded = new Set(expandedIds);
    newExpanded.delete(q.id);
    setExpandedIds(newExpanded);
  };

  const handleAddQuestion = () => {
    const newId = Math.random().toString(36).substring(7);
    const newQuestion: QuizQuestion = {
      id: newId,
      type: 'multiple-choice',
      question: '',
      options: [{ id: 'a', text: '', isCorrect: true }],
    };
    setData({ ...data, questions: [...data.questions, newQuestion] });
    setExpandedIds(new Set([...Array.from(expandedIds), newId]));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...data.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setData({ ...data, questions: newQuestions });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const expandAll = () => {
    setExpandedIds(new Set(data.questions.map((q) => q.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950/50">
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8 pb-32">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-medium">Back to Module</span>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-8 px-4"
            >
              <Save size={14} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="space-y-3 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="text-2xl font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 placeholder-zinc-700"
              placeholder="Quiz Title"
            />
            <Textarea
              value={data.description || ''}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="bg-transparent border-0 p-0 h-auto focus-visible:ring-0 text-zinc-400 min-h-[40px] resize-none placeholder-zinc-700"
              placeholder="Add a short description about this quiz..."
            />
          </div>
        </div>

        {/* Questions List Header */}
        <div className="flex items-center justify-between sticky top-0 py-4 bg-zinc-950/80 backdrop-blur-sm z-10 -mx-4 px-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Questions
            </h3>
            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {data.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <Button
                variant="ghost"
                size="icon"
                onClick={expandAll}
                className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
                title="Expand All"
              >
                <ChevronDown size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={collapseAll}
                className="h-7 w-7 text-zinc-500 hover:text-zinc-200"
                title="Collapse All"
              >
                <ChevronUp size={14} />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleAddQuestion}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 h-8 font-bold border border-zinc-700/50 px-3"
            >
              <Plus size={14} className="mr-2" /> Add Question
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {data.questions.map((q, qIndex) => (
            <QuestionCard
              key={q.id}
              q={q}
              qIndex={qIndex}
              totalQuestions={data.questions.length}
              isExpanded={expandedIds.has(q.id)}
              onToggle={() => toggleExpand(q.id)}
              onRemove={handleRemoveQuestion}
              onUpdate={handleUpdateQuestion}
              onMoveUp={() => handleMoveQuestion(qIndex, 'up')}
              onMoveDown={() => handleMoveQuestion(qIndex, 'down')}
            />
          ))}

          {data.questions.length === 0 && (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center space-y-4">
              <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Plus size={24} className="text-zinc-700" />
              </div>
              <div>
                <p className="text-zinc-400 font-medium">No questions yet</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Start by adding your first question to the quiz.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleAddQuestion}
                className="border-zinc-800 hover:bg-zinc-900"
              >
                Add First Question
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}