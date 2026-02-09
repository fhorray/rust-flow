import { join } from "node:path";
import { homedir } from "node:os";

// The directory where the CLI is executed or where the course content is located
export const PROG_CWD = process.env.PROG_CWD || process.cwd();

// Global configuration directory in the user's home folder
export const CONFIG_DIR = join(homedir(), ".progy");
export const GLOBAL_CONFIG_PATH = join(CONFIG_DIR, "config.json");

// Course-specific paths (relative to PROG_CWD)
export const COURSE_CONFIG_NAME = "course.json";
export const COURSE_CONFIG_PATH = join(PROG_CWD, COURSE_CONFIG_NAME);

// Progy metadata/internal directory within the course
export const PROG_DIR_NAME = ".progy";
export const PROG_DIR = join(PROG_CWD, PROG_DIR_NAME);
export const MANIFEST_PATH = join(PROG_DIR, "exercises.json");
export const PROGRESS_PATH = join(PROG_DIR, "progress.json");

// Cache directory for official courses
export const COURSE_CACHE_DIR = join(CONFIG_DIR, "courses");

export function getCourseCachePath(courseId: string) {
  return join(COURSE_CACHE_DIR, courseId);
}

export const BACKEND_URL = process.env.PROGY_API_URL || "https://api.progy.dev";
export const FRONTEND_URL = process.env.PROGY_FRONTEND_URL || "https://progy.dev";
