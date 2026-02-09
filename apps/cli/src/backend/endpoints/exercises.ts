import { readFile, stat } from "node:fs/promises";
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
import { DockerClient } from "../../docker/client";
import { DockerComposeClient } from "../../docker/compose-client";
import { ImageManager } from "../../docker/image-manager";

async function exists(path: string): Promise<boolean> {
  return await Bun.file(path).exists();
}

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

  let dirPath = filePath;
  try {
    const s = await Bun.file(filePath).stat();
    if (!s.isDirectory()) {
      dirPath = join(filePath, "..");
    }
  } catch (e) {
    // Path might not exist or be invalid, fallback to previous behavior
  }

  const quizPath = join(dirPath, "quiz.json");
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
      const candidates = ["exercise.rs", "exercise.sql", "exercise.py", "exercise.ts", "exercise.js", "main.rs", "index.ts", "main.go", "index.js", "main.py"];
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
 * Helper to handle progress updates on success.
 */
async function updateProgressForSuccess(exerciseId: string) {
  let currentProgress = null;
  let saveError = null;
  try {
    const progress = await getProgress();
    if (!progress.exercises[exerciseId]) {
      progress.exercises[exerciseId] = { status: 'pass', xpEarned: 20, completedAt: new Date().toISOString() };
      progress.stats.totalXp += 20;
      progress.stats = updateStreak(progress.stats);
      await saveProgress(progress);
    }
    currentProgress = progress;
  } catch (e) {
    console.error(`[WARN] Could not update progress: ${e}`);
    saveError = "Failed to save progress (Auth/Network error)";
  }
  return { currentProgress, saveError };
}

async function handleDockerLocalRunner(body: { exerciseName: string, id: string }) {
  const docker = new DockerClient();
  const imgMgr = new ImageManager();

  if (!(await docker.checkAvailability())) {
    return {
      success: false,
      output: "Docker is not running. Please install Docker Desktop and try again.",
      friendlyOutput: "## ❌ Docker Error\n\nDocker is not running. Please start Docker."
    };
  }

  const config = currentConfig!;
  const imageTag = config.runner.image_tag || imgMgr.generateTag(config.id);
  const dockerfile = config.runner.dockerfile || "Dockerfile";
  const contextPath = PROG_CWD;

  try {
    await imgMgr.ensureImage(imageTag, contextPath, dockerfile);
  } catch (e: any) {
    return {
      success: false,
      output: `Failed to build image: ${e.message}`,
      friendlyOutput: `## ❌ Build Error\n\n${e.message}`
    };
  }

  const command = config.runner.command || "echo 'No command'";
  // Replace placeholders in command if needed? Usually command is fixed in course.json or exercise specific?
  // For simplicity, we assume command is static or handled by args substitution in process runner.
  // But docker run uses 'sh -c command'.
  // If we want exercise-specific args, we might need to substitute {{exercise}} in config.runner.command.
  const finalCommand = command.replace("{{exercise}}", body.exerciseName).replace("{{id}}", body.id || "");

  const result = await docker.runContainer(imageTag, {
    cwd: contextPath,
    command: finalCommand,
    network: config.runner.network_access ? "bridge" : "none"
  });

  return parseRunnerOutput(result.output, result.exitCode);
}

async function handleDockerComposeRunner(body: { exerciseName: string, id: string }) {
  const client = new DockerComposeClient();
  const config = currentConfig!;

  const composeFile = join(PROG_CWD, config.runner.compose_file || "docker-compose.yml");
  const service = config.runner.service_to_run || "app";
  // body.id is like "01_select/exercise.sql", we need to prefix with content folder
  const exercisePath = `${config.content.exercises}/${body.id}`;
  const command = (config.runner.command || "echo 'No command'")
    .replace("{{exercise}}", exercisePath)
    .replace("{{id}}", body.id || "");

  const docker = new DockerClient();
  if (!(await docker.checkAvailability())) {
    return {
      success: false,
      output: "Docker is not running. Please install Docker Desktop and try again.",
      friendlyOutput: "## ❌ Docker Error\n\nDocker is not running. Please start Docker."
    };
  }

  try {
    const result = await client.runService(composeFile, service, command);
    return parseRunnerOutput(result.output, result.exitCode);
  } catch (e: any) {
    return {
      success: false,
      output: `Docker Compose Error: ${e.message}`,
      friendlyOutput: `## ❌ Compose Error\n\n${e.message}`
    };
  }
}

async function handleProcessRunner(body: { exerciseName: string, id: string }) {
  const { exerciseName, id } = body;
  const idParts = id?.split('/') || [];
  const module = idParts[0] || "";

  const runnerCmd = currentConfig!.runner.command;
  const runnerArgs = currentConfig!.runner.args.map((a: string) =>
    a.replace("{{exercise}}", exerciseName).replace("{{id}}", id || "").replace("{{module}}", module)
  );

  const cwdLink = currentConfig!.runner.cwd ? join(PROG_CWD, currentConfig!.runner.cwd) : PROG_CWD;
  const finalCwd = cwdLink.replace("{{exercise}}", exerciseName).replace("{{id}}", id || "").replace("{{module}}", module);

  return new Promise<{ success: boolean, output: string, friendlyOutput?: string }>((resolve) => {
    const child = spawn(runnerCmd, runnerArgs, {
      cwd: finalCwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "1" }
    });
    let output = "";
    if (child.stdout) child.stdout.on("data", d => output += d.toString());
    if (child.stderr) child.stderr.on("data", d => output += d.toString());
    child.on("close", (code) => {
      resolve(parseRunnerOutput(output, code || 0));
    });
    child.on("error", (e) => resolve({ success: false, output: e.message, friendlyOutput: `## ❌ Spawn Error\n\n${e.message}` }));
  });
}

/**
 * Runs the given exercise.
 * @param req The request.
 * @returns A JSON object with the result.
 */
const runHandler: ServerType<"/exercises/run"> = async (req) => {
  try {
    await ensureConfig();
    const body = await req.json() as { exerciseName: string, id: string };

    let result: { success: boolean, output: string, friendlyOutput?: string } | null = null;
    const runnerType = currentConfig!.runner.type || 'process';

    if (runnerType === 'docker-local') {
      result = await handleDockerLocalRunner(body);
    } else if (runnerType === 'docker-compose') {
      result = await handleDockerComposeRunner(body);
    } else {
      result = await handleProcessRunner(body);
    }

    // Progress
    let progressData: any = {};
    if (result && result.success && body.id) {
      progressData = await updateProgressForSuccess(body.id);
    }

    return Response.json({
      success: result?.success ?? false,
      output: result?.output || "No output",
      friendlyOutput: result?.friendlyOutput || result?.output,
      progress: progressData.currentProgress,
      error: progressData.saveError
    });

  } catch (e: any) {
    return Response.json({ success: false, output: String(e.message || e) });
  }
};

export const exercisesRoutes = {
  "/exercises": { GET: exercisesHandler },
  "/exercises/quiz": { GET: quizHandler },
  "/exercises/code": { GET: codeHandler },
  "/exercises/run": { POST: runHandler }
};
