import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import type { Progress, CourseConfig, SRPOutput, ProgressStats, SetupConfig } from "./types";
import {
  PROG_CWD,
  PROG_DIR,
  PROGRESS_PATH,
  COURSE_CONFIG_PATH,
  MANIFEST_PATH
} from "../core/paths";
import {
  getGlobalConfig,
  updateGlobalConfig,
  loadToken
} from "../core/config";
import { logger } from "../core/logger";

export { PROG_CWD, PROG_DIR, PROGRESS_PATH, COURSE_CONFIG_PATH, MANIFEST_PATH };

export const IS_OFFLINE = process.env.PROGY_OFFLINE === "true";
export const BACKEND_URL = process.env.PROGY_API_URL || "https://api.progy.dev";

export const DEFAULT_PROGRESS: Progress = {
  stats: {
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalExercises: 0
  },
  exercises: {},
  quizzes: {},
  achievements: []
};

// State
export let currentConfig: CourseConfig | null = null;
export let exerciseManifestCache: Record<string, any[]> | null = null;
export let exerciseManifestTimestamp: number = 0;

async function exists(path: string): Promise<boolean> {
  try {
    const s = await Bun.file(path).stat();
    return s.isFile() || s.isDirectory();
  } catch {
    return false;
  }
}

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
  if (IS_OFFLINE) {
    try {
      if (await exists(PROGRESS_PATH)) {
        const text = await readFile(PROGRESS_PATH, "utf-8");
        const localProgress = JSON.parse(text);
        logger.info(`📊 Progress Synced: Local XP: ${localProgress?.stats.totalXp}`, "OFFLINE");
        return localProgress;
      }
    } catch (e) {
      logger.warn(`Failed to read ${PROGRESS_PATH}: ${e}`);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  }

  // ONLINE mode
  await ensureConfig();
  const token = await loadToken();

  if (token && currentConfig?.id) {
    logger.info(`Fetching progress for ${currentConfig.id}...`, "ONLINE");
    try {
      const cloudProgress = await fetchProgressFromCloud(currentConfig.id, token);
      if (cloudProgress) {
        logger.info(`Loaded cloud progress. XP: ${cloudProgress.stats.totalXp}`, "ONLINE");
        return cloudProgress;
      } else {
        logger.info(`No existing cloud progress found. Returning default.`, "ONLINE");
        return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
      }
    } catch (e) {
      logger.error(`Failed to fetch cloud progress`, String(e));
      throw e;
    }
  }

  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
}

export async function saveProgress(progress: Progress) {
  if (IS_OFFLINE) {
    try {
      await mkdir(PROG_DIR, { recursive: true });
      await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
    } catch (e) {
      console.error(`[ERROR] Failed to save local progress: ${e}`);
    }
    return;
  }

  // ONLINE mode
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
    } else {
      console.warn(`[ONLINE] Cloud save failed: ${res.status}`);
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
  if (exerciseManifestCache && (Date.now() - exerciseManifestTimestamp < 5000)) {
    return exerciseManifestCache;
  }

  const exercisesRelPath = config.content.exercises;
  const absExercisesPath = join(PROG_CWD, exercisesRelPath);

  if (!(await exists(absExercisesPath))) return {};

  const allFiles = await readdir(absExercisesPath);
  const modules = allFiles.filter(m => !m.startsWith(".") && m !== "README.md" && m !== "mod.rs" && m !== "practice");

  modules.sort((a, b) => {
    const numA = parseInt(a.split('_')[0] || "999");
    const numB = parseInt(b.split('_')[0] || "999");
    return numA - numB;
  });

  const manifest: Record<string, any[]> = {};

  async function addExerciseToManifest(mod: string, entry: any, exerciseKey: string, moduleTitle: string, exercisesFromToml: any, modPath: string, manifest: any) {
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

    const commonObj = {
      id: `${mod}/${entry.name}`,
      module: mod,
      moduleTitle: moduleTitle,
      name: entry.name,
      exerciseName: exerciseKey,
      friendlyName: friendlyName,
      path: join(modPath, entry.name),
    };

    if (entry.isDirectory()) {
      const quizPath = join(modPath, entry.name, "quiz.json");
      manifest[mod].push({
        ...commonObj,
        markdownPath: join(modPath, entry.name, "README.md"),
        hasQuiz: await exists(quizPath),
        type: "directory"
      });
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.test.ts') || entry.name === 'package.json') return;
      const moduleReadmePath = join(modPath, "README.md");
      const moduleQuizPath = join(modPath, "quiz.json");
      const exerciseReadmePath = join(modPath, `${entry.name.split('.')[0]}.md`);

      let markdownPath = null;
      if (await exists(exerciseReadmePath)) markdownPath = exerciseReadmePath;
      else if (await exists(moduleReadmePath)) markdownPath = moduleReadmePath;

      manifest[mod].push({
        ...commonObj,
        markdownPath: markdownPath,
        hasQuiz: await exists(moduleQuizPath),
        type: "file"
      });
    }
  }

  for (const mod of modules) {
    const modPath = join(absExercisesPath, mod);
    const s = await stat(modPath);

    if (s.isDirectory()) {
      manifest[mod] = [];
      const entries = await readdir(modPath, { withFileTypes: true });
      let moduleTitle = beautify(mod);
      let exercisesFromToml: Record<string, any> = {};
      const infoTomlPath = join(modPath, "info.toml");

      if (await exists(infoTomlPath)) {
        try {
          const infoContent = await readFile(infoTomlPath, "utf-8");
          const fixedContent = infoContent.replace(/^(\s*)(\d+[\w-]*)\s*=/gm, '$1"$2" =');
          const parsed = Bun.TOML.parse(fixedContent) as any;
          if (parsed.module?.message) moduleTitle = parsed.module.message;
          if (Array.isArray(parsed.exercises)) {
            for (const ex of parsed.exercises) { if (ex.name) exercisesFromToml[ex.name] = ex; }
          } else if (parsed.exercises && typeof parsed.exercises === 'object') {
            for (const [name, meta] of Object.entries(parsed.exercises)) {
              exercisesFromToml[name] = typeof meta === 'string' ? { title: meta } : meta;
            }
          }
        } catch (e) { console.warn(`[WARN] Failed to parse info.toml: ${e}`); }
      }

      const getSortWeight = (s: string) => {
        const match = s.match(/^(\d+)_/);
        return match ? parseInt(match[1] || "0") : 9999;
      };

      const entryMap = new Map<string, any>();
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "README.md" || entry.name === "mod.rs" || entry.name === "info.toml" || entry.name === "quiz.json") continue;
        entryMap.set(entry.name.split('.')[0] || "", entry);
      }

      const orderedNames = Object.keys(exercisesFromToml);
      const processedKeys = new Set<string>();

      for (const exerciseKey of orderedNames) {
        const entry = entryMap.get(exerciseKey);
        if (entry) {
          processedKeys.add(exerciseKey);
          await addExerciseToManifest(mod, entry, exerciseKey, moduleTitle, exercisesFromToml, modPath, manifest);
        }
      }

      const remainingEntries = entries.filter(e => {
        const key = e.name.split('.')[0] || "";
        return !processedKeys.has(key) && !e.name.startsWith(".") && e.name !== "README.md" && e.name !== "mod.rs" && e.name !== "info.toml" && e.name !== "quiz.json";
      });

      remainingEntries.sort((a, b) => {
        const wA = getSortWeight(a.name || "");
        const wB = getSortWeight(b.name || "");
        return wA !== wB ? wA - wB : (a.name || "").localeCompare(b.name || "");
      });

      for (const entry of remainingEntries) {
        await addExerciseToManifest(mod, entry, entry.name.split('.')[0] || "", moduleTitle, exercisesFromToml, modPath, manifest);
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
          name: p,
          exerciseName: p.split('.')[0],
          path: join(practicePath, p),
          markdownPath: null,
          type: "file"
        });
      }
    }
  }

  let totalEx = 0;
  for (const modExercises of Object.values(manifest)) {
    totalEx += modExercises.length;
  }

  try {
    const progress = await getProgress();
    if (progress.stats.totalExercises !== totalEx) {
      progress.stats.totalExercises = totalEx;
      await saveProgress(progress);
    }
  } catch (e) {
    console.warn(`[WARN] Failed to update total exercises in progress: ${e}`);
  }

  await mkdir(PROG_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
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
        // Include raw output (e.g., SQL query results) in friendly view
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
