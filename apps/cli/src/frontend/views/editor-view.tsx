'use client';

import { OpenInIdeButton } from '@/components/open-in-ide-button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@progy/ui/accordion';
import { Badge } from '@progy/ui/badge';
import { Button } from '@progy/ui/button';
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
  ChevronRightIcon,
  TrophyIcon,
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

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('learning');
  const currentStatus = selectedExercise ? results[selectedExercise.id] : null;

  return (
    <div className="flex flex-1 min-h-0 w-full">
      <SoundManager />

      {/* SIDEBAR */}
      <aside className="w-72 lg:w-80 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950 flex flex-col overflow-hidden">
        {/* Stats Header */}
        <div className="p-4 border-b border-zinc-800/60 space-y-3">
          {progress && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle
                      cx="20" cy="20" r="17"
                      fill="transparent" stroke="currentColor" strokeWidth="2.5"
                      className="text-zinc-800"
                    />
                    <circle
                      cx="20" cy="20" r="17"
                      fill="transparent" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray={2 * Math.PI * 17}
                      strokeDashoffset={2 * Math.PI * 17 * (1 - (progress.stats.totalXp % 100) / 100)}
                      strokeLinecap="round"
                      className="text-rust transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-zinc-200">
                    {Math.floor(progress.stats.totalXp / 100) + 1}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                    Level {Math.floor(progress.stats.totalXp / 100) + 1}
                  </span>
                  <span className="text-sm font-bold text-zinc-100 tabular-nums">
                    {progress.stats.totalXp} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-medium">
              <span className="text-zinc-500">Course Progress</span>
              <span className="text-zinc-300 tabular-nums font-bold">
                {completedCount}/{totalExercises}
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rust to-orange-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <Tabs
          value={sidebarTab}
          onValueChange={(v) => setSidebarTab(v as SidebarTab)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="px-2 pt-2 pb-1 border-b border-zinc-800/60">
            <TabsList className="w-full bg-zinc-900 h-9 p-0.5 rounded-lg">
              <TabsTrigger
                value="learning"
                className="flex-1 gap-1.5 text-[11px] font-bold h-8 rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm"
              >
                <BookOpenIcon className="w-3.5 h-3.5" />
                Learning Path
              </TabsTrigger>
              <TabsTrigger
                value="practice"
                className="flex-1 gap-1.5 text-[11px] font-bold h-8 rounded-md data-[state=active]:bg-rust data-[state=active]:text-white data-[state=active]:shadow-sm"
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
            <ScrollArea className="h-full">
              <div className="p-2">
                {Object.keys(exerciseGroups).length === 0 ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-11 bg-zinc-900 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-0.5"
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
                            <AccordionTrigger className="hover:no-underline py-2.5 px-3 rounded-lg hover:bg-zinc-900 text-zinc-300 text-xs transition-all [&[data-state=open]]:bg-zinc-900">
                              <div className="flex items-center gap-2.5 truncate flex-1">
                                {isModuleLocked ? (
                                  <div className="w-5 h-5 rounded-md bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                                    <LockIcon className="w-3 h-3 text-zinc-600" />
                                  </div>
                                ) : isModuleComplete ? (
                                  <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-md bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[9px] font-bold text-zinc-500 tabular-nums">
                                      {modulePassCount}
                                    </span>
                                  </div>
                                )}
                                <span
                                  className={`font-semibold truncate text-[12px] ${isModuleComplete ? 'text-zinc-500 line-through decoration-zinc-700' : ''}`}
                                >
                                  {exercises[0]?.moduleTitle ||
                                    moduleKey
                                      .replace(/^\d+_/, '')
                                      .replace(/_/g, ' ')}
                                </span>
                              </div>
                              <Badge
                                variant={isModuleComplete ? 'outline' : 'secondary'}
                                className={`ml-auto mr-2 text-[9px] h-5 px-1.5 tabular-nums font-bold ${isModuleComplete ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'}`}
                              >
                                {modulePassCount}/{exercises.length}
                              </Badge>
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pt-0.5 space-y-0.5">
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
                                    className={`w-full text-left pl-9 pr-3 py-2 text-[11px] rounded-md transition-all flex items-center gap-2 group
                                      ${locked
                                        ? 'opacity-40 cursor-not-allowed text-zinc-600'
                                        : isSelected
                                          ? 'bg-rust/10 text-rust font-bold border-l-2 border-rust ml-0.5'
                                          : 'cursor-pointer text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                      }`}
                                  >
                                    {locked ? (
                                      <LockIcon className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                                    ) : status === 'pass' ? (
                                      <CheckCircle2Icon className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                      <FileCodeIcon
                                        className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-rust' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                                      />
                                    )}
                                    <span className="truncate flex-1">
                                      {ex.friendlyName || ex.exerciseName}
                                    </span>
                                    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
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
                                      {!locked && status === 'fail' && (
                                        <XCircleIcon className="w-3 h-3 text-red-400" />
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
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="practice"
            className="flex-1 overflow-hidden m-0 text-zinc-100"
          >
            <ScrollArea className="h-full">
              <div className="p-3">
                <ChallengeGenerator>
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-transparent border-dashed border-zinc-700 hover:bg-zinc-800/50 hover:border-rust/50 hover:text-rust transition-all text-xs font-semibold h-10 rounded-lg"
                  >
                    <Wand2Icon className="w-3.5 h-3.5 mr-2" />
                    Generate Challenge
                  </Button>
                </ChallengeGenerator>

                {exerciseGroups['practice'] &&
                  Array.isArray(exerciseGroups['practice']) ? (
                  <div className="space-y-0.5 mt-3">
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
                          className={`w-full text-left px-3 py-2.5 text-[11px] rounded-md transition-all flex items-center gap-2.5 group
                            ${isSelected
                              ? 'bg-rust/10 text-rust font-bold border-l-2 border-rust'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                        >
                          <Wand2Icon
                            className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-rust' : 'text-zinc-600'}`}
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
                  <div className="text-center py-12 text-zinc-500">
                    <Wand2Icon className="w-8 h-8 mx-auto mb-3 text-zinc-800" />
                    <p className="text-xs font-medium">No challenges yet</p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Click above to generate one
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-h-0 min-w-0">
        {!selectedExercise && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-5">
                <TerminalIcon className="w-7 h-7 text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-300 mb-2">Select an Exercise</h3>
              <p className="text-sm text-zinc-600">
                Choose an exercise from the sidebar to start coding and learning.
              </p>
            </div>
          </div>
        )}

        {selectedExercise && (
          <>
            {/* Exercise Header Bar */}
            <div className="flex-none border-b border-zinc-800/60 bg-zinc-950 px-4 lg:px-6 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {currentStatus === 'pass' ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rust/10 border border-rust/20 flex items-center justify-center flex-shrink-0">
                      <FileCodeIcon className="w-4 h-4 text-rust" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-zinc-100 truncate">
                        {selectedExercise?.friendlyName || selectedExercise?.exerciseName}
                      </h2>
                      {currentStatus === 'pass' && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] h-5 font-bold">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      <span>{selectedExercise?.moduleTitle || selectedExercise?.module?.replace(/_/g, ' ')}</span>
                      <ChevronRightIcon className="w-3 h-3 text-zinc-700" />
                      <OpenInIdeButton
                        path={selectedExercise?.path || ''}
                        className="text-zinc-500 hover:text-rust transition-colors font-mono text-[10px] w-auto h-auto p-0 bg-transparent hover:bg-transparent"
                      >
                        {selectedExercise?.path?.split('prog').pop()}
                      </OpenInIdeButton>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <PremiumGateModal>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={getAiHint}
                      disabled={isAiLoading}
                      className="text-zinc-400 hover:text-rust hover:bg-rust/5 text-xs h-8 px-3"
                    >
                      {isAiLocked ? (
                        <LockIcon className="mr-1.5 h-3.5 w-3.5 text-zinc-600" />
                      ) : (
                        <SparklesIcon className="mr-1.5 h-3.5 w-3.5 text-rust" />
                      )}
                      Hint
                    </Button>
                  </PremiumGateModal>

                  <PremiumGateModal>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={explainExercise}
                      disabled={isAiLoading}
                      className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 text-xs h-8 px-3"
                    >
                      {isAiLocked ? (
                        <LockIcon className="mr-1.5 h-3.5 w-3.5 text-zinc-600" />
                      ) : (
                        <SparklesIcon className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                      )}
                      Explain
                    </Button>
                  </PremiumGateModal>

                  <Button
                    size="sm"
                    disabled={isRunning || selectedExercise?.isLocked}
                    onClick={runTests}
                    className={`font-bold text-xs h-8 px-4 ${selectedExercise?.isLocked
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 text-white shadow-lg shadow-rust/20'
                      }`}
                  >
                    {selectedExercise?.isLocked ? (
                      <>
                        <LockIcon className="mr-1.5 h-3.5 w-3.5" /> Locked
                      </>
                    ) : isRunning ? (
                      <>
                        <Loader2Icon className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="mr-1.5 h-3.5 w-3.5 fill-white" /> Run Tests
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <ContentTabs />
          </>
        )}
      </section>
    </div>
  );
}
