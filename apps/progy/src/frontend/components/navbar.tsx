import React from 'react';
import { useStore } from '@nanostores/react';
import { Zap, Layout, Map, Flame, Book, Wand2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { $viewMode, setViewMode } from '../stores/ui-store';
import {
  $progress,
  $progressPercent,
  $completedCount,
  $totalExercises,
} from '../stores/course-store';
import { UserNav } from './user-nav';

interface NavbarProps {
  onGenerateChallenge: () => void;
}

export function Navbar({ onGenerateChallenge }: NavbarProps) {
  const viewMode = useStore($viewMode);
  const progress = useStore($progress);
  const progressPercent = useStore($progressPercent);
  const completedCount = useStore($completedCount);
  const totalExercises = useStore($totalExercises);

  return (
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
              Prog
              <span className="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">
                y
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium -mt-0.5">
              Learn by Doing
            </p>
          </div>

          <div className="ml-4 self-center">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="bg-zinc-900 border border-zinc-800 h-8 p-0.5">
                <TabsTrigger
                  value="editor"
                  className="text-[10px] font-black px-3 gap-1.5 h-7 data-[state=active]:bg-zinc-800"
                >
                  <Layout className="w-3 h-3" />
                  EDITOR
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="text-[10px] font-black px-3 gap-1.5 h-7 data-[state=active]:bg-zinc-800"
                >
                  <Map className="w-3 h-3" />
                  COURSE MAP
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Gamification Stats */}
          {progress && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
              {/* Streak */}
              <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full">
                <Flame
                  className={`w-4 h-4 ${progress.stats.currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-600'}`}
                />
                <span className="text-xs font-bold text-orange-200 tabular-nums">
                  {progress.stats.currentStreak}
                </span>
              </div>

              {/* XP & Level */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Level {Math.floor(progress.stats.totalXp / 100) + 1}
                  </span>
                  <span className="text-xs font-black text-zinc-100 tabular-nums">
                    {progress.stats.totalXp} XP
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 relative">
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
                  <span className="text-sm font-black text-zinc-100">
                    {Math.floor(progress.stats.totalXp / 100) + 1}
                  </span>
                </div>
              </div>
            </div>
          )}

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
            onClick={onGenerateChallenge}
            className="bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 font-semibold text-xs shadow-lg shadow-rust/20"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Gerar Desafio
          </Button>

          <div className="h-8 w-[1px] bg-zinc-800/50 mx-1" />

          <UserNav />
        </div>
      </div>
    </nav>
  );
}
