import { stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * Check if a file or directory exists at the given path.
 * Replaces the duplicated `exists()` helper scattered across the codebase.
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the environment (student or instructor) based on the presence of course.json.
 */
export async function detectEnvironment(cwd: string): Promise<"student" | "instructor"> {
  const hasCourseJson = await exists(join(cwd, "course.json"));

  if (hasCourseJson) return "instructor";
  return "student";
}
