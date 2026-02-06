export interface Exercise {
  id: string;
  module: string;
  moduleTitle?: string;
  name: string;
  exerciseName: string;
  friendlyName?: string;
  path: string;
  markdownPath?: string;
  hasQuiz?: boolean;
}

export type GroupedExercises = Record<string, Exercise[]>;
export type TestStatus = 'pass' | 'fail' | 'idle';

export interface ProgressStats {
  totalXp: number;
  currentStreak: number;
  lastActiveDate?: string;
}

export interface Progress {
  stats: ProgressStats;
  exercises: Record<string, { status: TestStatus; completedAt: string }>;
  quizzes: Record<string, { passed: boolean; xpEarned: number; completedAt: string }>;
}
