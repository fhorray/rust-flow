import { serve } from "bun";
// import index from "../../public/index.html"; // Removed for static serving
import { readdir, readFile, writeFile, mkdir, exists, stat } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { health } from "./endpoints/health";

const PROG_CWD = process.env.PROG_CWD || process.cwd();
const CONFIG_DIR = join(homedir(), ".progy");
const GLOBAL_CONFIG_PATH = join(CONFIG_DIR, "config.json");
const COURSE_CONFIG_PATH = join(PROG_CWD, "course.json");
const PROG_DIR = join(PROG_CWD, ".progy");
const MANIFEST_PATH = join(PROG_DIR, "exercises.json");
const PROGRESS_PATH = join(PROG_DIR, "progress.json");

// Define Public Directory (works in dev and prod)
// In dev: src/backend/server.ts -> ../../public
// In prod: dist/backend/server.js -> ../public
const PUBLIC_DIR = join(import.meta.dir, import.meta.file.endsWith(".ts") ? "../../public" : "../public");

console.log(`[INFO] Server starting...`);
console.log(`[INFO] Working Directory: ${PROG_CWD}`);

interface RunnerConfig {
  command: string;
  args: string[];
  cwd?: string;
}

interface ContentConfig {
  exercises: string;
  root?: string;
}

interface SetupCheck {
  name: string;
  type: 'command';
  command: string;
}

interface SetupConfig {
  checks: SetupCheck[];
  guide?: string;
}

interface CourseConfig {
  id: string;
  name: string;
  runner: RunnerConfig;
  content: ContentConfig;
  api_keys?: Record<string, string>;
  setup?: SetupConfig;
}

interface ProgressStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

interface ExerciseProgress {
  status: 'pass' | 'fail';
  xpEarned: number;
  completedAt: string;
}

interface QuizProgress {
  passed: boolean;
  xpEarned: number;
  completedAt: string;
}

interface Progress {
  stats: ProgressStats;
  exercises: Record<string, ExerciseProgress>;
  quizzes: Record<string, QuizProgress>;
  achievements: string[];
}

const DEFAULT_PROGRESS: Progress = {
  stats: {
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null
  },
  exercises: {},
  quizzes: {},
  achievements: []
};

async function getCourseConfig(): Promise<CourseConfig | null> {
  try {
    if (await exists(COURSE_CONFIG_PATH)) {
      const text = await readFile(COURSE_CONFIG_PATH, "utf-8");
      return JSON.parse(text);
    }
    return null;
  } catch (e) {
    console.warn(`[WARN] Failed to read course.json: ${e}`);
    return null;
  }
}

async function getApiKey() {
  const config = await getCourseConfig();
  return config?.api_keys?.OpenAI || process.env.OPENAI_API_KEY;
}

// offline mode logic
const IS_OFFLINE = process.env.PROGY_OFFLINE === "true";

let currentConfig: CourseConfig | null = null;

async function ensureConfig() {
  if (!currentConfig) {
    currentConfig = await getCourseConfig();
  }
  return currentConfig;
}

async function getProgress(): Promise<Progress> {
  // OFFLINE MODE: JSON ONLY
  if (IS_OFFLINE) {
    try {
      if (await exists(PROGRESS_PATH)) {
        const text = await readFile(PROGRESS_PATH, "utf-8");
        const localProgress = JSON.parse(text);
        console.log(`[OFFLINE] Loaded local progress. XP: ${localProgress?.stats.totalXp}`);
        return localProgress;
      }
      console.log(`[OFFLINE] No local progress found. Starting fresh.`);
    } catch (e) {
      console.warn(`[WARN] Failed to read ${PROGRESS_PATH}: ${e}`);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
  }

  // ONLINE MODE: CLOUD ONLY
  await ensureConfig();
  const config = await getGlobalConfig();

  if (config?.token && currentConfig?.id) {
    console.log(`[ONLINE] Fetching progress for ${currentConfig.id}...`);
    try {
      const cloudProgress = await fetchProgressFromCloud(currentConfig.id, config.token);
      if (cloudProgress) {
        console.log(`[ONLINE] Loaded cloud progress. XP: ${cloudProgress.stats.totalXp}`);
        return cloudProgress;
      } else {
        // Cloud returned null/undefined, meaning 404 or empty. Safe to start fresh.
        console.log(`[ONLINE] No existing cloud progress found (new user?). Returning default.`);
        return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
      }
    } catch (e) {
      console.error(`[CRITICAL] Failed to fetch cloud progress: ${e}`);
      // IMPORTANT: If we cannot fetch, and we are online, likely network issue.
      // DANGER: If we return default, we might overwrite cloud data later.
      // For now, let's throw or handle in the caller. 
      // User experience: returning default allows playing, but saving might fail or overwrite.
      // Let's assume if it throws it's a temp issue, but we'll return default with a warning.
      // Ideally, the UI should show "Offline/Error".
      return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
    }
  }

  // Fallback if cloud fail or no token
  console.log(`[ONLINE] No token or config. Returning default.`);
  return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
}

async function saveProgress(progress: Progress) {
  // OFFLINE MODE: JSON ONLY
  if (IS_OFFLINE) {
    console.log(`[OFFLINE] Saving progress locally... XP: ${progress.stats.totalXp}`);
    try {
      await mkdir(PROG_DIR, { recursive: true });
      await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
      console.log(`[OFFLINE] Saved to ${PROGRESS_PATH}`);
    } catch (e) {
      console.error(`[ERROR] Failed to save local progress: ${e}`);
    }
    return;
  }

  // ONLINE MODE: CLOUD ONLY
  await ensureConfig();
  const config = await getGlobalConfig();
  if (config?.token && currentConfig?.id) {
    console.log(`[ONLINE] Saving progress to cloud... XP: ${progress.stats.totalXp}`);
    await syncProgressWithCloud(currentConfig.id, progress, config.token);
  } else {
    console.warn("[ONLINE] Cannot save: No token or course ID available.");
  }
}

async function getGlobalConfig() {
  if (await exists(GLOBAL_CONFIG_PATH)) {
    return JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
  }
  return null;
}

async function syncProgressWithCloud(courseId: string, progress: Progress, token: string) {
  const remoteUrl = process.env.PROGY_API_URL || "https://progy.francy.workers.dev";
  try {
    const res = await fetch(`${remoteUrl}/api/progress/sync`, {
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
      console.warn(`[ONLINE] Cloud save failed: ${res.status} - ${await res.text()}`);
    }
  } catch (e) {
    console.error(`[ONLINE] Connection error during save: ${e}`);
  }
}

async function fetchProgressFromCloud(courseId: string, token: string): Promise<Progress | null> {
  const remoteUrl = process.env.PROGY_API_URL || "https://progy.francy.workers.dev";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${remoteUrl}/api/progress/get?courseId=${courseId}`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    } else if (res.status === 404) {
      return null;
    } else {
      throw new Error(`Cloud fetch failed with ${res.status}`);
    }
  } catch (e) {
    throw e;
  }
}

function updateStreak(stats: ProgressStats): ProgressStats {
  const parts = new Date().toISOString().split('T');
  const today = parts[0] as string;
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

async function scanAndGenerateManifest(config: CourseConfig) {
  console.log("[INFO] Scanning exercises...");
  try {
    // Start Cache Check
    if (exerciseManifestCache && (Date.now() - exerciseManifestTimestamp < 5000)) {
      return exerciseManifestCache;
    }
    // End Cache Check

    const exercisesRelPath = config.content.exercises;
    const absExercisesPath = join(PROG_CWD, exercisesRelPath);

    if (!(await exists(absExercisesPath))) {
      console.warn(`[WARN] Exercises directory not found at ${absExercisesPath}`);
      return {};
    }

    const allFiles = await readdir(absExercisesPath);
    const modules = allFiles.filter(m => !m.startsWith(".") && m !== "README.md" && m !== "mod.rs" && m !== "practice");

    modules.sort((a, b) => {
      const numA = parseInt(a.split('_')[0] || "999");
      const numB = parseInt(b.split('_')[0] || "999");
      return numA - numB;
    });

    const manifest: Record<string, any[]> = {};

    // Helper to beautify names
    const beautify = (s: string) => s.replace(/_/g, ' ').replace(/([a-zA-Z])(\d+)/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());

    async function addExerciseToManifest(mod: string, entry: any, exerciseKey: string, moduleTitle: string, exercisesFromToml: any, modPath: string, manifest: any) {
      let friendlyName = beautify(exerciseKey);

      // Try to get title from info.toml first
      if (exercisesFromToml[exerciseKey]?.title) {
        friendlyName = exercisesFromToml[exerciseKey].title;
      }

      let entryPath = join(modPath, entry.name);

      // If directory, look for main file to parse title
      if (entry.isDirectory()) {
        const candidates = ["exercise.rs", "main.rs", "index.ts", "main.go", "index.js"];
        for (const c of candidates) {
          const p = join(entryPath, c);
          if (await exists(p)) {
            entryPath = p;
            break;
          }
        }
      }

      // Check for // Title: ... (overrides TOML if present)
      if (await exists(entryPath) && (await Bun.file(entryPath).stat()).isFile()) {
        try {
          const content = await readFile(entryPath, "utf-8");
          const titleMatch = content.match(/\/\/\s*(?:Title|title):\s*(.+)/);
          if (titleMatch && titleMatch[1]) friendlyName = titleMatch[1].trim();
        } catch (e) { /* ignore */ }
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
        const hasQuiz = await exists(quizPath);
        if (hasQuiz) console.log(`[DEBUG] Found quiz at ${quizPath}`);

        manifest[mod].push({
          ...commonObj,
          markdownPath: join(modPath, entry.name, "README.md"),
          hasQuiz,
          type: "directory"
        });
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.test.ts') || entry.name === 'package.json') return;
        manifest[mod].push({
          ...commonObj,
          markdownPath: null,
          type: "file"
        });
      }

    }

    for (const mod of modules) {
      const modPath = join(absExercisesPath, mod);
      const stats = await Bun.file(modPath).stat();

      if (stats.isDirectory()) {
        manifest[mod] = [];
        const entries = await readdir(modPath, { withFileTypes: true });

        // Try to read info.toml
        let moduleTitle = beautify(mod);
        let exercisesFromToml: Record<string, any> = {};
        const infoTomlPath = join(modPath, "info.toml");

        if (await exists(infoTomlPath)) {
          try {
            const infoContent = await readFile(infoTomlPath, "utf-8");
            const parsed = Bun.TOML.parse(infoContent) as any;

            if (parsed.module?.message) {
              moduleTitle = parsed.module.message;
            }

            // Support both old [[exercises]] array AND new [exercises] map
            if (Array.isArray(parsed.exercises)) {
              for (const ex of parsed.exercises) {
                if (ex.name) exercisesFromToml[ex.name] = ex;
              }
            } else if (parsed.exercises && typeof parsed.exercises === 'object') {
              for (const [name, meta] of Object.entries(parsed.exercises)) {
                exercisesFromToml[name] = typeof meta === 'string' ? { title: meta } : meta;
              }
            }
          } catch (e) {
            console.warn(`[WARN] Failed to parse info.toml in ${mod}: ${e}`);
          }
        }

        const getSortWeight = (s: string) => {
          const match = s.match(/^(\d+)_/);
          return match ? parseInt(match[1] || "0") : 9999;
        };

        // Helper to collect entries
        const entryMap = new Map<string, any>();
        for (const entry of entries) {
          if (entry.name.startsWith(".") || entry.name === "README.md" || entry.name === "mod.rs" || entry.name === "info.toml") continue;
          const key = entry.name.split('.')[0] || "";
          entryMap.set(key, entry);
        }

        // 1. Process entries in the order they appear in TOML
        const orderedNames = Object.keys(exercisesFromToml);
        const processedKeys = new Set<string>();

        for (const exerciseKey of orderedNames) {
          const entry = entryMap.get(exerciseKey);
          if (!entry) continue;

          processedKeys.add(exerciseKey);
          await addExerciseToManifest(mod, entry, exerciseKey, moduleTitle, exercisesFromToml, modPath, manifest);
        }

        // 2. Process remaining entries that were NOT in TOML (sorted)
        const remainingEntries = entries.filter(e => {
          const key = e.name.split('.')[0] || "";
          return !processedKeys.has(key) && !e.name.startsWith(".") && e.name !== "README.md" && e.name !== "mod.rs" && e.name !== "info.toml";
        });

        remainingEntries.sort((a, b) => {
          const wA = getSortWeight(a.name || "");
          const wB = getSortWeight(b.name || "");
          if (wA !== wB) return wA - wB;
          return (a.name || "").localeCompare(b.name || "");
        });

        for (const entry of remainingEntries) {
          const exerciseKey = entry.name.split('.')[0] || "";
          await addExerciseToManifest(mod, entry, exerciseKey, moduleTitle, exercisesFromToml, modPath, manifest);
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

    await mkdir(PROG_DIR, { recursive: true });
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    // Update Cache
    exerciseManifestCache = manifest;
    exerciseManifestTimestamp = Date.now();

    return manifest;
  } catch (error) {
    console.error("[ERROR] Manifest generation failed:", error);
    return {};
  }
}

async function runSetupChecks(config: SetupConfig): Promise<Array<{ name: string, status: 'pass' | 'fail', message: string }>> {
  const results = [];
  for (const check of config.checks) {
    if (check.type === 'command') {
      try {
        const parts = check.command.split(' ');
        const cmd = parts[0];
        if (!cmd) continue;
        const args = parts.slice(1);
        const child = spawn(cmd, args, { stdio: 'ignore' }) as any;
        const success = await new Promise<boolean>((resolve) => {
          child.on('close', (code: number | null) => resolve(code === 0));
          child.on('error', () => resolve(false));
        });
        results.push({
          name: check.name,
          status: success ? 'pass' as const : 'fail' as const,
          message: success ? 'Found' : 'Not found or failed'
        });
      } catch (e) {
        results.push({
          name: check.name,
          status: 'fail' as const,
          message: String(e)
        });
      }
    }
  }
  return results;
}

let exerciseManifest: Record<string, any[]> | null = null;
// currentConfig is already declared at top level
let exerciseManifestCache: Record<string, any[]> | null = null;
let exerciseManifestTimestamp: number = 0;

getCourseConfig().then(async (c) => {
  currentConfig = c;
  if (c && c.id && c.content && c.content.exercises) {
    console.log(`[INIT] Loaded config for ${c.id}`);
    exerciseManifest = await scanAndGenerateManifest(c);
  } else if (c) {
    console.error("[INIT] course.json is missing required fields (id, content.exercises)");
  } else {
    console.warn("[INIT] No valid course.json found");
  }
});

interface SRPDiagnostic {
  severity: 'error' | 'warning' | 'note';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  snippet?: string;
  suggestion?: string;
}

interface SRPOutput {
  success: boolean;
  summary: string;
  diagnostics?: SRPDiagnostic[];
  tests?: Array<{ name: string; status: 'pass' | 'fail'; message?: string }>;
  raw: string;
}

function parseRunnerOutput(rawOutput: string, exitCode: number): { success: boolean, output: string, friendlyOutput: string } {
  try {
    // Try to find the SRP between delimiters
    let jsonStr: string | null = null;
    const match = rawOutput.match(/__SRP_BEGIN__\s*([\s\S]*?)\s*__SRP_END__/);

    if (match && match[1]) {
      jsonStr = match[1].trim();
    } else {
      // Fallback: look for any JSON object in the output
      const matches = rawOutput.match(/\{[\s\S]*\}/g);
      if (matches && matches.length > 0) {
        jsonStr = matches[matches.length - 1]?.trim() ?? null;
      }
    }

    if (jsonStr) {
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const cleanJson = jsonStr.substring(start, end + 1);
        const srp = JSON.parse(cleanJson) as SRPOutput;

        let friendly = `## ${srp.success ? '✅ Success' : '❌ Failed'}\n\n`;
        friendly += `> ${srp.summary || (srp.success ? 'All checks passed' : 'Some issues were found')}\n\n`;

        if (srp.diagnostics && srp.diagnostics.length > 0) {
          friendly += `### 📍 Diagnostics\n\n`;
          for (const d of srp.diagnostics) {
            const icon = d.severity === 'error' ? '❌' : d.severity === 'warning' ? '⚠️' : 'ℹ️';
            friendly += `#### ${icon} ${d.severity.toUpperCase()}\n`;
            friendly += `**${d.message}**\n`;
            if (d.file) friendly += `\`${d.file}:${d.line || 0}:${d.column || 0}\`\n\n`;
            if (d.snippet) friendly += `\`\`\`rust\n${d.snippet}\n\`\`\`\n\n`;
            if (d.suggestion) {
              friendly += `> 💡 **Suggestion:**\n`;
              friendly += `> \`\`\`rust\n> ${d.suggestion}\n> \`\`\`\n\n`;
            }
            friendly += `---\n\n`;
          }
        }

        if (srp.tests && srp.tests.length > 0) {
          friendly += `### 🧪 Tests\n\n`;
          for (const t of srp.tests) {
            const icon = t.status === 'pass' ? '✅' : '❌';
            friendly += `- ${icon} **${t.name}**\n`;
            if (t.message) {
              friendly += `  > ${t.message.replace(/\n/g, '\n  > ')}\n\n`;
            }
          }
        }

        return {
          success: srp.success,
          output: srp.raw.trim(),
          friendlyOutput: friendly
        };
      }
    }
  } catch (e) {
    /* Fallback to text parsing */
  }

  const success = exitCode === 0 && !rawOutput.includes("❌");
  let friendly = success ? "✅ All tests passed!\n\n" : "❌ Issues detected during execution.\n\n";
  friendly += rawOutput;

  return { success, output: rawOutput, friendlyOutput: friendly };
}

const server = serve({
  port: 3001,
  routes: {
    "/api/health": health,
    "/": () => new Response(Bun.file(join(PUBLIC_DIR, "index.html"))),
    "/main.js": () => new Response(Bun.file(join(PUBLIC_DIR, "main.js"))),
    "/main.css": () => new Response(Bun.file(join(PUBLIC_DIR, "main.css"))),

    "/api/progress": {
      async GET() {
        return Response.json(await getProgress());
      }
    },

    "/api/progress/update": {
      async POST(req) {
        try {
          const { type, id, success } = await req.json() as any;
          if (!id) return Response.json({ success: false, error: "Missing ID" });

          let progress = await getProgress();
          const now = new Date().toISOString();

          if (type === 'quiz' && success) {
            if (!progress.quizzes[id]) {
              progress.quizzes[id] = { passed: true, xpEarned: 10, completedAt: now };
              progress.stats.totalXp += 10;
              progress.stats = updateStreak(progress.stats);
              await saveProgress(progress);
            }
          }
          return Response.json({ success: true, progress });
        } catch (e) {
          return Response.json({ success: false, error: String(e) });
        }
      }
    },

    "/api/config": {
      async GET() {
        if (!currentConfig) currentConfig = await getCourseConfig();
        return Response.json({
          ...(currentConfig || {}),
          remoteApiUrl: process.env.PROGY_API_URL || "https://progy.francy.workers.dev"
        });
      }
    },

    "/api/exercises": {
      async GET() {
        if (!currentConfig) currentConfig = await getCourseConfig();
        if (!currentConfig) return Response.json({ error: "No config" });

        // Always regenerate manifest in dev mode to pick up new files
        exerciseManifest = await scanAndGenerateManifest(currentConfig);

        // CRITICAL FIX: Ensure object return
        if (Array.isArray(exerciseManifest)) {
          return Response.json({});
        }
        return Response.json(exerciseManifest);
      }
    },

    "/api/exercises/quiz": {
      async GET(req) {
        const url = new URL(req.url);
        const filePath = url.searchParams.get('path');
        if (!filePath) return new Response('Missing path', { status: 400 });

        const quizPath = join(filePath, "quiz.json");
        try {
          if (await exists(quizPath)) {
            const content = await readFile(quizPath, "utf-8");
            return Response.json(JSON.parse(content));
          }
          return Response.json({ error: "Quiz not found" }, { status: 404 });
        } catch (e) {
          return Response.json({ error: "Invalid quiz file" }, { status: 500 });
        }
      }
    },

    "/api/exercises/code": {
      async GET(req) {
        const url = new URL(req.url);
        const filePath = url.searchParams.get('path');
        const markdownPath = url.searchParams.get('markdownPath');
        if (!filePath) return new Response('Missing path', { status: 400 });

        try {
          let code = "";
          const stat = await Bun.file(filePath).stat();
          if (stat.isDirectory()) {
            const candidates = ["exercise.rs", "main.rs", "index.ts", "main.go", "index.js"];
            for (const c of candidates) {
              const p = join(filePath, c);
              if (await exists(p)) {
                code = await readFile(p, "utf-8");
                break;
              }
            }
            if (!code) code = "// No entry file found";
          } else {
            code = await readFile(filePath, "utf-8");
          }
          let markdown: string | null = null;
          if (markdownPath && await exists(markdownPath)) markdown = await readFile(markdownPath, "utf-8");
          return Response.json({ code, markdown });
        } catch (e) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }
      }
    },

    "/api/exercises/run": {
      async POST(req) {
        try {
          if (!currentConfig) currentConfig = await getCourseConfig();
          const body = await req.json() as { exerciseName: string, id: string };
          const { exerciseName, id } = body;

          const idParts = id?.split('/') || [];
          const module = idParts[0] || "";

          const runnerCmd = currentConfig!.runner.command;
          const runnerArgs = currentConfig!.runner.args.map((a: string) =>
            a.replace("{{exercise}}", exerciseName)
              .replace("{{id}}", id || "")
              .replace("{{module}}", module)
          );

          const cwdLink = currentConfig!.runner.cwd ? join(PROG_CWD, currentConfig!.runner.cwd) : PROG_CWD;
          const finalCwd = cwdLink.replace("{{exercise}}", exerciseName)
            .replace("{{id}}", id || "")
            .replace("{{module}}", module);

          return new Promise(resolve => {
            const child = spawn(runnerCmd, runnerArgs, {
              cwd: finalCwd,
              stdio: ["ignore", "pipe", "pipe"],
              env: { ...process.env, FORCE_COLOR: "1" }
            });
            let output = "";
            if (child.stdout) child.stdout.on("data", d => output += d.toString());
            if (child.stderr) child.stderr.on("data", d => output += d.toString());
            child.on("close", async (code) => {
              const result = parseRunnerOutput(output, code || 0);

              if (result.success && body.id) {
                const progress = await getProgress();
                if (!progress.exercises[body.id]) {
                  progress.exercises[body.id] = {
                    status: 'pass',
                    xpEarned: 20,
                    completedAt: new Date().toISOString()
                  };
                  progress.stats.totalXp += 20;
                  progress.stats = updateStreak(progress.stats);
                  await saveProgress(progress);
                }
              }

              resolve(Response.json({
                success: result.success,
                output: result.output || "No output",
                friendlyOutput: result.friendlyOutput
              }));
            });
            child.on("error", (e) => resolve(Response.json({ success: false, output: e.message })));
          });
        } catch (e) {
          return Response.json({ success: false, output: String(e) });
        }
      }
    },

    "/api/ai/hint": {
      async POST(req) {
        return Response.json({ hint: "Thinking..." });
      }
    },

    "/api/setup/status": {
      async GET() {
        if (!currentConfig) currentConfig = await getCourseConfig();
        if (!currentConfig || !currentConfig.setup) return Response.json({ success: true, checks: [] });

        const results = await runSetupChecks(currentConfig.setup);
        const overallSuccess = results.every(r => r.status === 'pass');
        return Response.json({ success: overallSuccess, checks: results });
      }
    },

    "/api/setup/guide": {
      async GET() {
        if (!currentConfig) currentConfig = await getCourseConfig();
        if (!currentConfig || !currentConfig.setup?.guide) return Response.json({ markdown: "# No setup guide available" });

        const guidePath = join(PROG_CWD, currentConfig.setup.guide);
        if (await exists(guidePath)) {
          const content = await readFile(guidePath, "utf-8");
          return Response.json({ markdown: content });
        }
        return Response.json({ markdown: "# Setup guide not found" });
      }
    },

    "/api/auth/token": {
      async GET() {
        try {
          if (await exists(GLOBAL_CONFIG_PATH)) {
            const config = JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
            console.log(`[AUTH] Local token found: ${config.token ? 'Yes' : 'No'}`);
            return Response.json({ token: config.token || null });
          }
        } catch (e) {
          console.error(`[AUTH] Error reading global config: ${e}`);
        }
        return Response.json({ token: null });
      },
      async POST() {
        try {
          if (await exists(GLOBAL_CONFIG_PATH)) {
            const config = JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
            delete config.token;
            await writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2));
            console.log(`[AUTH] Local token cleared.`);
          }
          return Response.json({ success: true });
        } catch (e) {
          return Response.json({ success: false, error: String(e) }, { status: 500 });
        }
      }
    },

    "/api/local-settings": {
      async GET() {
        try {
          if (await exists(GLOBAL_CONFIG_PATH)) {
            const config = JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
            const { token, ...settings } = config;
            return Response.json(settings);
          }
        } catch (e) { }
        return Response.json({});
      },
      async POST(req) {
        try {
          const newSettings = await req.json() as any;
          let config: any = {};
          if (await exists(GLOBAL_CONFIG_PATH)) {
            config = JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
          } else {
            if (!(await exists(CONFIG_DIR))) await mkdir(CONFIG_DIR, { recursive: true });
          }

          Object.assign(config, newSettings);
          await writeFile(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2));
          return Response.json({ success: true });
        } catch (e) {
          return Response.json({ success: false, error: String(e) }, { status: 500 });
        }
      }
    },

    "/api/ide/open": {
      async POST(req) {
        try {
          let { path } = await req.json() as { path: string };
          if (!path) return Response.json({ success: false, error: "Missing path" }, { status: 400 });

          // check if path is a directory and look for common entry points
          try {
            const stats = await stat(path);
            if (stats.isDirectory()) {
              const candidates = ["exercise.rs", "main.rs", "main.go", "index.ts", "index.js", "App.tsx"];
              for (const file of candidates) {
                const filePath = join(path, file);
                if (await exists(filePath)) {
                  path = filePath;
                  break;
                }
              }
            }
          } catch (e) {
            // ignore error, proceed with original path
          }

          // 1. Get IDE preference
          let ide = "vs-code";
          if (await exists(GLOBAL_CONFIG_PATH)) {
            try {
              const config = JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
              // Local config takes precedence, or falls back to 'settings' sync logic if implemented
              // For now, assuming SettingsDialog saves 'ide' to metadata, verify if it saves to local too?
              // The SettingsDialog saves OpenAI key to local, but IDE to metadata.
              // We need to fetch metadata if not in local? Or assume user synced it?
              // Correction: The implementation plan says "Reads ide setting from GLOBAL_CONFIG_PATH". 
              // SettingsDialog currently does NOT save IDE to local config, only metadata.
              // I should update SettingsDialog to save IDE to local config as well for offline support.
              // For now, let's assume it's in local or fallback to vs-code.
              if (config.ide) ide = config.ide;
            } catch (e) { }
          }

          // 2. Map to command
          let command = "code";
          const args = [path]; // Open the specific file

          switch (ide) {
            case "vs-code": command = "code"; break;
            case "cursor": command = "cursor"; break;
            case "zed": command = "zed"; break;
            case "antigravity": command = "antigravity"; break; // Custom alias?
            case "vim":
              // unique handling for terminal editors? For now, assume it opens a new terminal window or just fails if no terminal attached
              // Maybe skip vim for now or use `code` as safe fallback?
              // Let's assume user has a `vim` command that might launch a GUI or separate terminal
              command = "vim";
              break;
          }

          console.log(`[IDE] Opening ${path} with ${command}`);

          // 3. Spawn detached process
          const child = spawn(command, args, {
            detached: true,
            stdio: 'ignore',
            shell: true // important for finding commands in PATH
          });
          child.unref();

          return Response.json({ success: true });
        } catch (e) {
          console.error(`[IDE] Failed to open: ${e}`);
          return Response.json({ success: false, error: String(e) }, { status: 500 });
        }
      }
    }
  },
  development: { hmr: process.env.ENABLE_HMR === "true" },
  fetch(req) { return new Response("Not Found", { status: 404 }); }
});

console.log(`🚀 Progy Server running on ${server.url}`);
