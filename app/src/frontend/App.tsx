import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import {
  Book,
  Play,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Loader2,
  Menu,
  Circle,
  CheckCircle,
  XCircle,
  FileCode,
  Terminal,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  RotateCcw,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './components/ui/accordion';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Card } from './components/ui/card';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { ChallengeGenerator } from './components/ChallengeGenerator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Wand2 } from 'lucide-react';

interface Exercise {
  id: string;
  module: string;
  cleanModule: string;
  name: string;
  exerciseName: string;
  path: string;
  markdownPath?: string;
}

type GroupedExercises = Record<string, Exercise[]>;
type TestStatus = 'pass' | 'fail' | 'idle';

export function App() {
  const [exerciseGroups, setExerciseGroups] = useState<GroupedExercises>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [output, setOutput] = useState<string>('');
  const [friendlyOutput, setFriendlyOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFriendly, setShowFriendly] = useState(true); // Default to friendly mode
  const [results, setResults] = useState<Record<string, TestStatus>>(() => {
    const saved = localStorage.getItem('rustflow_results');
    return saved ? JSON.parse(saved) : {};
  });
  const [showChallengeGenerator, setShowChallengeGenerator] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<{
    title: string;
    description: string;
    code: string;
    hint: string;
    filePath?: string;
    filename?: string;
    message?: string;
  } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'learning' | 'practice'>(
    'learning',
  );
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('rustflow_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => res.json())
      .then((data: any) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        if (Array.isArray(data)) {
          setError('Invalid data format');
          return;
        }
        setExerciseGroups(data);
        const modules = Object.keys(data);
        if (modules.length > 0) {
          const firstModule = modules[0] || '';
          const exercises = data[firstModule];
          if (Array.isArray(exercises) && exercises.length > 0) {
            setSelectedExercise(exercises[0]);
          }
        }
      })
      .catch((err) => setError(`Connection failed: ${String(err)}`));
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      setOutput('');
      setFriendlyOutput('');
      setAiResponse(null);
      setDescription(null);

      // Fetch description (and code if we needed it)
      fetch(
        `/api/exercises/code?path=${selectedExercise.path}&markdownPath=${selectedExercise.markdownPath || 'null'}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.markdown) setDescription(data.markdown);
        });
    }
  }, [selectedExercise]);

  const runTests = async () => {
    if (!selectedExercise) return;
    setIsRunning(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/exercises/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: selectedExercise.exerciseName }),
      });
      const data = await res.json();
      setOutput(data.output);
      setFriendlyOutput(data.friendlyOutput || '');
      const status: TestStatus = data.success ? 'pass' : 'fail';
      setResults((prev) => ({ ...prev, [selectedExercise.id]: status }));
    } catch (err) {
      setOutput('Failed to run tests.');
      setResults((prev) => ({ ...prev, [selectedExercise.id]: 'fail' }));
    } finally {
      setIsRunning(false);
    }
  };

  const getAiHint = async () => {
    if (!selectedExercise) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '', error: output }),
      });
      const data = await res.json();
      setAiResponse(data.hint);
    } catch (err) {
      setAiResponse('Failed to get AI hint.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Failed to load exercises</h1>
          <p className="text-zinc-500 font-mono">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalExercises = Object.values(exerciseGroups).reduce(
    (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
    0,
  );
  const completedCount = Object.values(results).filter(
    (s) => s === 'pass',
  ).length;
  const progressPercent =
    totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100 flex flex-col font-sans selection:bg-rust/30">
      {/* Navbar */}
      <nav className="border-b border-zinc-800/50 p-4 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rust blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-rust via-orange-500 to-rust-dark p-2.5 rounded-xl shadow-2xl">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">
                Rust
                <span className="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">
                  Flow
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium -mt-0.5">
                Learn Rust by Doing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 rounded-full px-4 py-2 border border-zinc-800/50">
              <div className="h-1.5 w-40 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rust to-orange-400 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-zinc-300 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <Badge
              variant="outline"
              className="gap-2 py-2 px-4 border-zinc-700/50 bg-zinc-900/30"
            >
              <Book className="w-3.5 h-3.5 text-rust" />
              <span className="text-zinc-400">Progress</span>
              <span className="text-white font-mono font-bold">
                {completedCount}/{totalExercises}
              </span>
            </Badge>
            <Button
              onClick={() => setShowChallengeGenerator(true)}
              className="bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 font-semibold text-xs shadow-lg shadow-rust/20"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar Desafio
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto w-full py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
          <Tabs defaultValue="learning" className="flex flex-col h-full">
            <div className="p-2 border-b border-zinc-800/50 bg-zinc-900/50">
              <TabsList className="w-full bg-zinc-800/50">
                <TabsTrigger
                  value="learning"
                  className="flex-1 gap-2 data-[state=active]:bg-zinc-700 py-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Learning Path
                </TabsTrigger>
                <TabsTrigger
                  value="practice"
                  className="flex-1 gap-2 data-[state=active]:bg-rust py-2"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Practice
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="learning"
              className="flex-1 overflow-hidden m-0"
            >
              <ScrollArea className="h-full px-2 py-2">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-1"
                >
                  {Object.keys(exerciseGroups)
                    .filter((key) => key !== 'practice')
                    .map((moduleKey) => {
                      const exercises = exerciseGroups[moduleKey];
                      if (!Array.isArray(exercises)) return null;
                      const modulePassCount = exercises.filter(
                        (ex) => results[ex.id] === 'pass',
                      ).length;
                      const isModuleComplete =
                        modulePassCount === exercises.length;

                      return (
                        <AccordionItem
                          key={moduleKey}
                          value={moduleKey}
                          className="border-none"
                        >
                          <AccordionTrigger className="hover:no-underline py-3 px-3 rounded-xl hover:bg-zinc-800/30 text-zinc-300 text-sm transition-colors [&[data-state=open]]:bg-zinc-800/50">
                            <div className="flex items-center gap-3 truncate">
                              {isModuleComplete ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-zinc-500">
                                    {modulePassCount}
                                  </span>
                                </div>
                              )}
                              <span
                                className={`font-semibold capitalize truncate ${isModuleComplete ? 'text-zinc-500' : ''}`}
                              >
                                {moduleKey
                                  .replace(/^\d+_/, '')
                                  .replace(/_/g, ' ')}
                              </span>
                            </div>
                            <Badge
                              variant={
                                isModuleComplete ? 'outline' : 'secondary'
                              }
                              className={`ml-auto mr-2 text-[10px] h-5 px-2 ${isModuleComplete ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : ''}`}
                            >
                              {modulePassCount}/{exercises.length}
                            </Badge>
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 pt-1 space-y-1">
                            {exercises.map((ex) => {
                              const status = results[ex.id];
                              const isSelected = selectedExercise?.id === ex.id;
                              return (
                                <button
                                  key={ex.id}
                                  onClick={() => setSelectedExercise(ex)}
                                  className={`w-full text-left pl-10 pr-3 py-2.5 text-xs rounded-lg transition-all flex items-center gap-2 group
                                  ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border-l-2 border-transparent'
                                  }`}
                                >
                                  <FileCode
                                    className={`w-3 h-3 ${isSelected ? 'text-rust' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                                  />
                                  <span className="truncate flex-1">
                                    {ex.exerciseName}
                                  </span>
                                  {status === 'pass' && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  )}
                                  {status === 'fail' && (
                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  )}
                                </button>
                              );
                            })}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                </Accordion>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="practice"
              className="flex-1 overflow-hidden m-0"
            >
              <ScrollArea className="h-full px-2 py-2">
                {exerciseGroups['practice'] &&
                Array.isArray(exerciseGroups['practice']) ? (
                  <div className="space-y-1">
                    {exerciseGroups['practice'].map((ex) => {
                      const status = results[ex.id];
                      const isSelected = selectedExercise?.id === ex.id;
                      return (
                        <button
                          key={ex.id}
                          onClick={() => setSelectedExercise(ex)}
                          className={`w-full text-left px-3 py-3 text-xs rounded-lg transition-all flex items-center gap-3 group
                          ${
                            isSelected
                              ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border-l-2 border-transparent'
                          }`}
                        >
                          <Wand2
                            className={`w-4 h-4 ${isSelected ? 'text-rust' : 'text-zinc-600'}`}
                          />
                          <span className="truncate flex-1">
                            {ex.exerciseName}
                          </span>
                          {status === 'pass' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {status === 'fail' && (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <Wand2 className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                    <p className="text-sm">Nenhum exercício gerado ainda</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Clique em "Gerar Desafio" para criar um!
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Main Panel */}
        <section className="lg:col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          {/* Header Card */}
          <Card className="flex-none p-5 border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-transparent backdrop-blur-sm">
            {selectedExercise ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {results[selectedExercise.id] === 'pass' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mastered
                      </Badge>
                    ) : (
                      <Badge className="bg-rust/20 text-rust border-rust/30 text-[10px]">
                        Active Challenge
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {selectedExercise?.exerciseName}
                  </h2>
                  <p className="text-zinc-500 text-xs flex items-center gap-2">
                    <span className="text-zinc-600">
                      {selectedExercise?.cleanModule.replace(/_/g, ' ')}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-400 text-[10px]">
                      {selectedExercise?.path.split('rustflow').pop()}
                    </code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="lg"
                    disabled={isRunning}
                    onClick={runTests}
                    className="font-bold shadow-xl shadow-rust/20 bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90"
                  >
                    {isRunning ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4 fill-white" />
                    )}
                    {isRunning ? 'Compiling...' : 'Run Tests'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={getAiHint}
                    disabled={isAiLoading || !output}
                    className="font-semibold bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-rust" />
                    AI Hint
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Terminal className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                <p>Select an exercise to start coding</p>
              </div>
            )}
          </Card>

          {/* Description Panel (Markdown) */}
          <Tabs
            defaultValue="description"
            className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] rounded-xl border border-zinc-800/50 overflow-hidden"
          >
            <div className="flex-none px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center justify-between">
              <TabsList className="bg-zinc-800/30 p-0.5 h-9">
                <TabsTrigger
                  value="description"
                  className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
                >
                  <Book className="w-3.5 h-3.5 mr-2" />
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="output"
                  className="px-4 py-1.5 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
                >
                  <Terminal className="w-3.5 h-3.5 mr-2" />
                  Output
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="description"
              className="flex-1 min-h-0 m-0 outline-none"
            >
              <ScrollArea className="h-full p-6">
                {description ? (
                  <div className="text-zinc-300">
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-3xl font-bold text-zinc-100 mt-0 mb-4"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-2xl font-bold text-zinc-100 mt-5 mb-3"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-xl font-bold text-zinc-100 mt-4 mb-2"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-4 leading-relaxed" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-inside mb-4 space-y-1"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4" {...props} />
                        ),
                        code: ({
                          node,
                          className,
                          children,
                          ...props
                        }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !match ? (
                            <code
                              className="bg-zinc-900/50 text-rust-light px-1.5 py-0.5 rounded text-sm font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ node, ...props }) => (
                          <pre
                            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4 overflow-x-auto"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="text-rust font-bold" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-rust hover:text-rust-light underline underline-offset-4"
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-rust pl-4 italic text-zinc-400 my-4"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {description}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-zinc-500 italic">
                    No description available.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="output"
              className="flex-1 min-h-0 m-0 outline-none flex flex-col bg-[#0a0a0a]"
            >
              <div className="px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600 font-mono">
                    Terminal Output
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {output && (
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
                  )}
                  {isRunning && (
                    <span className="text-[10px] font-bold text-rust animate-pulse flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Compiling...
                    </span>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 p-6">
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {!output && (
                    <span className="text-zinc-600 italic">
                      // Run tests to see output...
                    </span>
                  )}
                  {output &&
                    (showFriendly && friendlyOutput ? friendlyOutput : output)
                      .split('\n')
                      .map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.includes('error') ||
                            line.includes('❌') ||
                            line.includes('failed')
                              ? 'text-red-400'
                              : line.includes('warning')
                                ? 'text-amber-400'
                                : line.includes('passed') ||
                                    line.includes('ok') ||
                                    line.includes('✅') ||
                                    line.includes('Great job')
                                  ? 'text-emerald-400'
                                  : line.includes('💡') ||
                                      line.includes('🔧') ||
                                      line.includes('📍') ||
                                      line.includes('📝')
                                    ? 'text-blue-300'
                                    : line.includes('help:') ||
                                        line.includes('note:')
                                      ? 'text-blue-400'
                                      : line.includes('💪')
                                        ? 'text-amber-300'
                                        : 'text-zinc-400'
                          }
                        >
                          {line}
                        </div>
                      ))}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* AI Hint Panel */}
          {aiResponse && (
            <div className="bg-gradient-to-r from-rust/10 via-transparent to-transparent border border-rust/20 rounded-xl p-4 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-rust" />
                <span className="text-xs font-bold text-rust">AI Mentor</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Challenge Generator Modal */}
      {showChallengeGenerator && (
        <ChallengeGenerator
          onClose={() => setShowChallengeGenerator(false)}
          onChallengeGenerated={(challenge) => {
            setGeneratedChallenge(challenge);
            setShowChallengeGenerator(false);
            setSelectedExercise(null); // Clear selected exercise to show generated challenge
            setOutput('');
            setFriendlyOutput('');
          }}
        />
      )}

      {/* Generated Challenge Display */}
      {generatedChallenge && !selectedExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-6">
          <Card className="w-full max-w-4xl bg-zinc-900 border-zinc-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-2">
                  Desafio Gerado
                </Badge>
                <h2 className="text-2xl font-bold text-white">
                  {generatedChallenge.title}
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  {generatedChallenge.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGeneratedChallenge(null)}
              >
                ✕
              </Button>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4 border border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  código para corrigir
                </span>
              </div>
              <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto">
                {generatedChallenge.code}
              </pre>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3 h-3" />
                Dica
              </div>
              <p className="text-amber-200/80 text-sm">
                {generatedChallenge.hint}
              </p>
            </div>

            {generatedChallenge.message && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  ✅ Arquivo Criado
                </div>
                <p className="text-emerald-200/80 text-sm font-mono">
                  {generatedChallenge.message}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    generatedChallenge.filePath || generatedChallenge.code,
                  );
                }}
                variant="outline"
                className="flex-1"
              >
                📋 Copiar Caminho
              </Button>
              <Button
                onClick={() => setGeneratedChallenge(null)}
                className="flex-1 bg-rust hover:bg-rust/90"
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
