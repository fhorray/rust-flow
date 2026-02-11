import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { spawn } from "node:child_process";
import type { Progress, CourseConfig, SRPOutput, ProgressStats, SetupConfig, ManifestEntry } from "./types.ts";
import {
  PROG_CWD,
  PROG_DIR,
  PROGRESS_PATH,
  COURSE_CONFIG_PATH,
  MANIFEST_PATH
} from "./paths.ts";
import {
  getGlobalConfig,
  updateGlobalConfig,
  loadToken
} from "./config.ts";
import { logger } from "./logger.ts";
import { exists } from "./utils.ts";
import { DEFAULT_PROGRESS } from "@consts";

export { PROG_CWD, PROG_DIR, PROGRESS_PATH, COURSE_CONFIG_PATH, MANIFEST_PATH };

export const BACKEND_URL = process.env.PROGY_API_URL || "https://api.progy.dev";

/**
 * Checks if a specific requirement is met against current progress.
 */
export function checkPrerequisite(req: string, progress: Progress, manifest: Record<string, any[]>): { met: boolean; reason?: string } {
  const lowerReq = req.toLowerCase();

  // 1. Module Completion Check
  if (lowerReq.startsWith("module:") || lowerReq.startsWith("module_")) {
    const modId = lowerReq.replace("module:", "").replace("module_", "");
    const exercisesInModule = manifest[modId] || [];

    if (exercisesInModule.length === 0) return { met: true };

    const allPassed = exercisesInModule.every((ex: any) => {
      return progress.exercises[ex.id]?.status === 'pass' || progress.quizzes[ex.id]?.passed;
    });

    if (!allPassed) return { met: false, reason: `Complete all items in Module ${beautify(modId)}` };
    return { met: true };
  }

  // 2. Quiz Score Check
  if (lowerReq.startsWith("quiz:")) {
    const parts = req.split(':');
    const quizId = parts[1] as string;
    const requiredScore = parts[2] ? parseInt(parts[2], 10) : 0;

    const quizProg = progress.quizzes[quizId];
    if (!quizProg) return { met: false, reason: `Complete quiz '${beautify(quizId)}'` };

    if (requiredScore > 0) {
      const currentScore = quizProg.score ?? (quizProg.passed ? 100 : 0);
      if (currentScore < requiredScore) {
        return { met: false, reason: `Score at least ${requiredScore}% on quiz '${beautify(quizId)}'` };
      }
    }

    if (!quizProg.passed) return { met: false, reason: `Pass quiz '${beautify(quizId)}'` };
    return { met: true };
  }

  // 3. Exercise Completion Check
  if (lowerReq.startsWith("exercise:")) {
    const exId = req.replace("exercise:", "");
    if (progress.exercises[exId]?.status !== 'pass') {
      return { met: false, reason: `Complete exercise '${beautify(exId.split('/').pop() || exId)}'` };
    }
    return { met: true };
  }

  return { met: true };
}

// State
export let currentConfig: CourseConfig | null = null;
export let exerciseManifestCache: Record<string, any[]> | null = null;
export let exerciseManifestTimestamp: number = 0;

export async function getCourseConfig(): Promise<CourseConfig | null> {
  try {
    if (await exists(COURSE_CONFIG_PATH)) {
      const text = await readFile(COURSE_CONFIG_PATH, "utf-8");
      return JSON.parse(text);
    }
    return null;
  } catch (e) {
    logger.warn(`Failed to read course.json: ${e}`);
    return null;
  }
}

export async function ensureConfig() {
  if (!currentConfig) {
    currentConfig = await getCourseConfig();
  }
  return currentConfig;
}

export async function getProgress(): Promise<Progress> {
  const isOffline = process.env.PROGY_OFFLINE === "true";
  if (isOffline) {
    try {
      if (await exists(PROGRESS_PATH)) {
        const text = await readFile(PROGRESS_PATH, "utf-8");
        return JSON.parse(text);
      }
    } catch (e) {
      logger.warn(`Failed to read ${PROGRESS_PATH}: ${e}`);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  }

  await ensureConfig();
  const token = await loadToken();

  if (token && currentConfig?.id) {
    try {
      const cloudProgress = await fetchProgressFromCloud(currentConfig.id, token);
      return cloudProgress || JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
    } catch (e) {
      logger.error(`Failed to fetch cloud progress`, String(e));
      throw e;
    }
  }

  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
}

export async function saveProgress(progress: Progress) {
  const isOffline = process.env.PROGY_OFFLINE === "true";
  if (isOffline) {
    try {
      await mkdir(PROG_DIR, { recursive: true });
      await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    } catch (e) {
      console.error(`[ERROR] Failed to save local progress: ${e}`);
    }
    return;
  }

  await ensureConfig();
  const token = await loadToken();
  if (token && currentConfig?.id) {
    await syncProgressWithCloud(currentConfig.id, progress, token);
  }
}

async function syncProgressWithCloud(courseId: string, progress: Progress, token: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/progress/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId, data: progress })
    });
    if (res.ok) {
      console.log(`[ONLINE] Successfully saved to cloud.`);
    }
  } catch (e) {
    console.error(`[ONLINE] Connection error during save: ${e}`);
  }
}

async function fetchProgressFromCloud(courseId: string, token: string): Promise<Progress | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/progress/get?courseId=${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) return await res.json();
    if (res.status === 404) return null;
    throw new Error(`Cloud fetch failed with ${res.status}`);
  } catch (e) {
    throw e;
  }
}

export function updateStreak(stats: ProgressStats): ProgressStats {
  const today = new Date().toISOString().split('T')[0] as string;
  if (stats.lastActiveDate === today) return stats;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0] as string;

  if (stats.lastActiveDate === yesterdayStr) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  stats.lastActiveDate = today;
  return stats;
}

const beautify = (s: string) => s.replace(/_/g, ' ').replace(/([a-zA-Z])(\d+)/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());

export async function scanAndGenerateManifest(config: CourseConfig) {
  if (process.env.NODE_ENV !== 'test' && exerciseManifestCache && (Date.now() - exerciseManifestTimestamp < 5000)) {
    return exerciseManifestCache;
  }

  const bypassMode = process.env.PROGY_BYPASS_MODE === "true";
  const exercisesRelPath = config.content.exercises;
  const absExercisesPath = join(PROG_CWD, exercisesRelPath);
  if (process.env.NODE_ENV === 'test') console.log(`[DEBUG] absExercisesPath: ${absExercisesPath}`);

  if (!(await exists(absExercisesPath))) {
    if (process.env.NODE_ENV === 'test') console.log(`[DEBUG] absExercisesPath does not exist`);
    return {};
  }

  const allFiles = await readdir(absExercisesPath);
  const modules = allFiles.filter(m => !m.startsWith(".") && m !== "README.md" && m !== "mod.rs" && m !== "practice");
  if (process.env.NODE_ENV === 'test') console.log(`[DEBUG] modules: ${JSON.stringify(modules)}`);

  modules.sort((a, b) => {
    const numA = parseInt(a.split('_')[0] || "999");
    const numB = parseInt(b.split('_')[0] || "999");
    return numA - numB;
  });

  const manifest: Record<string, ManifestEntry[]> = {};
  const progress = await getProgress();
  const progressionMode = config.progression?.mode || "sequential";

  for (const mod of modules) {
    const modPath = join(absExercisesPath, mod);
    if (await exists(modPath) && (await stat(modPath)).isDirectory()) {
      manifest[mod] = [];
      let moduleTitle = beautify(mod);
      let moduleIcon: string | undefined = undefined;
      let completionMessage: string | undefined = undefined;
      let exercisesFromToml: any = {};
      let modulePrerequisites: string[] = [];

      const infoTomlPath = join(modPath, "info.toml");
      if (await exists(infoTomlPath)) {
        try {
          const infoContent = await readFile(infoTomlPath, "utf-8");
          const fixedContent = infoContent.replace(/^(\s*)(\d+[\w-]*)\s*=/gm, '$1"$2" =');
          const parsed = Bun.TOML.parse(fixedContent) as any;
          if (parsed.module?.title) moduleTitle = parsed.module.title;
          else if (parsed.module?.message) moduleTitle = parsed.module.message;
          if (parsed.module?.icon) moduleIcon = parsed.module.icon;
          if (parsed.module?.completion_message) completionMessage = parsed.module.completion_message;
          if (parsed.module?.prerequisites) modulePrerequisites = parsed.module.prerequisites;
          if (Array.isArray(parsed.exercises)) {
            for (const ex of parsed.exercises) { if (ex.name) exercisesFromToml[ex.name] = ex; }
          } else if (parsed.exercises && typeof parsed.exercises === 'object') {
            for (const [name, meta] of Object.entries(parsed.exercises)) {
              exercisesFromToml[name] = typeof meta === 'string' ? { title: meta } : meta;
            }
          }
        } catch (e) {
          console.warn(`[WARN] Failed to parse info.toml: ${e}`);
        }
      }

      // Evaluate Module Prerequisites
      let moduleLocked = false;
      let moduleLockReason = "";
      if (!bypassMode && modulePrerequisites.length > 0) {
        for (const req of modulePrerequisites) {
          const { met, reason } = checkPrerequisite(req, progress, manifest);
          if (!met) {
            moduleLocked = true;
            moduleLockReason = reason || "Module prerequisites not met";
            break;
          }
        }
      }

      const entries = await readdir(modPath, { withFileTypes: true });
      const entryMap = new Map<string, any>();
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "README.md" || entry.name === "mod.rs" || entry.name === "info.toml" || entry.name === "quiz.json") continue;
        entryMap.set(entry.name.split('.')[0] || "", entry);
      }

      let previousItemPassed = true;
      const processedKeys = new Set<string>();

      const addExerciseToManifest = async (exerciseKey: string, entry: any) => {
        let friendlyName = beautify(exerciseKey);
        if (exercisesFromToml[exerciseKey]?.title) friendlyName = exercisesFromToml[exerciseKey].title;

        let entryPath = join(modPath, entry.name);
        if (entry.isDirectory()) {
          const candidates = ["exercise.rs", "exercise.sql", "exercise.py", "exercise.ts", "exercise.js", "main.rs", "index.ts", "main.go", "index.js", "main.py"];
          for (const c of candidates) {
            const p = join(entryPath, c);
            if (await exists(p)) {
              entryPath = p;
              break;
            }
          }
        }

        if (await exists(entryPath) && (await stat(entryPath)).isFile()) {
          try {
            const content = await readFile(entryPath, "utf-8");
            const titleMatch = content.match(/\/\/\s*(?:Title|title):\s*(.+)/);
            if (titleMatch && titleMatch[1]) friendlyName = titleMatch[1].trim();
          } catch { }
        }

        let isLocked = moduleLocked;
        let lockReason = moduleLockReason;

        if (!isLocked && !bypassMode) {
          const itemPrereqs = exercisesFromToml[exerciseKey]?.prerequisites;
          if (Array.isArray(itemPrereqs)) {
            for (const req of itemPrereqs) {
              const { met, reason } = checkPrerequisite(req, progress, manifest);
              if (!met) {
                isLocked = true;
                lockReason = reason || "Prerequisites not met";
                break;
              }
            }
          }

          if (!isLocked && progressionMode === "sequential" && !previousItemPassed) {
            isLocked = true;
            lockReason = "Complete previous lesson";
          }
        }

        const id = `${mod}/${entry.name}`;
        const exMeta = exercisesFromToml[exerciseKey];

        manifest[mod]?.push({
          id,
          module: mod,
          moduleTitle,
          moduleIcon,
          completionMessage,
          name: entry.name,
          exerciseName: exerciseKey,
          friendlyName,
          path: relative(PROG_CWD, join(modPath, entry.name)),
          entryPoint: entry.isDirectory() ? entryPath.split(/[\\/]/).pop() : undefined,
          markdownPath: (entry.isDirectory() ? relative(PROG_CWD, join(modPath, entry.name, "README.md")) : (await exists(join(modPath, `${exerciseKey}.md`)) ? relative(PROG_CWD, join(modPath, `${exerciseKey}.md`)) : null)),
          hasQuiz: (entry.isDirectory() ? await exists(join(modPath, entry.name, "quiz.json")) : false),
          type: entry.isDirectory() ? "directory" : "file",
          isLocked,
          lockReason,
          tags: exMeta?.tags,
          difficulty: exMeta?.difficulty,
          xp: exMeta?.xp
        });

        const isPassed = !!(progress.exercises[id]?.status === 'pass' || progress.quizzes[id]?.passed);
        previousItemPassed = isPassed && !isLocked;
      };

      // 1. Ordered items from info.toml
      const orderedNames = Object.keys(exercisesFromToml);
      for (const exerciseKey of orderedNames) {
        const entry = entryMap.get(exerciseKey);
        if (entry) {
          processedKeys.add(exerciseKey);
          await addExerciseToManifest(exerciseKey, entry);
        }
      }

      // 2. Remaining items
      const remainingEntries = Array.from(entryMap.entries())
        .filter(([key]) => !processedKeys.has(key))
        .map(([_, entry]) => entry);

      remainingEntries.sort((a, b) => {
        const getWeight = (s: string) => {
          const m = s.match(/^(\d+)_/);
          return m ? parseInt(m[1] || "0") : 9999;
        };
        const wA = getWeight(a.name);
        const wB = getWeight(b.name);
        return wA !== wB ? wA - wB : a.name.localeCompare(b.name);
      });

      for (const entry of remainingEntries) {
        await addExerciseToManifest(entry.name.split('.')[0] || "", entry);
      }
    }
  }

  const practicePath = join(absExercisesPath, "practice");
  if (await exists(practicePath)) {
    manifest["practice"] = [];
    const practiceFiles = await readdir(practicePath);
    for (const p of practiceFiles) {
      if (p.endsWith(".rs") || p.endsWith(".ts") || p.endsWith(".js") || p.endsWith(".go")) {
        manifest["practice"].push({
          id: `practice/${p}`,
          module: "practice",
          moduleTitle: "Practice",
          name: p,
          exerciseName: p.split('.')[0] || p,
          friendlyName: beautify(p.split('.')[0] || p),
          path: join(practicePath, p),
          markdownPath: null,
          hasQuiz: false,
          type: "file",
          isLocked: false
        });
      }
    }
  }

  let totalEx = 0;
  for (const modExercises of Object.values(manifest)) {
    totalEx += modExercises.length;
  }

  try {
    if (progress.stats.totalExercises !== totalEx) {
      progress.stats.totalExercises = totalEx;
      await saveProgress(progress);
    }
  } catch (e) {
    console.warn(`[WARN] Failed to update total exercises in progress: ${e}`);
  }

  const progCwd = process.env.PROG_CWD || process.cwd();
  const progDir = join(progCwd, ".progy");
  await mkdir(progDir, { recursive: true });
  await writeFile(join(progDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  exerciseManifestCache = manifest;
  exerciseManifestTimestamp = Date.now();
  return manifest;
}

export async function runSetupChecks(config: SetupConfig) {
  const results = [];
  for (const check of config.checks) {
    if (check.type === 'command') {
      try {
        const parts = check.command.split(' ');
        const cmd = parts[0];
        if (!cmd) continue;
        const child = spawn(cmd, parts.slice(1), { stdio: 'ignore' }) as any;
        const success = await new Promise<boolean>((resolve) => {
          child.on('close', (code: number | null) => resolve(code === 0));
          child.on('error', () => resolve(false));
        });
        results.push({ name: check.name, status: success ? 'pass' as const : 'fail' as const, message: success ? 'Found' : 'Not found' });
      } catch (e) { results.push({ name: check.name, status: 'fail' as const, message: String(e) }); }
    }
  }
  return results;
}

export function parseRunnerOutput(rawOutput: string, exitCode: number): { success: boolean, output: string, friendlyOutput: string } {
  try {
    let jsonStr: string | null = null;
    const match = rawOutput.match(/__SRP_BEGIN__\s*([\s\S]*?)\s*__SRP_END__/);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    } else {
      const matches = rawOutput.match(/\{[\s\S]*\}/g);
      if (matches && matches.length > 0) jsonStr = matches[matches.length - 1]?.trim() ?? null;
    }

    if (jsonStr) {
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const srp = JSON.parse(jsonStr.substring(start, end + 1)) as SRPOutput;
        let friendly = `## ${srp.success ? '✅ Success' : '❌ Failed'}\n\n> ${srp.summary}\n\n`;
        if (srp.diagnostics?.length) {
          friendly += `### 📍 Diagnostics\n\n`;
          for (const d of srp.diagnostics) {
            friendly += `#### ${d.severity === 'error' ? '❌' : '⚠️'} ${d.severity.toUpperCase()}\n**${d.message}**\n`;
            if (d.file) friendly += `\`${d.file}:${d.line || 0}\`\n\n`;
            if (d.snippet) friendly += `\`\`\`rust\n${d.snippet}\n\`\`\`\n\n`;
            friendly += `---\n\n`;
          }
        }
        if (srp.tests?.length) {
          friendly += `### 🧪 Tests\n\n`;
          for (const t of srp.tests) friendly += `- ${t.status === 'pass' ? '✅' : '❌'} **${t.name}**\n${t.message ? `  > ${t.message.replace(/\n/g, '\n  > ')}\n\n` : ''}`;
        }
        if (srp.raw && srp.raw.trim()) {
          friendly += `### 📋 Output\n\n\`\`\`\n${srp.raw.trim()}\n\`\`\`\n`;
        }
        return { success: srp.success, output: srp.raw.trim(), friendlyOutput: friendly };
      }
    }
  } catch { }
  const errorKeywords = ["error during connect:", "permission denied", "unable to get image", "failed to solve", "The system cannot find the file specified"];
  const hasError = errorKeywords.some(k => rawOutput.toLowerCase().includes(k.toLowerCase()));
  const success = exitCode === 0 && !rawOutput.includes("❌") && !hasError;
  return { success, output: rawOutput, friendlyOutput: (success ? "✅ Success\n\n" : "❌ Failed\n\n") + rawOutput };
}
