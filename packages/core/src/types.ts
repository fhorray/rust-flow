import { z } from "zod";

/**
 * ===========================================
 * Course Configuration Schemas
 * ===========================================
 */

const RunnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.enum(["process", "docker-file", "docker-compose"]).optional().default("process"),
  command: z.string(),
  args: z.array(z.string()),
  cwd: z.string(),
  dockerfile: z.string().optional(),
  image_tag: z.string().optional(),
  network_access: z.boolean().optional().default(false),
  compose_file: z.string().optional(),
  service_to_run: z.string().optional(),
});

const ContentSchema = z.object({
  root: z.string(),
  exercises: z.string(),
});

const SetupCheckSchema = z.object({
  name: z.string(),
  type: z.string(),
  command: z.string(),
  solution: z.string().optional(),
  status: z.enum(["pending", "checking", "pass", "fail", "warning"]).optional().default("pending"),
  message: z.string().optional(),
});

const SetupSchema = z.object({
  checks: z.array(SetupCheckSchema),
  guide: z.string(),
});

const BrandingSchema = z.object({
  coverImage: z.string().optional(),
  primaryColor: z.string().optional(),
  layout: z.string().optional().default("grid"),
});

const ProgressionSchema = z.object({
  mode: z.string().optional().default("open"),
});

const AchievementSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: z.string(),
});

export const CourseConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().optional().default("1.0.0"), // Add versioning
  runner: RunnerSchema,
  runners: z.array(RunnerSchema).optional(),
  content: ContentSchema,
  setup: SetupSchema.optional(),
  branding: BrandingSchema.optional(),
  progression: ProgressionSchema.optional(),
  achievements: z.array(AchievementSchema).optional(),
  // Merged fields from previous Interface
  api_keys: z.record(z.string(), z.string()).optional(),
  repo: z.string().optional(),
  isOfficial: z.boolean().optional(),
});

/**
 * ===========================================
 * Module Info Schema
 * ===========================================
 */
export const ModuleInfoSchema = z.object({
  module: z.object({
    title: z.string().optional(),
    message: z.string().optional(),
    icon: z.string().optional(),
    completion_message: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
  }).optional(),
  exercises: z.record(z.string(), z.union([
    z.string(),
    z.object({
      title: z.string().optional(),
      xp: z.number().optional(),
      prerequisites: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    })
  ])).optional(),
});

/**
 * ===========================================
 * Quiz Schemas
 * ===========================================
 */
const BaseQuestion = z.object({
  id: z.string(),
  question: z.string(),
  explanation: z.string().optional(), // General answer explanation
});

const MultipleChoiceQuestion = BaseQuestion.extend({
  type: z.literal("multiple-choice"),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      isCorrect: z.boolean(), // Validation logic handled here
      explanation: z.string().optional(), // Specific explanation for this option
    })
  ),
});

const TrueFalseQuestion = BaseQuestion.extend({
  type: z.literal("true-false"),
  correctAnswer: z.boolean(), // true or false
});

const TextAnswerQuestion = BaseQuestion.extend({
  type: z.enum(["short-answer", "fill-in-the-blank"]),
  acceptedAnswers: z.array(z.string()), // List of accepted answers
  caseSensitive: z.boolean().default(false),
});

const CodingQuestion = BaseQuestion.extend({
  type: z.literal("coding"),
  language: z.string(), // e.g. "javascript", "python"
  startingCode: z.string().optional(), // Initial code in the editor
  solutionCode: z.string(), // The correct solution
  testCases: z.array( // Test cases to validate the code
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
    })
  ).optional(),
});

const MatchingQuestion = BaseQuestion.extend({
  type: z.literal("matching"),
  pairs: z.array(
    z.object({
      left: z.string(),
      right: z.string(),
    })
  ),
});

const EssayQuestion = BaseQuestion.extend({
  type: z.literal("essay"),
  minWords: z.number().optional(),
  rubric: z.string().optional(), // Evaluation criteria
});

export const QuestionSchema = z.discriminatedUnion("type", [
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  TextAnswerQuestion,
  CodingQuestion,
  MatchingQuestion,
  EssayQuestion
]);

export const QuizSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(QuestionSchema),
});

/**
 * ===========================================
 * Progress & User Stats Schemas
 * ===========================================
 */
export const ProgressStatsSchema = z.object({
  totalXp: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  lastActiveDate: z.string().nullable(),
  totalExercises: z.number(),
});

export const ExerciseProgressSchema = z.object({
  status: z.enum(["pass", "fail"]),
  xpEarned: z.number(),
  completedAt: z.string(),
  attempts: z.number().optional(),
});

export const QuizProgressSchema = z.object({
  passed: z.boolean(),
  score: z.number(),
  totalQuestions: z.number(),
  xpEarned: z.number(),
  completedAt: z.string(),
});

export const ProgressSchema = z.object({
  stats: ProgressStatsSchema,
  exercises: z.record(z.string(), ExerciseProgressSchema),
  quizzes: z.record(z.string(), QuizProgressSchema),
  achievements: z.array(z.string()),
  tutorSuggestion: z.object({
    exerciseId: z.string(),
    lesson: z.string(),
    timestamp: z.string(),
  }).optional(),
});

/**
 * ===========================================
 * System & Files Schemas
 * ===========================================
 */
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["tutor", "streak", "achievement", "system"]),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const ManifestEntrySchema = z.object({
  id: z.string(),
  module: z.string(),
  moduleTitle: z.string(),
  moduleIcon: z.string().optional(),
  name: z.string(),
  exerciseName: z.string(),
  friendlyName: z.string(),
  path: z.string(),
  entryPoint: z.string().optional(),
  markdownPath: z.string().nullable(),
  hasQuiz: z.boolean(),
  type: z.enum(["file", "directory"]),
  isLocked: z.boolean(),
  lockReason: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  xp: z.number().optional(),
  completionMessage: z.string().optional(),
});

export const SRPDiagnosticSchema = z.object({
  severity: z.enum(["error", "warning", "note"]),
  message: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  snippet: z.string().optional(),
  suggestion: z.string().optional(),
});

export const SRPOutputSchema = z.object({
  success: z.boolean(),
  summary: z.string(),
  diagnostics: z.array(SRPDiagnosticSchema).optional(),
  tests: z.array(z.object({
    name: z.string(),
    status: z.enum(["pass", "fail"]),
    message: z.string().optional()
  })).optional(),
  raw: z.string(),
});

/**
 * ===========================================
 * Type Exports (Inferred from Schemas)
 * ===========================================
 */

// Course Config Types
export type RunnerConfig = z.infer<typeof RunnerSchema>;
export type ContentConfig = z.infer<typeof ContentSchema>;
export type SetupConfig = z.infer<typeof SetupSchema>;
export type SetupCheck = z.infer<typeof SetupCheckSchema>;
export type BrandingConfig = z.infer<typeof BrandingSchema>;
export type ProgressionConfig = z.infer<typeof ProgressionSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type CourseConfig = z.infer<typeof CourseConfigSchema>;

// Module & Quiz Types
export type ModuleInfo = z.infer<typeof ModuleInfoSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Question = z.infer<typeof QuestionSchema>;

// Progress Types
export type ProgressStats = z.infer<typeof ProgressStatsSchema>;
export type ExerciseProgress = z.infer<typeof ExerciseProgressSchema>;
export type QuizProgress = z.infer<typeof QuizProgressSchema>;
export type Progress = z.infer<typeof ProgressSchema>;

// System Types
export type Notification = z.infer<typeof NotificationSchema>;
export type ManifestEntry = z.infer<typeof ManifestEntrySchema>;
export type SRPDiagnostic = z.infer<typeof SRPDiagnosticSchema>;
export type SRPOutput = z.infer<typeof SRPOutputSchema>;