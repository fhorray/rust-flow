import React from 'react';
import { CheckCircle2, Circle, Lock, Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

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
      <div className="p-8 max-w-6xl mx-auto">
        {config?.branding?.coverImage && (
           <div className="w-full h-48 rounded-2xl mb-12 overflow-hidden border border-zinc-800 relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
              <img src={`/${config.branding.coverImage}`} className="w-full h-full object-cover" />
              <h1 className="absolute bottom-6 left-8 text-4xl font-black text-white z-20 uppercase tracking-tighter drop-shadow-lg">
                 {config.name || 'Course Map'}
              </h1>
           </div>
        )}

        <div className={isGrid ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "flex flex-col items-center space-y-12"}>
          {modules.map((moduleName, modIdx) => {
            const exercises = exerciseGroups[moduleName] || [];
            const modPassCount = exercises.filter(
              (ex) => results[ex.id] === 'pass',
            ).length;
            const isComplete = modPassCount === exercises.length;
            // Use backend lock state: module is locked if ALL its exercises are locked
            const isModuleLocked = exercises.length > 0 && exercises.every(ex => ex.isLocked);
            const isUnlocked = !isModuleLocked;

            // Pick Icon
            const modIconName = exercises[0]?.moduleIcon;
            const ModIcon = modIconName ? (LucideIcons as any)[modIconName] : null;

            return (
              <div
                key={moduleName}
                className={`relative w-full flex flex-col items-center ${isGrid ? 'bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50' : ''}`}
              >
                {/* Connector Line (Vertical Only) */}
                {!isGrid && modIdx < modules.length - 1 && (
                  <div className="absolute top-24 bottom-0 w-1 bg-zinc-800 -z-10" />
                )}

                {/* Module Hexagon/Header */}
                <div className={`relative group cursor-default ${isGrid ? 'mb-8 flex items-center gap-4 w-full' : ''}`}>
                  <div
                    className={`w-24 h-24 flex items-center justify-center rounded-2xl rotate-45 border-4 transition-all duration-500 shrink-0
                    ${isUnlocked
                        ? isComplete
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] rotate-[225deg]'
                          : 'border-rust bg-rust/10 shadow-[0_0_30px_-10px_rgba(234,88,12,0.4)]'
                        : 'border-zinc-800 bg-zinc-900'
                      } ${isGrid ? 'scale-75' : ''}`}
                  >
                    <div className="-rotate-45 flex flex-col items-center">
                      {ModIcon ? (
                         <ModIcon className={`w-10 h-10 ${isUnlocked ? (isComplete ? 'text-emerald-500' : 'text-rust') : 'text-zinc-700'}`} />
                      ) : (
                        isUnlocked ? (
                            isComplete ? (
                            <Star className="w-8 h-8 text-emerald-500 fill-emerald-500" />
                            ) : (
                            <Star className="w-8 h-8 text-rust" />
                            )
                        ) : (
                            <Lock className="w-8 h-8 text-zinc-700" />
                        )
                      )}
                    </div>
                  </div>

                  <div className={isGrid ? "text-left" : "absolute top-full mt-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center"}>
                    <h3
                      className={`text-sm font-black uppercase tracking-widest ${isUnlocked ? 'text-zinc-100' : 'text-zinc-600'}`}
                    >
                      {moduleName.split('_').slice(1).join(' ') || moduleName}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold mt-1">
                      {isModuleLocked ? (
                        <span className="text-zinc-600">{exercises[0]?.lockReason || 'Locked'}</span>
                      ) : (
                        <>{modPassCount} / {exercises.length} COMPLETED</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Exercise Nodes */}
                <div className={`${isGrid ? '' : 'mt-24'} grid grid-cols-2 ${isGrid ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 w-full max-w-2xl`}>
                  {exercises.map((ex) => {
                    const status = results[ex.id];
                    const isSelected = selectedExerciseId === ex.id;
                    const locked = ex.isLocked;

                    return (
                      <button
                        key={ex.id}
                        onClick={() => !locked && onSelectExercise(ex)}
                        title={locked ? ex.lockReason : undefined}
                        className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all group
                           ${locked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                           ${isSelected ? 'border-rust bg-rust/5' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}
                         `}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                           ${locked ? 'bg-zinc-800/50 text-zinc-600' : status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}
                         `}
                        >
                          {locked ? (
                            <Lock className="w-5 h-5" />
                          ) : status === 'pass' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-tight mt-1">
                          {ex.friendlyName || ex.exerciseName}
                        </span>

                        {(ex.tags?.length || ex.difficulty) && !locked && (
                            <div className="flex gap-1 mt-1 flex-wrap justify-center">
                                {ex.difficulty && <span className={`w-1.5 h-1.5 rounded-full ${ex.difficulty === 'hard' ? 'bg-red-500' : ex.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} title={ex.difficulty} />}
                                {ex.tags?.slice(0, 2).map(t => <span key={t} className="text-[8px] text-zinc-600 border border-zinc-800 px-1 rounded">{t}</span>)}
                            </div>
                        )}

                        {locked && (
                          <span className="text-[8px] text-zinc-600 mt-1 text-center leading-tight">
                            {ex.lockReason}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
