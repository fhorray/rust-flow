'use client';

import { useStore } from '@nanostores/react';
import {
  Book,
  Brain,
  HistoryIcon,
  Loader2,
  LockIcon,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  $aiHistory,
  $aiResponse,
  $description,
  $descriptionQuery,
  $friendlyOutput,
  $isAiLoading,
  $isAiLocked,
  $isRunning,
  $output,
  $progress,
  $quizData,
  $quizQuery,
  $selectedExercise,
  $showFriendly,
  explainExercise,
  fetchExercises,
  fetchProgress,
  getAiHint,
  setShowFriendly,
} from '../stores/course-store';
import { Button } from '@progy/ui/button';
import { PremiumGateModal } from './modals/premium-gate-modal';
import { QuizView } from './quiz-view';
import { Label } from '@progy/ui/label';
import { ScrollArea } from '@progy/ui/scroll-area';
import { Switch } from '@progy/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@progy/ui/tabs';
import { useState } from 'react';
import { $activeContentTab, setActiveContentTab } from '@/stores/ui-store';
import { $hasUnread } from '../stores/notification-store';
import { MarkdownRenderer } from '@progy/ui';

export type ContentTab = 'description' | 'output' | 'quiz' | 'ai';

export function ContentTabs() {
  const activeTab = useStore($activeContentTab);
  const description = useStore($description);
  const descriptionQuery = useStore($descriptionQuery);
  const output = useStore($output);
  const friendlyOutput = useStore($friendlyOutput);
  const aiResponse = useStore($aiResponse);
  const isAiLoading = useStore($isAiLoading);
  const quizData = useStore($quizData);
  const quizQuery = useStore($quizQuery);
  const selectedExercise = useStore($selectedExercise);
  const showFriendly = useStore($showFriendly);
  const isRunning = useStore($isRunning);
  const isAiLocked = useStore($isAiLocked);
  const history = useStore($aiHistory);
  const progress = useStore($progress);
  const hasUnread = useStore($hasUnread);

  const handleQuizComplete = async (score: number) => {
    if (!selectedExercise) return;
    const questions = quizData?.questions.length || 1;
    const passed = score / questions >= 0.7;

    if (passed) {
      try {
        await fetch('/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'quiz',
            id: selectedExercise.id,
            success: true,
          }),
        });
        fetchProgress();
        fetchExercises();
      } catch (err) {
        console.error('Failed to update quiz progress:', err);
      }
    }
  };

  const renderRawLine = (line: string, i: number) => {
    let color = 'text-zinc-400';
    if (line.includes('error') || line.includes('failed'))
      color = 'text-red-400';
    else if (line.includes('warning')) color = 'text-amber-400';
    else if (line.includes('passed') || line.includes('ok') || line.includes('Great job'))
      color = 'text-emerald-400';
    else if (line.includes('help:') || line.includes('note:'))
      color = 'text-blue-400';

    return (
      <div key={i} className={color}>
        {line}
      </div>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveContentTab(v as ContentTab)}
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
    >
      {/* Tab Bar */}
      <div className="flex-none px-4 lg:px-6 py-0 border-b border-zinc-800/60 bg-zinc-950 flex items-center justify-between">
        <TabsList className="bg-transparent p-0 h-10 gap-0 rounded-none border-none">
          <TabsTrigger
            value="description"
            className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none"
          >
            <Book className="w-3.5 h-3.5 mr-1.5" /> Description
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none"
          >
            <Terminal className="w-3.5 h-3.5 mr-1.5" /> Output
            {isRunning && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-rust animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none relative"
          >
            <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${aiResponse ? 'text-rust' : ''}`} />
            AI Mentor
            {hasUnread && (
              <span className="absolute top-2 right-1 w-1.5 h-1.5 bg-rust rounded-full" />
            )}
          </TabsTrigger>
          {selectedExercise?.hasQuiz && (
            <TabsTrigger
              value="quiz"
              className="px-4 py-2.5 text-[11px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:text-zinc-100 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent shadow-none"
            >
              <Brain className="w-3.5 h-3.5 mr-1.5" /> Quiz
            </TabsTrigger>
          )}
        </TabsList>

        {/* Output Mode Switch */}
        {activeTab === 'output' && output && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
              <Label
                htmlFor="mode-switch-content"
                className="text-zinc-500 text-[10px] font-semibold uppercase tracking-tight cursor-pointer"
              >
                Raw
              </Label>
              <Switch
                id="mode-switch-content"
                checked={showFriendly}
                onCheckedChange={setShowFriendly}
                className="scale-75"
              />
              <Label
                htmlFor="mode-switch-content"
                className={`text-[10px] font-semibold uppercase tracking-tight cursor-pointer ${showFriendly ? 'text-rust' : 'text-zinc-500'}`}
              >
                Friendly
              </Label>
            </div>
            {isRunning && (
              <span className="text-[10px] font-bold text-rust animate-pulse flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Compiling...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description Tab */}
      <TabsContent value="description" className="flex-1 min-h-0 m-0 outline-none">
        <ScrollArea className="h-full">
          <div className="p-6 lg:p-8 w-full">
            {descriptionQuery.loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-600 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-rust" />
                <p className="text-xs font-medium">Loading instructions...</p>
              </div>
            ) : description ? (
              <MarkdownRenderer content={description} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-600 gap-3">
                <Book className="w-8 h-8 text-zinc-800" />
                <p className="text-xs font-medium">Select an exercise to view content</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Output Tab */}
      <TabsContent
        value="output"
        className="flex-1 min-h-0 m-0 outline-none bg-zinc-950"
      >
        <ScrollArea className="w-full h-full">
          <div className="p-6 lg:p-8 font-mono text-sm">
            {!output && (
              <pre className="text-zinc-600 italic text-xs">
                {'// Run tests to see output...'}
              </pre>
            )}

            {output && showFriendly && friendlyOutput ? (
              <div className="max-w-3xl">
                <MarkdownRenderer content={friendlyOutput} />
              </div>
            ) : (
              output && (
                <pre className="leading-relaxed whitespace-pre-wrap break-all text-xs">
                  {output.split('\n').map(renderRawLine)}
                </pre>
              )
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* Quiz Tab */}
      <TabsContent value="quiz" className="flex-1 min-h-0 m-0 outline-none">
        {quizQuery.loading ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-rust" />
            <span className="text-xs font-medium">Loading Quiz...</span>
          </div>
        ) : quizData ? (
          <QuizView quiz={quizData} onComplete={handleQuizComplete} />
        ) : selectedExercise?.hasQuiz ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 p-8">
            <Brain className="w-8 h-8 text-zinc-800" />
            <p className="text-xs font-medium">Could not load quiz for this exercise.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3 p-8">
            <Brain className="w-8 h-8 text-zinc-800" />
            <p className="text-xs font-medium">This exercise has no quiz.</p>
          </div>
        )}
      </TabsContent>

      {/* AI Mentor Tab */}
      <TabsContent value="ai" className="flex-1 min-h-0 m-0 outline-none">
        <ScrollArea className="h-full">
          <div className="p-6 lg:p-8 w-full">
            {/* LOCKED STATE */}
            {isAiLocked ? (
              <div className="flex flex-col items-center justify-center text-zinc-500 gap-5 py-16 text-center">
                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                  <LockIcon className="w-6 h-6 text-zinc-700" />
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-zinc-100 font-bold text-base">AI Mentor Locked</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Upgrade to Pro to get instant hints, code explanations, and personalized guidance.
                  </p>
                </div>
                <PremiumGateModal>
                  <Button className="font-bold bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 text-white h-9 px-6 text-xs">
                    Unlock AI Mentor
                  </Button>
                </PremiumGateModal>
              </div>
            ) : (
              <>
                {/* TUTOR SUGGESTION */}
                {progress?.tutorSuggestion &&
                  progress.tutorSuggestion.exerciseId === selectedExercise?.id && (
                    <div className="mb-6 p-4 bg-rust/5 border border-rust/20 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-rust font-bold uppercase tracking-wider text-[10px]">
                        <Sparkles className="w-3.5 h-3.5" /> Tutor Recommendation
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <MarkdownRenderer content={progress.tutorSuggestion.lesson} />
                      </div>
                      <p className="text-[10px] text-zinc-600">
                        Automatically generated after detecting difficulties.
                      </p>
                    </div>
                  )}

                {/* LOADING OR RESPONSE */}
                {aiResponse || isAiLoading ? (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 text-rust font-bold uppercase tracking-wider text-[10px]">
                        <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-pulse' : ''}`} />
                        AI Mentor
                      </div>
                      <div className="flex items-center gap-2">
                        {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-rust" />}
                        <button
                          onClick={() => {
                            $aiResponse.set(null);
                            $isAiLoading.set(false);
                          }}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors text-[11px] font-medium"
                        >
                          Back to History
                        </button>
                      </div>
                    </div>

                    {!aiResponse && isAiLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/30 border border-zinc-800/50 rounded-xl border-dashed">
                        <Loader2 className="w-6 h-6 animate-spin text-rust mb-3" />
                        <p className="text-xs text-zinc-500">AI Mentor is analyzing your code...</p>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-5">
                        <MarkdownRenderer content={aiResponse || ''} />
                        {isAiLoading && (
                          <div className="mt-4 flex items-center gap-2 text-zinc-500 text-[10px]">
                            <span className="flex gap-0.5">
                              <span className="w-1 h-1 bg-rust rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1 h-1 bg-rust rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1 h-1 bg-rust rounded-full animate-bounce" />
                            </span>
                            AI is writing...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* EMPTY STATE / HISTORY */
                  <div className="space-y-8">
                    <div className="text-center space-y-4 py-8">
                      <div className="w-12 h-12 bg-rust/10 rounded-xl flex items-center justify-center mx-auto border border-rust/15">
                        <Sparkles className="w-5 h-5 text-rust" />
                      </div>
                      <div>
                        <h3 className="text-zinc-100 font-bold text-sm mb-1">Ready to Help</h3>
                        <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                          Stuck? Ask for a hint or get a full explanation of the code.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={getAiHint}
                          className="bg-transparent border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 text-xs h-8"
                        >
                          <Sparkles className="w-3 h-3 mr-1.5 text-rust" /> Get Hint
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={explainExercise}
                          className="bg-transparent border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 text-xs h-8"
                        >
                          <Sparkles className="w-3 h-3 mr-1.5 text-zinc-400" /> Explain Code
                        </Button>
                      </div>
                    </div>

                    {/* HISTORY */}
                    {(() => {
                      const exerciseHistory = (Array.isArray(history) ? history : [])
                        .filter((h: any) => h.exerciseId === selectedExercise?.id)
                        .sort((a: any, b: any) => b.timestamp - a.timestamp);

                      if (exerciseHistory.length === 0) return null;

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">
                            <HistoryIcon className="w-3 h-3" /> History
                          </div>
                          <div className="space-y-1.5">
                            {exerciseHistory.map((item: any) => (
                              <button
                                key={item.id}
                                onClick={() => $aiResponse.set(item.content)}
                                className="w-full text-left p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all group"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.type === 'hint'
                                      ? 'bg-rust/10 text-rust'
                                      : 'bg-zinc-800 text-zinc-400'
                                      }`}
                                  >
                                    {item.type === 'hint' ? 'HINT' : 'EXPLANATION'}
                                  </span>
                                  <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                                  {item.content.replace(/[#*`]/g, '')}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
