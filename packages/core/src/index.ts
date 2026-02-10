// Core utilities
export { exists } from "./utils.ts";

// Paths & constants
export {
  PROG_CWD,
  CONFIG_DIR,
  GLOBAL_CONFIG_PATH,
  COURSE_CONFIG_NAME,
  COURSE_CONFIG_PATH,
  PROG_DIR_NAME,
  PROG_DIR,
  MANIFEST_PATH,
  PROGRESS_PATH,
  COURSE_CACHE_DIR,
  getCourseCachePath,
  BACKEND_URL,
  FRONTEND_URL,
} from "./paths.ts";

// Config
export {
  getGlobalConfig,
  saveGlobalConfig,
  updateGlobalConfig,
  loadToken,
  saveToken,
  clearToken,
} from "./config.ts";
export type { AIConfig, GlobalConfig } from "./config.ts";

// Logger
export { logger } from "./logger.ts";

// Git
export { GitUtils } from "./git.ts";
export type { GitResult } from "./git.ts";

// Course loader
export { CourseLoader, spawnPromise } from "./loader.ts";
export type { LoaderCourseConfig } from "./loader.ts";

// Course container
export { CourseContainer } from "./container.ts";

// Registry cache
export { RegistryCache } from "./cache.ts";

// Sync
export { SyncManager } from "./sync.ts";
export type { ProgyConfig } from "./sync.ts";

// Templates
export {
  MODULE_INFO_TOML,
  EXERCISE_README,
  EXERCISE_STARTER,
  QUIZ_TEMPLATE,
  TEMPLATES,
  RUNNER_README,
} from "./templates.ts";

// Types (backend shared)
export type {
  RunnerConfig,
  ContentConfig,
  SetupCheck,
  SetupConfig,
  ProgressionConfig,
  CourseConfig,
  ProgressStats,
  ExerciseProgress,
  QuizProgress,
  Progress,
  ManifestEntry,
  SRPDiagnostic,
  SRPOutput,
  ServerType,
} from "./types.ts";

// Helpers (backend shared business logic)
export {
  checkPrerequisite,
  getCourseConfig,
  ensureConfig,
  currentConfig,
  getProgress,
  saveProgress,
  updateStreak,
  scanAndGenerateManifest,
  runSetupChecks,
  parseRunnerOutput,
} from "./helpers.ts";
export {
  BACKEND_URL as HELPERS_BACKEND_URL,
} from "./helpers.ts";
