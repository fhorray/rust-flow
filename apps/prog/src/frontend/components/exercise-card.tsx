import React from 'react';
import { useStore } from '@nanostores/react';
import { CheckCircle2, Loader2, Play, Sparkles, Terminal } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { $selectedExercise, $results } from '../stores/course-store';
import { OpenInIdeButton } from './open-in-ide-button';

interface ExerciseCardProps {
  isRunning: boolean;
  isAiLoading: boolean;
  hasOutput: boolean;
  onRunTests: () => void;
  onGetAiHint: () => void;
}

export function ExerciseCard({
  isRunning,
  isAiLoading,
  hasOutput,
  onRunTests,
  onGetAiHint,
}: ExerciseCardProps) {
  const selectedExercise = useStore($selectedExercise);
  const results = useStore($results);

  if (!selectedExercise) {
    return (
      <Card className="flex-none p-5 border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-transparent backdrop-blur-sm">
        <div className="text-center py-8 text-zinc-500">
          <Terminal className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          <p>Select an exercise to start coding</p>
        </div>
      </Card>
    );
  }

  const status = results[selectedExercise.id];

  return (
    <Card className="flex-none p-5 border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-transparent backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {status === 'pass' ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Mastered
              </Badge>
            ) : (
              <Badge className="bg-rust/20 text-rust border-rust/30 text-[10px]">
                Active Challenge
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white line-clamp-1">
            {selectedExercise.friendlyName || selectedExercise.exerciseName}
          </h2>
          <p className="text-zinc-500 text-xs flex items-center gap-2">
            <span className="text-zinc-600">
              {selectedExercise.moduleTitle ||
                selectedExercise.module.replace(/_/g, ' ')}
            </span>
            <span className="text-zinc-700">•</span>
            <OpenInIdeButton
              path={selectedExercise.path}
              className="bg-zinc-800/50 hover:bg-zinc-700/50 px-2 py-1 rounded text-zinc-400 hover:text-zinc-300 text-[10px] w-auto h-auto transition-colors font-mono"
            >
              {selectedExercise.path.split('prog').pop()}
            </OpenInIdeButton>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            disabled={isRunning}
            onClick={onRunTests}
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
            onClick={onGetAiHint}
            disabled={isAiLoading || !hasOutput}
            className="font-semibold bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50"
          >
            <Sparkles className="mr-2 h-4 w-4 text-rust" />
            AI Hint
          </Button>
        </div>
      </div>
    </Card>
  );
}
