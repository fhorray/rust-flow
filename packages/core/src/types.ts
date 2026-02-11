import type { BunRequest } from "bun";

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

export interface ProgressionConfig {
  mode?: 'sequential' | 'open';
  strict_module_order?: boolean;
  bypass_code?: string;
}

export interface BrandingConfig {
  coverImage?: string;
  primaryColor?: string;
  layout?: 'vertical' | 'grid' | 'constellation';
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  trigger: string; // e.g. "complete_module_01"
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
  progression?: ProgressionConfig;
  branding?: BrandingConfig;
  achievements?: Achievement[];
}

export interface ProgressStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalExercises: number;
}

export interface ExerciseProgress {
  status: 'pass' | 'fail';
  xpEarned: number;
  completedAt: string;
}

export interface QuizProgress {
  passed: boolean;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
}

export interface Progress {
  stats: ProgressStats;
  exercises: Record<string, ExerciseProgress>;
  quizzes: Record<string, QuizProgress>;
  achievements: string[];
}

export interface ManifestEntry {
  id: string;
  module: string;
  moduleTitle: string;
  moduleIcon?: string; // New: Icon for the module
  name: string;
  exerciseName: string;
  friendlyName: string;
  path: string;
  entryPoint?: string;
  markdownPath: string | null;
  hasQuiz: boolean;
  type: "file" | "directory";
  isLocked: boolean;
  lockReason?: string;
  tags?: string[]; // New: Tags like ["easy", "sql"]
  difficulty?: 'easy' | 'medium' | 'hard'; // New: Difficulty level
  xp?: number; // New: XP override
  completionMessage?: string; // New: Custom message when module is completed
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

export type ServerType<P extends string = string> = (req: BunRequest<P>) => Response | Promise<Response>;
