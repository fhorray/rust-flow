'use client';

import React from 'react';
import { CheckCircle2, Circle, Lock, Star, ChevronRight } from 'lucide-react';
import { LucideCoins as LucideIcons } from 'lucide-react';
import { ScrollArea } from '@progy/ui/scroll-area';
import { Badge } from '@progy/ui/badge';

interface Exercise {
  id: string;
  name: string;
  exerciseName: string;
  friendlyName?: string;
  hasQuiz?: boolean;
  isLocked?: boolean;
  lockReason?: string;
  moduleIcon?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  xp?: number;
}

interface SkillTreeProps {
  exerciseGroups: Record<string, Exercise[]>;
  results: Record<string, string>;
  onSelectExercise: (ex: Exercise) => void;
  selectedExerciseId?: string;
  config?: any;
}

export function SkillTree({
  exerciseGroups,
  results,
  onSelectExercise,
  selectedExerciseId,
  config,
}: SkillTreeProps) {
  const modules = Object.keys(exerciseGroups);
  const layout = config?.branding?.layout || 'vertical';
  const isGrid = layout === 'grid';

  return (
    <ScrollArea className="h-full">
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        {/* Cover Image */}
        {config?.branding?.coverImage && (
          <div className="w-full h-40 lg:h-52 rounded-xl mb-10 overflow-hidden border border-zinc-800 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
            <img
              src={`/${config.branding.coverImage}`}
              alt={config.name || 'Course'}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute bottom-5 left-6 z-20">
              <h1 className="text-3xl lg:text-4xl font-black text-zinc-100 tracking-tight">
                {config.name || 'Course Map'}
              </h1>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                {modules.length} modules
              </p>
            </div>
          </div>
        )}

        {/* Modules */}
        <div className={isGrid ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
          {modules.map((moduleName, modIdx) => {
            const exercises = exerciseGroups[moduleName] || [];
            const modPassCount = exercises.filter(
              (ex) => results[ex.id] === 'pass',
            ).length;
            const isComplete = modPassCount === exercises.length && exercises.length > 0;
            const isModuleLocked = exercises.length > 0 && exercises.every(ex => ex.isLocked);
            const isUnlocked = !isModuleLocked;

            const modIconName = exercises[0]?.moduleIcon;
            const ModIcon = modIconName ? (LucideIcons as any)[modIconName] : null;

            const progressPct = exercises.length > 0 ? (modPassCount / exercises.length) * 100 : 0;

            return (
              <div
                key={moduleName}
                className={`relative rounded-xl border transition-all ${isComplete
                  ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
                  : isModuleLocked
                    ? 'border-zinc-800/50 bg-zinc-900/20 opacity-60'
                    : 'border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700/60'
                  }`}
              >
                {/* Module Header */}
                <div className="p-4 lg:p-5 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${isComplete
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : isUnlocked
                        ? 'bg-rust/10 border-rust/20'
                        : 'bg-zinc-800/50 border-zinc-800'
                      }`}
                  >
                    {ModIcon ? (
                      <ModIcon className={`w-5 h-5 ${isComplete ? 'text-emerald-400' : isUnlocked ? 'text-rust' : 'text-zinc-600'}`} />
                    ) : isComplete ? (
                      <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    ) : isUnlocked ? (
                      <Star className="w-5 h-5 text-rust" />
                    ) : (
                      <Lock className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold truncate ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                        {moduleName.split('_').slice(1).join(' ') || moduleName}
                      </h3>
                      {isComplete && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[9px] h-4 px-1.5 font-bold">
                          Done
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-[160px]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-rust'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold tabular-nums flex-shrink-0">
                        {isModuleLocked
                          ? exercises[0]?.lockReason || 'Locked'
                          : `${modPassCount}/${exercises.length}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                {!isModuleLocked && (
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {exercises.map((ex) => {
                        const status = results[ex.id];
                        const isSelected = selectedExerciseId === ex.id;
                        const locked = ex.isLocked;

                        return (
                          <button
                            key={ex.id}
                            onClick={() => !locked && onSelectExercise(ex)}
                            title={locked ? ex.lockReason : ex.friendlyName || ex.exerciseName}
                            className={`relative flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left group
                              ${locked
                                ? 'opacity-40 cursor-not-allowed border-zinc-800/50 bg-zinc-900/20'
                                : isSelected
                                  ? 'border-rust/40 bg-rust/5'
                                  : status === 'pass'
                                    ? 'border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]'
                                    : 'border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-800/30 hover:border-zinc-700/50'
                              }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
                                ${locked
                                  ? 'bg-zinc-800/50 text-zinc-600'
                                  : status === 'pass'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-zinc-800/80 text-zinc-500 group-hover:text-zinc-400'
                                }`}
                            >
                              {locked ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : status === 'pass' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-semibold leading-tight block truncate text-zinc-300">
                                {ex.friendlyName || ex.exerciseName}
                              </span>
                              {ex.difficulty && !locked && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <div
                                    className={`w-1 h-1 rounded-full ${ex.difficulty === 'hard' ? 'bg-red-500' : ex.difficulty === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                  />
                                  <span className="text-[8px] text-zinc-600 capitalize">{ex.difficulty}</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
