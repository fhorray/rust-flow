import { readFile, exists } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import type { ServerType } from "../types";
import {
  ensureConfig,
  currentConfig,
  scanAndGenerateManifest,
  PROG_CWD,
  getProgress,
  saveProgress,
  updateStreak,
  parseRunnerOutput
} from "../helpers";

/**
 * Returns the exercises manifest.
 * @returns a JSON object with the exercises manifest.
 */
const exercisesHandler: ServerType<"/exercises"> = async () => {
  await ensureConfig();
  if (!currentConfig) return Response.json({ error: "No config" });
  const manifest = await scanAndGenerateManifest(currentConfig);
  return Response.json(Array.isArray(manifest) ? {} : manifest);
};

/**
 * Returns the quiz for a given exercise.
 * @param req The request.
 * @returns A JSON object with the quiz.
 */
const quizHandler: ServerType<"/exercises/quiz"> = async (req) => {
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
};

/**
 * Returns the code for a given exercise.
 * @param req The request.
 * @returns A JSON object with the code.
 */
const codeHandler: ServerType<"/exercises/code"> = async (req) => {
  const url = new URL(req.url);
  const filePath = url.searchParams.get('path');
  const markdownPath = url.searchParams.get('markdownPath');
  if (!filePath) return new Response('Missing path', { status: 400 });

  try {
    let code = "";
    const s = await Bun.file(filePath).stat();
    if (s.isDirectory()) {
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
};

/**
 * Runs the given exercise.
 * @param req The request.
 * @returns A JSON object with the result.
 */
const runHandler: ServerType<"/exercises/run"> = async (req) => {
  try {
    await ensureConfig();
    const body = await req.json() as { exerciseName: string, id: string };
    const { exerciseName, id } = body;
    const idParts = id?.split('/') || [];
    const module = idParts[0] || "";

    const runnerCmd = currentConfig!.runner.command;
    const runnerArgs = currentConfig!.runner.args.map((a: string) =>
      a.replace("{{exercise}}", exerciseName).replace("{{id}}", id || "").replace("{{module}}", module)
    );

    const cwdLink = currentConfig!.runner.cwd ? join(PROG_CWD, currentConfig!.runner.cwd) : PROG_CWD;
    const finalCwd = cwdLink.replace("{{exercise}}", exerciseName).replace("{{id}}", id || "").replace("{{module}}", module);

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
        let currentProgress = null;
        let saveError = null;

        if (result.success && body.id) {
          try {
            const progress = await getProgress();
            if (!progress.exercises[body.id]) {
              progress.exercises[body.id] = { status: 'pass', xpEarned: 20, completedAt: new Date().toISOString() };
              progress.stats.totalXp += 20;
              progress.stats = updateStreak(progress.stats);
              await saveProgress(progress);
            }
            currentProgress = progress;
          } catch (e) {
            console.error(`[WARN] Could not update progress: ${e}`);
            saveError = "Failed to save progress (Auth/Network error)";
          }
        }
        resolve(Response.json({
          success: result.success,
          output: result.output || "No output",
          friendlyOutput: result.friendlyOutput,
          progress: currentProgress,
          error: saveError
        }));
      });
      child.on("error", (e) => resolve(Response.json({ success: false, output: e.message })));
    });
  } catch (e) {
    return Response.json({ success: false, output: String(e) });
  }
};

export const exercisesRoutes = {
  "/exercises": { GET: exercisesHandler },
  "/exercises/quiz": { GET: quizHandler },
  "/exercises/code": { GET: codeHandler },
  "/exercises/run": { POST: runHandler }
};
