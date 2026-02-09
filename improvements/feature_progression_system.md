# Course Progression & Gating System Implementation Plan

This document details the complete implementation plan for the "Course Progression & Gating System" in Progy. This feature introduces mechanisms to control access to course content based on user progress, quiz scores, and module completion.

## 1. Overview & Goals

The primary goal is to provide instructors with granular control over how students progress through a course. This system will support:

*   **Sequential Unlocking:** Default behavior where completing Lesson 1 unlocks Lesson 2.
*   **Quiz Score Requirements:** "You need 80% on Quiz 1 to unlock Lesson 2."
*   **Module Completion Gates:** "Finish Module 1 (all exercises/quizzes) to start Module 2."
*   **Instructor Bypass:** A `--bypass` flag for `progy dev` to unlock everything for testing.
*   **Detailed User Feedback:** Clear messages explaining *why* a lesson is locked (e.g., "Locked: You need 80% on Intro Quiz").

## 2. Configuration Schema Changes

We will introduce new configuration options in `course.json` (global) and `info.toml` (module/lesson specific).

### 2.1. Global Configuration (`course.json`)

Add a `progression` object to define default behaviors.

```json
{
  "progression": {
    "mode": "sequential", // "sequential" (default) or "open"
    "strict_module_order": true, // If true, Module 02 is locked until Module 01 is 100% complete
    "bypass_code": "INSTRUCTOR_DEBUG_CODE_123" // Optional secret code for students to unlock everything
  }
}
```

### 2.2. Module/Lesson Configuration (`info.toml`)

Allow overriding defaults or adding specific prerequisites. We will support a new `prerequisites` array.

**Example `info.toml` for a Module (e.g., `content/02_advanced/info.toml`):**

```toml
[module]
title = "Advanced Topics"
message = "Dive deeper into the language."
# This module requires Module 01 to be completed
prerequisites = ["module_01"]

[exercises]
# This specific exercise requires passing the 'intro_quiz' with 80%
complex_exercise = { title = "Complex Logic", prerequisites = ["quiz:01_intro/quiz.json:80"] }
```

**Supported Prerequisite Formats:**
*   `"module_<id>"`: Requires the entire module to be completed.
*   `"exercise:<id>"`: Requires a specific exercise to be passed.
*   `"quiz:<id>:<score>"`: Requires a specific quiz to be passed with at least `<score>` percentage.
*   `"quiz:<id>"`: Requires a specific quiz to be passed (score irrelevant).

## 3. Data Model Updates (`apps/cli/src/backend/types.ts`)

We need to update the `Progress` and related interfaces to track quiz scores and detailed completion status.

### 3.1. Update `QuizProgress`

Currently, `QuizProgress` only tracks `passed`. We need `score` (percentage) and `totalQuestions`.

```typescript
// apps/cli/src/backend/types.ts

export interface QuizProgress {
  passed: boolean;
  score: number; // 0-100 percentage
  totalQuestions: number; // Total questions in the quiz
  xpEarned: number;
  completedAt: string;
}

// Update Progress interface (no change needed if using Record<string, QuizProgress>)
export interface Progress {
  stats: ProgressStats;
  exercises: Record<string, ExerciseProgress>;
  quizzes: Record<string, QuizProgress>;
  achievements: string[];
}
```

### 3.2. Update Manifest Entry

The frontend needs to know if an item is locked. We will add `isLocked` and `lockReason` to the manifest items.

```typescript
// apps/cli/src/backend/types.ts

export interface ManifestEntry {
  id: string;
  module: string;
  moduleTitle: string;
  name: string;
  exerciseName: string;
  friendlyName: string;
  path: string;
  markdownPath: string | null;
  hasQuiz: boolean;
  type: "file" | "directory";
  // New Fields
  isLocked: boolean;
  lockReason?: string; // e.g., "Requires 80% on Intro Quiz"
}
```

## 4. Backend Implementation Details

### 4.1. Prerequisite Evaluator Logic (`apps/cli/src/backend/helpers.ts`)

We will create a helper class or function to evaluate prerequisites against the current `Progress`.

```typescript
// apps/cli/src/backend/helpers.ts

import type { Progress, CourseConfig } from "./types";

/**
 * Checks if a specific requirement is met.
 * Supported formats:
 * - "module:01_intro" (or just "module_01")
 * - "exercise:01_intro/01_hello"
 * - "quiz:01_intro/quiz.json:80"
 */
export function checkPrerequisite(req: string, progress: Progress, manifest: any): { met: boolean; reason?: string } {
  // Normalize requirement string
  const lowerReq = req.toLowerCase();

  // 1. Module Completion Check
  if (lowerReq.startsWith("module:") || lowerReq.startsWith("module_")) {
    const modId = lowerReq.replace("module:", "").replace("module_", "");

    // Check if all exercises in this module are passed
    const exercisesInModule = manifest[modId] || [];
    const allPassed = exercisesInModule.every((ex: any) => {
      // If it's an exercise, check progress
      if (progress.exercises[ex.id]?.status === 'pass') return true;
      // If it's a quiz (standalone), check quiz progress
      // Note: This logic depends on how standalone quizzes are stored.
      // Assuming 'ex.id' maps to a quiz ID if it's a pure quiz entry.
      return false;
    });

    if (!allPassed) return { met: false, reason: `Complete all exercises in Module ${modId}` };
    return { met: true };
  }

  // 2. Quiz Score Check
  if (lowerReq.startsWith("quiz:")) {
    // Format: quiz:<id>:<score?>
    const parts = req.split(':');
    const quizId = parts[1];
    const requiredScore = parts[2] ? parseInt(parts[2], 10) : 0;

    const quizProg = progress.quizzes[quizId];
    if (!quizProg) return { met: false, reason: `Complete quiz '${quizId}'` };

    if (requiredScore > 0 && quizProg.score < requiredScore) {
      return { met: false, reason: `Score at least ${requiredScore}% on quiz '${quizId}'` };
    }

    if (!quizProg.passed) return { met: false, reason: `Pass quiz '${quizId}'` };
    return { met: true };
  }

  // 3. Exercise Completion Check
  if (lowerReq.startsWith("exercise:")) {
    const exId = req.replace("exercise:", "");
    if (progress.exercises[exId]?.status !== 'pass') {
      return { met: false, reason: `Complete exercise '${exId}'` };
    }
    return { met: true };
  }

  return { met: true }; // Unknown requirement type, default to pass (or log warning)
}
```

### 4.2. Integrating into Manifest Generation (`scanAndGenerateManifest`)

The `scanAndGenerateManifest` function in `apps/cli/src/backend/helpers.ts` needs to be updated to:

1.  Read the `progression` config from `course.json`.
2.  Iterate through modules and exercises.
3.  Calculate `isLocked` for each item.

**Logic Update in `scanAndGenerateManifest`:**

```typescript
// Inside scanAndGenerateManifest...

const progressionMode = config.progression?.mode || "sequential";
const bypassMode = process.env.PROGY_BYPASS_MODE === "true";

let previousItemPassed = true; // For sequential locking

// Loop through modules (sorted)
for (const mod of modules) {
  // ... existing setup ...

  // Determine if Module itself is locked
  let moduleLocked = false;
  let moduleReason = "";

  if (!bypassMode) {
    // Check specific module prerequisites from info.toml
    if (parsedToml.module?.prerequisites) {
      for (const req of parsedToml.module.prerequisites) {
        const { met, reason } = checkPrerequisite(req, progress, manifest); // Need access to manifest/progress
        if (!met) {
          moduleLocked = true;
          moduleReason = reason || "Prerequisites not met";
          break;
        }
      }
    }

    // Sequential Module Locking (Optional)
    // If strict_module_order is true, check if previous module is complete.
  }

  // Loop through exercises/items in module
  for (const item of itemsInModule) {
     let isLocked = moduleLocked;
     let lockReason = moduleReason;

     if (!isLocked && !bypassMode) {
        // 1. Check Item-Specific Prerequisites (from info.toml [[exercises]])
        const itemPrereqs = exercisesFromToml[item.exerciseName]?.prerequisites;
        if (itemPrereqs) {
           for (const req of itemPrereqs) {
              const { met, reason } = checkPrerequisite(req, progress, manifest);
              if (!met) {
                 isLocked = true;
                 lockReason = reason || "Prerequisites not met";
                 break;
              }
           }
        }

        // 2. Sequential Locking
        // If mode is "sequential" and this item doesn't have specific prereqs,
        // it requires the *previous* item to be passed.
        if (!isLocked && progressionMode === "sequential" && !previousItemPassed) {
           isLocked = true;
           lockReason = "Complete previous lesson";
        }
     }

     // Add to manifest
     manifest[mod].push({
        ...item,
        isLocked,
        lockReason
     });

     // Update previousItemPassed for next iteration
     // Check if current item is passed in progress
     const isPassed = progress.exercises[item.id]?.status === 'pass' || progress.quizzes[item.id]?.passed;
     previousItemPassed = isPassed;
  }
}
```

### 4.3. Updating Quiz Submission (`apps/cli/src/backend/endpoints/progress.ts`)

The `updateProgressHandler` needs to calculate the score.

```typescript
// apps/cli/src/backend/endpoints/progress.ts

const updateProgressHandler: ServerType<"/progress/update"> = async (req) => {
  try {
    const { type, id, success, results } = await req.json() as any;
    // 'results' contains answers: { total: 10, correct: 8 } provided by frontend

    // ... existing setup ...

    if (type === 'quiz') {
      const score = results ? Math.round((results.correct / results.total) * 100) : (success ? 100 : 0);

      // Update logic
      if (!progress.quizzes[id] || progress.quizzes[id].score < score) {
         progress.quizzes[id] = {
            passed: success, // or score >= passingThreshold (e.g. 60)
            score: score,
            totalQuestions: results?.total || 0,
            xpEarned: calculateXp(score), // Dynamic XP?
            completedAt: now
         };
         // ... save progress ...
      }
    }
    // ... return ...
  } catch (e) {
    // ... error handling ...
  }
};
```

## 5. CLI Command Updates

We need to enable the instructor to bypass these checks.

### 5.1. Update `apps/cli/src/commands/course.ts`

Modify the `dev` command to accept `--bypass`.

```typescript
// apps/cli/src/commands/course.ts

program
  .command("dev")
  .description("Test course locally as GUEST")
  .option("--bypass", "Unlock all lessons for testing") // New Option
  .action(dev);

export async function dev(options: { offline?: boolean, bypass?: boolean }) {
  // ... setup ...

  // Pass to runServer
  await runServer(cwd, true, null, options.bypass);
}
```

### 5.2. Update `apps/cli/src/cli.ts` (Main Entry)

Pass the argument down.

```typescript
// apps/cli/src/cli.ts

async function runServer(runtimeCwd: string, isOffline: boolean, containerFile: string | null, bypass: boolean = false) {
  // ...
  const child = spawn("bun", ["run", serverPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      PROG_CWD: runtimeCwd,
      PROGY_OFFLINE: isOffline ? "true" : "false",
      PROGY_BYPASS_MODE: bypass ? "true" : "false" // Inject Env Var
    },
  });
  // ...
}
```

## 6. Frontend Integration Guide

The frontend will receive the updated manifest from `/exercises`.

**API Response Example:**

```json
{
  "01_intro": [
    {
      "id": "01_intro/01_hello",
      "name": "01_hello",
      "friendlyName": "Hello World",
      "isLocked": false
    },
    {
      "id": "01_intro/02_variables",
      "name": "02_variables",
      "friendlyName": "Variables",
      "isLocked": true,
      "lockReason": "Complete previous lesson"
    }
  ]
}
```

**Frontend Logic:**
1.  **Visual Indication:** Display a lock icon for items where `isLocked: true`.
2.  **Interaction:** Disable click/navigation for locked items.
3.  **Tooltip/Message:** Show `lockReason` when hovering over the lock icon or trying to access the item.
4.  **Quiz Results:** When submitting a quiz, display the score percentage to reinforce the requirement (e.g., "You got 70%. You need 80% to unlock the next lesson.").

## 7. Implementation Steps

1.  **Type Updates:** Modify `apps/cli/src/backend/types.ts` to include `score` in `QuizProgress` and lock fields in manifest.
2.  **Helper Logic:** Implement `checkPrerequisite` in `apps/cli/src/backend/helpers.ts`.
3.  **Manifest Logic:** Update `scanAndGenerateManifest` in `apps/cli/src/backend/helpers.ts` to use the prerequisite checker and `PROGY_BYPASS_MODE`.
4.  **Quiz Endpoint:** Update `apps/cli/src/backend/endpoints/progress.ts` to accept and store scores.
5.  **CLI Flag:** Update `apps/cli/src/commands/course.ts` and `apps/cli/src/cli.ts` to support `--bypass`.
6.  **Testing:**
    *   Create a test course with `info.toml` prerequisites.
    *   Verify locking works as expected.
    *   Verify `progy dev --bypass` unlocks everything.
    *   Verify quiz submission updates the score correctly.

## 8. Migration & Compatibility

*   **Existing Progress:** Old progress files won't have `score` in quizzes. The system should default to `score: 100` if `passed: true` and `score` is missing, or `0` otherwise, to prevent regressions for users who already completed quizzes.
*   **Default Behavior:** If no `progression` config is found in `course.json`, default to `sequential: true` (standard behavior) or `open` depending on product decision. We recommend `sequential` as the safe default for a learning platform.

## 9. Future Improvements

*   **Branched Paths:** Support `OR` logic in prerequisites (e.g., "Complete Quiz A OR Quiz B").
*   **Time-Gating:** "Unlock this lesson 24 hours after finishing the previous one."
*   **Achievement Gates:** "Unlock this bonus module by earning the 'Speedster' achievement."

---
*End of Implementation Plan*
