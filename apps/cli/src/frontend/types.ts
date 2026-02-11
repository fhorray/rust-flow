export interface Exercise {
  id: string;
  module: string;
  moduleTitle?: string;
  moduleIcon?: string;
  name: string;
  exerciseName: string;
  friendlyName?: string;
  path: string;
  entryPoint?: string;
  markdownPath?: string;
  hasQuiz?: boolean;
  isLocked?: boolean;
  lockReason?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  xp?: number;
  completionMessage?: string;
}

export type GroupedExercises = Record<string, Exercise[]>;
export type TestStatus = 'pass' | 'fail' | 'idle';

export interface ProgressStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalExercises: number;
}

export interface Progress {
  stats: ProgressStats;
  exercises: Record<string, { status: TestStatus; completedAt: string }>;
  quizzes: Record<string, { passed: boolean; xpEarned: number; completedAt: string }>;
  achievements: string[];
}
