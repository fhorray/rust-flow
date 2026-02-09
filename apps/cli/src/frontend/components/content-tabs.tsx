import { useStore } from '@nanostores/react';
import { Book, Brain, HistoryIcon, Loader2, LockIcon, Sparkles, Terminal } from 'lucide-react';
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
  $quizData,
  $quizQuery,
  $selectedExercise,
  $showFriendly,
  explainExercise,
  fetchProgress,
  getAiHint,
  setShowFriendly,
} from '../stores/course-store';
import { Button } from './ui/button';
import { PremiumGateModal } from './modals/premium-gate-modal';
import { MarkdownRenderer } from './markdown-renderer';
import { QuizView } from './quiz-view';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import { $activeContentTab, setActiveContentTab } from '@/stores/ui-store';

// TYPES
export type ContentTab = 'description' | 'output' | 'quiz' | 'ai';

export function ContentTabs() {

  // Stores
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
  const history = useStore($aiHistory)

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
      } catch (err) {
        console.error('Failed to update quiz progress:', err);
      }
    }
  };

  const renderRawLine = (line: string, i: number) => {
    let color = 'text-zinc-400';
    if (
      line.includes('error') ||
      line.includes('❌') ||
      line.includes('failed')
    )
      color = 'text-red-400';
    else if (line.includes('warning')) color = 'text-amber-400';
    else if (
      line.includes('passed') ||
      line.includes('ok') ||
      line.includes('✅') ||
      line.includes('Great job')
    )
      color = 'text-emerald-400';
    else if (
      line.includes('💡') ||
      line.includes('🔧') ||
      line.includes('📍') ||
      line.includes('📝')
    )
      color = 'text-blue-300';
    else if (line.includes('help:') || line.includes('note:'))
      color = 'text-blue-400';
    else if (line.includes('💪')) color = 'text-amber-300';

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
      className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] rounded-xl border border-zinc-800/50 overflow-hidden"
    >
      <div className="flex-none px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center justify-between">
        <TabsList className="bg-zinc-800/30 p-0.5 h-9">
          {/* Description Tab */}
          <TabsTrigger
            value="description"
            className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Book className="w-3.5 h-3.5 mr-2" /> Description
          </TabsTrigger>

          {/* Output Tab */}
          <TabsTrigger
            value="output"
            className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Terminal className="w-3.5 h-3.5 mr-2" /> Output
          </TabsTrigger>

          {/* AI Mentor Tab */}
          <TabsTrigger
            value="ai"
            className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Sparkles className={`w-3.5 h-3.5 mr-2 ${aiResponse ? 'text-rust' : ''}`} /> AI Mentor
          </TabsTrigger>

          {/* Quiz Tab */}
          {selectedExercise?.hasQuiz && (
            <TabsTrigger
              value="quiz"
              className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
            >
              <Brain className="w-3.5 h-3.5 mr-2" /> Quiz
            </TabsTrigger>
          )}
        </TabsList>

        {/* Output Mode Switch */}
        {activeTab === 'output' && output && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
              <Label
                htmlFor="mode-switch-content"
                className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight"
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
                className={`text-[10px] font-bold uppercase tracking-tight ${showFriendly ? 'text-rust' : 'text-zinc-500'}`}
              >
                Friendly
              </Label>
            </div>
            {isRunning && (
              <span className="text-[10px] font-bold text-rust animate-pulse flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Compiling...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description Tab */}
      <TabsContent
        value="description"
        className="flex-1 min-h-0 m-0 outline-none"
      >
        <ScrollArea className="h-full p-6">
          {descriptionQuery.loading ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 text-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-rust" />
              <p className="text-sm">Carregando instruções...</p>
            </div>
          ) : description ? (
            <MarkdownRenderer content={description} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 text-center min-h-[300px]">
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center animate-pulse">
                <Book className="w-6 h-6" />
              </div>
              <p className="text-sm">
                Selecione um exercício para ver o conteúdo
              </p>
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      {/* Output Tab */}
      <TabsContent
        value="output"
        className="flex-1 min-h-0 m-0 outline-none bg-zinc-950 font-mono text-sm"
      >
        <ScrollArea className="w-full h-full p-6">
          {!output && (
            <pre className="font-mono text-sm leading-relaxed text-zinc-600 italic">
              // Run tests to see output...
            </pre>
          )}

          {output && showFriendly && friendlyOutput ? (
            <MarkdownRenderer content={friendlyOutput} />
          ) : (
            output && (
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
                {output.split('\n').map(renderRawLine)}
              </pre>
            )
          )}
        </ScrollArea>
      </TabsContent>

      {/* Quiz Tab */}
      <TabsContent
        value="quiz"
        className="flex-1 min-h-0 m-0 outline-none bg-[#0a0a0a]"
      >
        {quizQuery.loading ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-rust" />
            <span className="text-sm">Carregando Quiz...</span>
          </div>
        ) : quizData ? (
          <QuizView quiz={quizData} onComplete={handleQuizComplete} />
        ) : selectedExercise?.hasQuiz ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4 flex-1">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-zinc-700" />
            </div>
            <p className="text-sm">
              Não foi possível carregar o quiz para este exercício.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 text-center py-12">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-zinc-800" />
            </div>
            <p className="text-sm">Este exercício não possui quiz.</p>
          </div>
        )}
      </TabsContent>

      {/* AI Mentor Tab */}
      <TabsContent
        value="ai"
        className="flex-1 min-h-0 m-0 outline-none"
      >
        <ScrollArea className="h-full p-6">
          {/* LOCKED STATE */}
          {isAiLocked ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-6 py-12 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner">
                  <LockIcon className="w-6 h-6 text-zinc-700" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-zinc-100 font-bold">AI Mentor Locked</h3>
                <p className="text-xs text-zinc-500">
                  Upgrade to Pro to get instant hints, code explanations, and personalized guidance.
                </p>
              </div>
              <PremiumGateModal>
                <Button className="font-bold bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 text-white">
                  Unlock AI Mentor
                </Button>
              </PremiumGateModal>
            </div>
          ) : (
            <>
              {/* LOADING OR RESPONSE */}
              {(aiResponse || isAiLoading) ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-rust font-black uppercase tracking-widest text-[10px]">
                      <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-pulse' : ''}`} /> AI Mentor
                    </div>
                    <div className="flex items-center gap-2">
                      {isAiLoading && <Loader2 className="w-3 h-3 animate-spin text-rust" />}
                      <button
                        onClick={() => {
                          $aiResponse.set(null);
                          $isAiLoading.set(false);
                        }}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
                      >
                        Back to History
                      </button>
                    </div>
                  </div>

                  {!aiResponse && isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl border-dashed">
                      <Loader2 className="w-8 h-8 animate-spin text-rust mb-4" />
                      <p className="text-sm text-zinc-500 italic">O Mentor IA está analisando seu código...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 shadow-2xl">
                      <MarkdownRenderer content={aiResponse || ''} />
                      {isAiLoading && (
                        <div className="mt-4 flex items-center gap-2 text-zinc-500 italic text-[10px]">
                          <span className="flex gap-1">
                            <span className="w-1 h-1 bg-rust rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-rust rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-rust rounded-full animate-bounce"></span>
                          </span>
                          IA está escrevendo...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* EMPTY STATE / HISTORY */
                <div className="space-y-8">
                  <div className="text-center space-y-4 py-8">
                    <div className="w-12 h-12 bg-rust/10 rounded-full flex items-center justify-center mx-auto border border-rust/20">
                      <Sparkles className="w-6 h-6 text-rust" />
                    </div>
                    <div>
                      <h3 className="text-zinc-100 font-bold mb-1">Ready to Help!</h3>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Stuck? Ask for a hint or get a full explanation of the code.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={getAiHint}
                        className="bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-rust" /> get Hint
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={explainExercise}
                        className="bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-2 text-purple-400" /> Explain Code
                      </Button>
                    </div>
                  </div>

                  {/* HISTORY */}
                  {(() => {
                    history || [];
                    const exerciseHistory = history
                      .filter((h: any) => h.exerciseId === selectedExercise?.id)
                      .sort((a: any, b: any) => b.timestamp - a.timestamp);

                    if (exerciseHistory.length === 0) return null;

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                          <HistoryIcon className="w-3 h-3" /> History
                        </div>
                        <div className="space-y-2">
                          {exerciseHistory.map((item: any) => (
                            <button
                              key={item.id}
                              onClick={() => $aiResponse.set(item.content)}
                              className="w-full text-left p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700/50 transition-all group"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.type === 'hint'
                                  ? 'bg-rust/10 text-rust border-rust/20'
                                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  }`}>
                                  {item.type === 'hint' ? 'HINT' : 'EXPLANATION'}
                                </span>
                                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                                  {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2 pl-1 border-l-2 border-zinc-800 group-hover:border-zinc-600">
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
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
