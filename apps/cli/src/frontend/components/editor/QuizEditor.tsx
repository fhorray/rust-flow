import React, { useState, useEffect } from 'react';
import {
  Trash2, Plus, GripVertical, CheckCircle2,
  HelpCircle, AlertCircle, BrainCircuit, Save, X
} from 'lucide-react';
import { updateTabContent } from '../../stores/editor-store';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: QuizOption[];
}

interface QuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

interface QuizEditorProps {
  initialContent: string;
  path: string;
}

export function QuizEditor({ initialContent, path }: QuizEditorProps) {
  const [data, setData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialContent.trim()) {
      setData({ title: 'New Quiz', questions: [] });
      return;
    }
    try {
      const parsed = JSON.parse(initialContent);
      if (!parsed.questions) parsed.questions = [];
      setData(parsed);
      setError(null);
    } catch (e) {
      console.error('[QuizEditor] Failed to parse quiz JSON:', e);
      setError('Invalid JSON format. Please fix the file manually or reset it.');
    }
  }, [initialContent]);

  const updateStore = (newData: QuizData) => {
    setData(newData);
    updateTabContent(path, JSON.stringify(newData, null, 2));
  };

  const handleTitleChange = (title: string) => {
    if (!data) return;
    updateStore({ ...data, title });
  };

  const handleDescriptionChange = (description: string) => {
    if (!data) return;
    updateStore({ ...data, description });
  };

  const handleAddQuestion = () => {
    if (!data) return;
    const newQuestion: QuizQuestion = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'multiple-choice',
      question: '',
      options: [
        { id: 'a', text: '', isCorrect: true },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
      ],
    };
    updateStore({ ...data, questions: [...data.questions, newQuestion] });
  };

  const handleRemoveQuestion = (index: number) => {
    if (!data) return;
    const questions = [...data.questions];
    questions.splice(index, 1);
    updateStore({ ...data, questions });
  };

  const handleQuestionChange = (index: number, question: string) => {
    if (!data) return;
    const questions = [...data.questions];
    questions[index] = { ...questions[index], question };
    updateStore({ ...data, questions });
  };

  const handleAddOption = (qIndex: number) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex];
    const nextId = String.fromCharCode(97 + question.options.length); // a, b, c...
    const newOption: QuizOption = { id: nextId, text: '', isCorrect: false };
    question.options = [...question.options, newOption];
    updateStore({ ...data, questions });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex];
    question.options.splice(oIndex, 1);
    updateStore({ ...data, questions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, field: keyof QuizOption, value: any) => {
    if (!data) return;
    const questions = [...data.questions];
    const question = questions[qIndex];
    const options = [...question.options];

    if (field === 'isCorrect' && value === true) {
      options.forEach(o => o.isCorrect = false);
    }

    options[oIndex] = { ...options[oIndex], [field]: value };
    question.options = options;
    updateStore({ ...data, questions });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-red-400 font-medium">{error}</div>
        <Button
          variant="outline"
          onClick={() => updateStore({ title: 'New Quiz', questions: [] })}
          className="border-red-500/30 hover:bg-red-500/10 text-red-400"
        >
          Reset File
        </Button>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-zinc-500">Loading...</div>;

  return (
    <div className="h-full overflow-y-auto bg-zinc-950/50">
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8 pb-32">

        {/* Header Section */}
        <div className="space-y-6 border-b border-zinc-800/50 pb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-xl shrink-0">
              <BrainCircuit className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Quiz Title</label>
                <Input
                  value={data.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Rust Ownership Basics"
                  className="text-2xl font-black bg-transparent border-0 border-b border-zinc-800 rounded-none px-0 h-auto focus-visible:ring-0 focus-visible:border-orange-500 placeholder-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Description</label>
                <Textarea
                  value={data.description || ''}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Describe what this quiz covers..."
                  className="bg-zinc-900/30 border-zinc-800 resize-none h-20 text-sm focus:border-orange-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-10 py-4 border-b border-zinc-900 mb-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              {data.questions.length} Questions
            </h2>
            <Button onClick={handleAddQuestion} size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-medium shadow-lg shadow-orange-900/20">
              <Plus size={14} className="mr-2" /> Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {data.questions.map((q, qIndex) => (
              <div
                key={q.id}
                className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-all hover:border-zinc-700"
              >
                <div className="flex items-start">
                  <div className="p-4 pt-5 text-zinc-600 cursor-grab active:cursor-grabbing hover:text-zinc-400 border-r border-zinc-800/50 bg-zinc-900/30">
                    <GripVertical size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question Header & Input */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Question {qIndex + 1}</label>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-zinc-600 hover:text-red-400 h-6 w-6 -mr-2"
                          >
                            <Trash2 size={14} />
                          </Button>
                      </div>
                      <Textarea
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        placeholder="Enter your question here..."
                        className="bg-zinc-950/50 border-zinc-800 text-base font-medium min-h-[60px] resize-none focus:border-orange-500/50 placeholder-zinc-700 text-zinc-200"
                      />
                    </div>

                    {/* Options */}
                    <div className="px-5 pb-6 space-y-4 border-t border-zinc-800/50 pt-4 bg-zinc-950/20">
                      <div className="flex items-center justify-between">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Answer Options</label>
                         <span className="text-[10px] text-zinc-600 italic">Select correct answer</span>
                      </div>

                      <div className="space-y-3">
                        {q.options.map((option, oIndex) => (
                          <div
                            key={option.id}
                            className={`group flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              option.isCorrect
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <button
                              onClick={() => handleOptionChange(qIndex, oIndex, 'isCorrect', true)}
                              className={`mt-1.5 shrink-0 transition-colors ${
                                option.isCorrect ? 'text-emerald-500' : 'text-zinc-700 hover:text-emerald-500/50'
                              }`}
                              title="Mark as correct answer"
                            >
                              <CheckCircle2 size={18} className={option.isCorrect ? "fill-emerald-500/20" : ""} />
                            </button>

                            <div className="flex-1 space-y-2">
                              <Input
                                value={option.text}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                placeholder={`Option ${option.id.toUpperCase()}`}
                                className="bg-transparent border-0 p-0 h-auto text-sm focus-visible:ring-0 placeholder-zinc-600"
                              />

                              {option.isCorrect && (
                                <div className="flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200 pt-1 border-t border-emerald-500/10 mt-1">
                                  <HelpCircle size={12} className="text-emerald-500/50 mt-1 shrink-0" />
                                  <Textarea
                                    value={option.explanation || ''}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, 'explanation', e.target.value)}
                                    placeholder="Explanation (optional)..."
                                    className="text-xs bg-transparent border-0 p-0 h-auto min-h-[20px] resize-none focus-visible:ring-0 text-emerald-400/70 placeholder-emerald-500/30 leading-normal"
                                  />
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                              disabled={q.options.length <= 2}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleAddOption(qIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-zinc-500 hover:text-zinc-300 pl-0 hover:bg-transparent"
                      >
                        <Plus size={12} className="mr-1.5" /> Add Option
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.questions.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
              <BrainCircuit className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No questions yet</p>
              <p className="text-sm text-zinc-600 mb-6">Create questions to test student knowledge</p>
              <Button onClick={handleAddQuestion} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:text-white">
                Create First Question
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
