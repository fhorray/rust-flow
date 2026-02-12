import { OpenInIdeButton } from '@/components/open-in-ide-button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@progy/ui/accordion';
import { Badge } from '@progy/ui/badge';
import { Button } from '@progy/ui/button';
import { Card, CardContent } from '@progy/ui/card';
import { ScrollArea } from '@progy/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@progy/ui/tabs';
import { $router } from '@/stores/router';
import { useStore } from '@nanostores/react';
import {
  TerminalIcon,
  Wand2Icon,
  XCircleIcon,
  BookOpenIcon,
  LockIcon,
  CheckCircleIcon,
  CheckCircle2Icon,
  FileCodeIcon,
  Loader2Icon,
  PlayIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ContentTabs } from '../components/content-tabs';
import { PremiumGateModal } from '../components/modals/premium-gate-modal';
import {
  $exerciseGroups,
  $exerciseGroupsQuery,
  $expandedModule,
  $isAiLoading,
  $isAiLocked,
  $isRunning,
  $output,
  $progress,
  $progressPercent,
  $completedCount,
  $totalExercises,
  $results,
  $selectedExercise,
  explainExercise,
  getAiHint,
  runTests,
  setSelectedExercise,
} from '../stores/course-store';
import { ChallengeGenerator } from '../components/modals/challenge-generator-modal';
import { SoundManager } from '../components/sound-manager';

// TYPES
export type SidebarTab = 'learning' | 'practice';

export function EditorView() {
  const isRunning = useStore($isRunning);
  const isAiLoading = useStore($isAiLoading);
  const output = useStore($output);
  const exerciseGroups = useStore($exerciseGroups);
  const selectedExercise = useStore($selectedExercise);
  const results = useStore($results);
  const isAiLocked = useStore($isAiLocked);
  const progress = useStore($progress);
  const progressPercent = useStore($progressPercent);
  const completedCount = useStore($completedCount);
  const totalExercises = useStore($totalExercises);
  const expandedModule = useStore($expandedModule);

  // Local States
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('learning');

  // Helper para pegar o status do exercício selecionado fora do loop
  const currentStatus = selectedExercise ? results[selectedExercise.id] : null;

  return (
    <div className="container mx-auto gap-6 flex flex-1 py-6 min-h-full">
      <SoundManager />

      {/* SIDEBAR */}
      <aside className="w-full max-w-[22vw] h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm shadow-xl">
        {/* Sidebar Header: Stats & Actions */}
        <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/50 space-y-4">
          {progress && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Level {Math.floor(progress.stats.totalXp / 100) + 1}
                </span>
                <span className="text-sm font-black text-zinc-100 tabular-nums">
                  {progress.stats.totalXp} XP
                </span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 relative">
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 40 40"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      18 *
                      (1 - (progress.stats.totalXp % 100) / 100)
                    }
                    className="text-rust"
                  />
                </svg>
                <span className="text-[10px] font-black text-zinc-100">
                  {Math.floor(progress.stats.totalXp / 100) + 1}
                </span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
              <span>Progress</span>
              <span className="text-zinc-300">
                {completedCount}/{totalExercises}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rust to-orange-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <Tabs
          value={sidebarTab}
          onValueChange={(v) => setSidebarTab(v as SidebarTab)}
          className="flex flex-col h-full"
        >
          <div className="p-2 border-b border-zinc-800/50 bg-zinc-900/50">
            <TabsList className="w-full bg-zinc-800/50">
              <TabsTrigger
                value="learning"
                className="flex-1 gap-2 data-[state=active]:bg-zinc-700 py-2"
              >
                <BookOpenIcon className="w-3.5 h-3.5" />
                Learning Path
              </TabsTrigger>
              <TabsTrigger
                value="practice"
                className="flex-1 gap-2 data-[state=active]:bg-rust py-2"
              >
                <Wand2Icon className="w-3.5 h-3.5" />
                Practice
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="learning"
            className="flex-1 overflow-hidden m-0 text-zinc-100"
          >
            <ScrollArea className="h-full px-2 py-2">
              {Object.keys(exerciseGroups).length === 0 ? (
                <div className="space-y-4 p-2">
                  <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
                  <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
                  <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse" />
                </div>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-1"
                  value={expandedModule}
                  onValueChange={(v) => $expandedModule.set(v)}
                >
                  {Object.keys(exerciseGroups)
                    .filter((key) => key !== 'practice')
                    .map((moduleKey) => {
                      const exercises = Array.isArray(exerciseGroups[moduleKey])
                        ? exerciseGroups[moduleKey]
                        : [];
                      const modulePassCount = exercises.filter(
                        (ex) => results[ex.id] === 'pass',
                      ).length;
                      const isModuleComplete =
                        modulePassCount === exercises.length &&
                        exercises.length > 0;
                      const isModuleLocked =
                        exercises.length > 0 &&
                        exercises.every((ex) => ex.isLocked);

                      return (
                        <AccordionItem
                          key={moduleKey}
                          value={moduleKey}
                          className="border-none"
                        >
                          <AccordionTrigger className="hover:no-underline py-3 px-3 rounded-xl hover:bg-zinc-800/30 text-zinc-300 text-sm transition-colors [&[data-state=open]]:bg-zinc-800/50">
                            <div className="flex items-center gap-3 truncate">
                              {isModuleLocked ? (
                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                  <LockIcon className="w-3 h-3 text-zinc-600" />
                                </div>
                              ) : isModuleComplete ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                  <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-zinc-500">
                                    {modulePassCount}
                                  </span>
                                </div>
                              )}
                              <span
                                className={`font-semibold truncate ${isModuleComplete ? 'text-zinc-500' : ''}`}
                              >
                                {exercises[0]?.moduleTitle ||
                                  moduleKey
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
                              const locked = ex.isLocked;
                              return (
                                <button
                                  key={ex.id}
                                  onClick={() => {
                                    if (locked) return;
                                    $router.open(`/studio/${ex.id}`);
                                    setSelectedExercise(ex);
                                  }}
                                  title={locked ? ex.lockReason : undefined}
                                  className={`w-full text-left pl-10 pr-3 py-2.5 text-xs rounded-lg transition-all flex items-center gap-2 group
                                ${locked
                                      ? 'opacity-50 cursor-not-allowed text-zinc-600 border-l-2 border-transparent'
                                      : isSelected
                                        ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                                        : 'cursor-pointer text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border-l-2 border-transparent'
                                    }`}
                                >
                                  {locked ? (
                                    <LockIcon className="w-3 h-3 text-zinc-600" />
                                  ) : (
                                    <FileCodeIcon
                                      className={`w-3 h-3 ${isSelected ? 'text-rust' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                                    />
                                  )}
                                  <span className="truncate flex-1">
                                    {ex.friendlyName || ex.exerciseName}
                                  </span>
                                  <div className="flex items-center gap-1.5 ml-auto">
                                    {ex.difficulty && (
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full ${ex.difficulty === 'easy'
                                            ? 'bg-emerald-500'
                                            : ex.difficulty === 'medium'
                                              ? 'bg-amber-500'
                                              : 'bg-red-500'
                                          }`}
                                        title={ex.difficulty}
                                      />
                                    )}
                                    {ex.tags?.[0] && (
                                      <Badge
                                        variant="outline"
                                        className="text-[8px] h-3.5 px-1 py-0 border-zinc-700/50 text-zinc-500"
                                      >
                                        {ex.tags[0]}
                                      </Badge>
                                    )}
                                    {!locked && status === 'pass' && (
                                      <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-400" />
                                    )}
                                    {!locked && status === 'fail' && (
                                      <XCircleIcon className="w-3.5 h-3.5 text-red-400" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                </Accordion>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="practice"
            className="flex-1 overflow-hidden m-0 text-zinc-100"
          >
            <ScrollArea className="h-full px-2 py-2">
              <div className="mb-4">
                <ChallengeGenerator>
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800 hover:text-rust transition-all text-xs font-semibold h-9"
                  >
                    <Wand2Icon className="w-3.5 h-3.5 mr-2" />
                    Gerar Desafio
                  </Button>
                </ChallengeGenerator>
              </div>

              {exerciseGroups['practice'] &&
                Array.isArray(exerciseGroups['practice']) ? (
                <div className="space-y-1">
                  {exerciseGroups['practice'].map((ex) => {
                    const status = results[ex.id];
                    const isSelected = selectedExercise?.id === ex.id;
                    return (
                      <button
                        key={ex.id}
                        onClick={() => {
                          $router.open(`/studio/${ex.id}`);
                          setSelectedExercise(ex);
                        }}
                        className={`w-full text-left px-3 py-3 text-xs rounded-lg transition-all flex items-center gap-3 group
                        ${isSelected
                            ? 'bg-gradient-to-r from-rust/20 to-transparent text-rust font-bold border-l-2 border-rust'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border-l-2 border-transparent'
                          }`}
                      >
                        <Wand2Icon
                          className={`w-4 h-4 ${isSelected ? 'text-rust' : 'text-zinc-600'}`}
                        />
                        <span className="truncate flex-1">
                          {ex.exerciseName}
                        </span>
                        {status === 'pass' && (
                          <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {status === 'fail' && (
                          <XCircleIcon className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Wand2Icon className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
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

      {/* Editor Section */}
      <section className="flex-1 flex flex-col gap-4 h-full min-h-0">
        {!selectedExercise && (
          <Card className="w-full flex-none p-3 border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-transparent backdrop-blur-sm">
            <div className="text-center py-8 text-zinc-500">
              <TerminalIcon className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
              <p>Select an exercise to start coding</p>
            </div>
          </Card>
        )}

        {selectedExercise && (
          <Card className="flex-none py-2 px-0 border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-transparent backdrop-blur-sm">
            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {currentStatus === 'pass' ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                      <CheckCircle2Icon className="w-3 h-3 mr-1" /> Mastered
                    </Badge>
                  ) : (
                    <Badge className="bg-rust/20 text-rust border-rust/30 text-[10px]">
                      Active Challenge
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white line-clamp-1">
                  {selectedExercise?.friendlyName ||
                    selectedExercise?.exerciseName}
                </h2>
                <p className="text-zinc-500 text-xs flex items-center gap-2">
                  <span className="text-zinc-600">
                    {selectedExercise?.moduleTitle ||
                      selectedExercise?.module?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <OpenInIdeButton
                    path={selectedExercise?.path || ''}
                    className="bg-zinc-800/50 hover:bg-zinc-700/50 px-2 py-1 rounded text-zinc-400 hover:text-zinc-300 text-[10px] w-auto h-auto transition-colors font-mono"
                  >
                    {selectedExercise?.path?.split('prog').pop()}
                  </OpenInIdeButton>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="lg"
                  disabled={isRunning || selectedExercise?.isLocked}
                  onClick={runTests}
                  className={`font-bold shadow-xl ${selectedExercise?.isLocked ? 'bg-zinc-700 shadow-none cursor-not-allowed' : 'shadow-rust/20 bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90'}`}
                >
                  {selectedExercise?.isLocked ? (
                    <>
                      <LockIcon className="mr-2 h-4 w-4" /> Locked
                    </>
                  ) : isRunning ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Compiling...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="mr-2 h-4 w-4 fill-white" /> Run Tests
                    </>
                  )}
                </Button>

                <PremiumGateModal>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={explainExercise}
                    disabled={isAiLoading}
                    className="font-semibold bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50"
                  >
                    {isAiLocked ? (
                      <LockIcon className="mr-2 h-4 w-4 text-zinc-500" />
                    ) : (
                      <SparklesIcon className="mr-2 h-4 w-4 text-purple-400" />
                    )}
                    Explain
                  </Button>
                </PremiumGateModal>

                <PremiumGateModal>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={getAiHint}
                    disabled={isAiLoading}
                    className="font-semibold bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50"
                  >
                    {isAiLocked ? (
                      <LockIcon className="mr-2 h-4 w-4 text-zinc-500" />
                    ) : (
                      <SparklesIcon className="mr-2 h-4 w-4 text-rust" />
                    )}
                    Hint
                  </Button>
                </PremiumGateModal>
              </div>
            </CardContent>
          </Card>
        )}

        <ContentTabs />
      </section>
    </div>
  );
}
