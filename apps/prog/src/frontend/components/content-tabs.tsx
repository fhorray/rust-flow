import React from 'react';
import { useStore } from '@nanostores/react';
import { Book, Terminal, Brain, Loader2, Wand2, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { MarkdownRenderer } from './markdown-renderer';
import { QuizView } from './quiz-view';
import { $activeContentTab, setActiveContentTab } from '../stores/ui-store';
import {
  $description,
  $descriptionQuery,
  $output,
  $friendlyOutput,
  $isAiLoading,
  $aiResponse,
  $quizData,
  $quizQuery,
  $selectedExercise,
  $showFriendly,
  $isRunning,
  fetchProgress,
  setShowFriendly,
} from '../stores/course-store';

export function ContentTabs() {
  const activeTab = useStore($activeContentTab);
  const description = useStore($description);
  const descriptionQuery = useStore($descriptionQuery);
  const output = useStore($output);
  const friendlyOutput = useStore($friendlyOutput);
  const aiResponse = useStore($aiResponse);
  const quizData = useStore($quizData);
  const quizQuery = useStore($quizQuery);
  const selectedExercise = useStore($selectedExercise);
  const showFriendly = useStore($showFriendly);
  const isRunning = useStore($isRunning);

  const handleQuizComplete = async (score: number) => {
    if (!selectedExercise) return;
    const questions = quizData?.questions.length || 1;
    const passed = score / questions >= 0.7;

    if (passed) {
      try {
        await fetch('/api/progress/update', {
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
      onValueChange={(v) => setActiveContentTab(v as any)}
      className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] rounded-xl border border-zinc-800/50 overflow-hidden"
    >
      <div className="flex-none px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center justify-between">
        <TabsList className="bg-zinc-800/30 p-0.5 h-9">
          <TabsTrigger
            value="description"
            className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Book className="w-3.5 h-3.5 mr-2" /> Description
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Terminal className="w-3.5 h-3.5 mr-2" /> Output
          </TabsTrigger>
          {selectedExercise?.hasQuiz && (
            <TabsTrigger
              value="quiz"
              className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
            >
              <Brain className="w-3.5 h-3.5 mr-2" /> Quiz
            </TabsTrigger>
          )}
        </TabsList>

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

      <TabsContent
        value="output"
        className="flex-1 min-h-0 m-0 outline-none bg-zinc-950 font-mono text-sm"
      >
        <ScrollArea className="h-full p-6">
          {!output && (
            <pre className="font-mono text-sm leading-relaxed text-zinc-600 italic">
              // Run tests to see output...
            </pre>
          )}

          {output && showFriendly && friendlyOutput ? (
            <MarkdownRenderer content={friendlyOutput} />
          ) : (
            output && (
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {output.split('\n').map(renderRawLine)}
              </pre>
            )
          )}

          {aiResponse && (
            <div className="mt-8 pt-8 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-rust font-black uppercase tracking-widest text-[10px] mb-4">
                <Sparkles className="w-3 h-3" /> AI Mentor
              </div>
              <div className="bg-zinc-900/50 border border-rust/20 rounded-xl p-5 text-zinc-300 leading-relaxed italic whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          )}
        </ScrollArea>
      </TabsContent>

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
    </Tabs>
  );
}
