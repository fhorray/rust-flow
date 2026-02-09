export interface RunnerConfig {
  command: string;
  args: string[];
  cwd?: string;
  type?: 'process' | 'docker-local' | 'docker-compose';
  dockerfile?: string;
  image_tag?: string;
  network_access?: boolean;
  compose_file?: string;
  service_to_run?: string;
}

export interface ContentConfig {
  exercises: string;
  root?: string;
}

export interface SetupCheck {
  name: string;
  type: 'command';
  command: string;
}

export interface SetupConfig {
  checks: SetupCheck[];
  guide?: string;
}

export interface CourseConfig {
  id: string;
  name: string;
  runner: RunnerConfig;
  content: ContentConfig;
  api_keys?: Record<string, string>;
  setup?: SetupConfig;
  repo?: string;
  isOfficial?: boolean;
}

export interface ProgressStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalExercises: number; // Added for dashboard progress calculation
}

export interface ExerciseProgress {
  status: 'pass' | 'fail';
  xpEarned: number;
  completedAt: string;
}

export interface QuizProgress {
  passed: boolean;
  xpEarned: number;
  completedAt: string;
}

export interface Progress {
  stats: ProgressStats;
  exercises: Record<string, ExerciseProgress>;
  quizzes: Record<string, QuizProgress>;
  achievements: string[];
}

export interface SRPDiagnostic {
  severity: 'error' | 'warning' | 'note';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  snippet?: string;
  suggestion?: string;
}

export interface SRPOutput {
  success: boolean;
  summary: string;
  diagnostics?: SRPDiagnostic[];
  tests?: Array<{ name: string; status: 'pass' | 'fail'; message?: string }>;
  raw: string;
}

import type { BunRequest } from "bun";

export type ServerType<P extends string = string> = (req: BunRequest<P>) => Response | Promise<Response>;
