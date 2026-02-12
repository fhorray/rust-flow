import { readFile, stat } from "node:fs/promises";
import { join, resolve, relative, isAbsolute } from "node:path";
import { spawn } from "node:child_process";
import type { ServerType } from "@progy/core";
import {
  ensureConfig,
  currentConfig,
  scanAndGenerateManifest,
  PROG_CWD,
  PROG_RUNTIME_ROOT,
  getProgress,
  saveProgress,
  updateStreak,
  parseRunnerOutput,
  exists as progyExists,
  loadToken,
  BACKEND_URL
} from "@progy/core";

async function resolveFile(relativePath: string): Promise<string | null> {
  const safeJoin = (base: string, rel: string) => {
    const absoluteBase = resolve(base);
    const absolutePath = resolve(base, rel);
    const relFromBase = relative(absoluteBase, absolutePath);
    if (relFromBase.startsWith('..') || isAbsolute(relFromBase)) return null;
    return absolutePath;
  };

  const local = safeJoin(PROG_CWD, relativePath);
  if (local && await progyExists(local)) return local;

  if (PROG_RUNTIME_ROOT) {
    const runtime = safeJoin(PROG_RUNTIME_ROOT, relativePath);
    if (runtime && await progyExists(runtime)) return runtime;
  }

  return null;
}
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

  const resolvedBase = await resolveFile(filePath);
  if (!resolvedBase) return Response.json({ error: "Exercise not found" }, { status: 404 });

  const s = await stat(resolvedBase);
  const dirPath = s.isDirectory() ? resolvedBase : join(resolvedBase, "..");
  const quizPath = join(dirPath, "quiz.json");
  const actualPath = await resolveFile(quizPath);

  try {
    if (actualPath && await progyExists(actualPath)) {
      const content = await readFile(actualPath, "utf-8");
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

    // Check if the path exists in either layer
    const actualPath = await resolveFile(filePath);
    if (!actualPath) return Response.json({ error: "File not found" }, { status: 404 });

    const s = await stat(actualPath);
    if (s.isDirectory()) {
      const candidates = ["exercise.rs", "exercise.sql", "exercise.py", "exercise.ts", "exercise.js", "main.rs", "index.ts", "main.go", "index.js", "main.py"];
      for (const c of candidates) {
        const p = join(filePath, c); // Search relative path in layers
        const solvedP = await resolveFile(p);
        if (solvedP) {
          code = await readFile(solvedP, "utf-8");
          break;
        }
      }
      if (!code) code = "// No entry file found";
    } else {
      code = await readFile(actualPath, "utf-8");
    }

    let markdown: string | null = null;
    if (markdownPath) {
      const actualMd = await resolveFile(markdownPath);
      if (actualMd) markdown = await readFile(actualMd, "utf-8");
    }

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
    const existing = progress.exercises[exerciseId];

    if (!existing || existing.status !== 'pass') {
      const attempts = existing?.attempts || 0;
      progress.exercises[exerciseId] = {
        status: 'pass',
        xpEarned: 20,
        completedAt: new Date().toISOString(),
        attempts: 0 // Reset attempts on success
      };

      // Only award XP if it wasn't already passed
      if (!existing || existing.status !== 'pass') {
        progress.stats.totalXp += 20;
      }

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

/**
 * Helper to track failed attempts and trigger tutor if needed.
 */
async function trackExerciseFailure(exerciseId: string, context: any) {
  try {
    const progress = await getProgress();
    const exProgress = progress.exercises[exerciseId] || { status: 'fail', xpEarned: 0, completedAt: new Date().toISOString(), attempts: 0 };

    // Update attempts
    exProgress.attempts = (exProgress.attempts || 0) + 1;
    exProgress.status = 'fail';
    exProgress.completedAt = new Date().toISOString();

    progress.exercises[exerciseId] = exProgress;
    await saveProgress(progress);

    console.log(`[TUTOR-DEBUG] Exercise ${exerciseId} failed. Attempts: ${exProgress.attempts}`);

    if (exProgress.attempts === 3) {
      console.log(`[TUTOR-TRIGGER] 3 Failures reached for ${exerciseId}. Calling tutor workflow...`);
      const token = await loadToken();
      if (!token) return;

      const courseConfig = currentConfig;
      if (!courseConfig) return;

      // Trigger tutor agent workflow via backend
      await fetch(`${BACKEND_URL}/tutor/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: courseConfig.id,
          exerciseId,
          context: {
            courseName: courseConfig.name,
            exerciseName: exerciseId.split('/').pop() || exerciseId,
            ...context
          }
        })
      });
    }

    return progress;
  } catch (e) {
    console.error(`[WARN] Could not track failure: ${e}`);
    return null;
  }
}

async function handleDockerLocalRunner(body: { exerciseName: string, id: string, entryPoint?: string }) {
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

  let dockerfile = config.runner.dockerfile || "Dockerfile";
  let dockerfilePath = join(PROG_CWD, dockerfile);

  if (!(await progyExists(dockerfilePath)) && PROG_RUNTIME_ROOT) {
    const runtimeDockerfile = join(PROG_RUNTIME_ROOT, dockerfile);
    if (await progyExists(runtimeDockerfile)) {
      dockerfilePath = runtimeDockerfile;
    }
  }

  const contextPath = PROG_CWD;

  try {
    await imgMgr.ensureImage(imageTag, contextPath, dockerfilePath);
  } catch (e: any) {
    return {
      success: false,
      output: `Failed to build image: ${e.message}`,
      friendlyOutput: `## ❌ Build Error\n\n${e.message}`
    };
  }

  const command = config.runner.command || "echo 'No command'";
  // Replace placeholders in command
  const exerciseLabel = body.entryPoint ? `${body.id}/${body.entryPoint}` : body.exerciseName;
  const finalCommand = command.replace("{{exercise}}", exerciseLabel).replace("{{id}}", body.id || "");

  const result = await docker.runContainer(imageTag, {
    cwd: contextPath,
    command: finalCommand,
    network: config.runner.network_access ? "bridge" : "none"
  });

  return parseRunnerOutput(result.output, result.exitCode);
}

async function handleDockerComposeRunner(body: { exerciseName: string, id: string, entryPoint?: string }) {
  const client = new DockerComposeClient();
  const config = currentConfig!;

  let composeFile = join(PROG_CWD, config.runner.compose_file || "docker-compose.yml");
  if (!(await progyExists(composeFile)) && PROG_RUNTIME_ROOT) {
    const runtimeFile = join(PROG_RUNTIME_ROOT, config.runner.compose_file || "docker-compose.yml");
    if (await progyExists(runtimeFile)) {
      composeFile = runtimeFile;
    }
  }

  const service = config.runner.service_to_run || "app";
  // body.id is like "01_select/01_simple-query", we need to append entryPoint if folder
  const exercisePath = body.entryPoint ? `${config.content.exercises}/${body.id}/${body.entryPoint}` : `${config.content.exercises}/${body.id}`;
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
    const result = await client.runService(composeFile, service, command, undefined, [`${PROG_CWD}:/workspace`]);
    return parseRunnerOutput(result.output, result.exitCode);
  } catch (e: any) {
    return {
      success: false,
      output: `Docker Compose Error: ${e.message}`,
      friendlyOutput: `## ❌ Compose Error\n\n${e.message}`
    };
  }
}

async function handleProcessRunner(body: { exerciseName: string, id: string, entryPoint?: string }) {
  const { exerciseName, id } = body;
  const idParts = id?.split('/') || [];
  const module = idParts[0] || "";

  const runnerCmd = currentConfig!.runner.command;
  const runnerArgs = currentConfig!.runner.args.map((a: string) =>
    a.replace("{{exercise}}", body.entryPoint ? join(id, body.entryPoint) : exerciseName)
      .replace("{{id}}", id || "")
      .replace("{{module}}", module)
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
    const body = await req.json() as { exerciseName: string, id: string, entryPoint?: string };

    let result: { success: boolean, output: string, friendlyOutput?: string } | null = null;
    const runnerType = currentConfig!.runner.type || 'process';

    if (runnerType === 'docker-file') {
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
    } else if (result && !result.success && body.id) {
      // Track failure and potentially trigger tutor
      const desc = await resolveFile(body.entryPoint ? join(body.id, body.entryPoint) : body.id);
      let code = "";
      if (desc) {
        try { code = await readFile(desc, "utf-8"); } catch { }
      }

      const progress = await trackExerciseFailure(body.id, {
        code,
        error: result.friendlyOutput || result.output,
      });
      if (progress) progressData.currentProgress = progress;
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
