import React from 'react';
import { CheckCircle2, Circle, Lock, Star } from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Exercise {
  id: string;
  name: string;
  exerciseName: string;
  friendlyName?: string;
  hasQuiz?: boolean;
}

interface SkillTreeProps {
  exerciseGroups: Record<string, Exercise[]>;
  results: Record<string, string>;
  onSelectExercise: (ex: Exercise) => void;
  selectedExerciseId?: string;
}

export function SkillTree({
  exerciseGroups,
  results,
  onSelectExercise,
  selectedExerciseId,
}: SkillTreeProps) {
  const modules = Object.keys(exerciseGroups);

  return (
    <ScrollArea className="h-full">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-12">
          {modules.map((moduleName, modIdx) => {
            const exercises = exerciseGroups[moduleName] || [];
            const modPassCount = exercises.filter(
              (ex) => results[ex.id] === 'pass',
            ).length;
            const isComplete = modPassCount === exercises.length;
            const isUnlocked =
              modIdx === 0 ||
              (modules[modIdx - 1] &&
                (exerciseGroups[modules[modIdx - 1] as string] || []).every(
                  (ex: Exercise) => results[ex.id] === 'pass',
                ));

            return (
              <div
                key={moduleName}
                className="relative w-full flex flex-col items-center"
              >
                {/* Connector Line */}
                {modIdx < modules.length - 1 && (
                  <div className="absolute top-24 bottom-0 w-1 bg-zinc-800 -z-10" />
                )}

                {/* Module Hexagon/Header */}
                <div className="relative group cursor-default">
                  <div
                    className={`w-24 h-24 flex items-center justify-center rounded-2xl rotate-45 border-4 transition-all duration-500
                    ${
                      isUnlocked
                        ? isComplete
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)] rotate-[225deg]'
                          : 'border-rust bg-rust/10 shadow-[0_0_30px_-10px_rgba(234,88,12,0.4)]'
                        : 'border-zinc-800 bg-zinc-900'
                    }`}
                  >
                    <div className="-rotate-45 flex flex-col items-center">
                      {isUnlocked ? (
                        isComplete ? (
                          <Star className="w-8 h-8 text-emerald-500 fill-emerald-500" />
                        ) : (
                          <Star className="w-8 h-8 text-rust" />
                        )
                      ) : (
                        <Lock className="w-8 h-8 text-zinc-700" />
                      )}
                    </div>
                  </div>

                  <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                    <h3
                      className={`text-sm font-black uppercase tracking-widest ${isUnlocked ? 'text-zinc-100' : 'text-zinc-600'}`}
                    >
                      {moduleName.split('_').slice(1).join(' ') || moduleName}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold">
                      {modPassCount} / {exercises.length} COMPLETED
                    </p>
                  </div>
                </div>

                {/* Exercise Nodes (Floating around or below) */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl">
                  {exercises.map((ex) => {
                    const status = results[ex.id];
                    const isSelected = selectedExerciseId === ex.id;

                    return (
                      <button
                        key={ex.id}
                        onClick={() => isUnlocked && onSelectExercise(ex)}
                        className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all group
                           ${!isUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                           ${isSelected ? 'border-rust bg-rust/5' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}
                         `}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                           ${status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}
                         `}
                        >
                          {status === 'pass' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight uppercase tracking-tight">
                          {ex.friendlyName || ex.exerciseName}
                        </span>
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
