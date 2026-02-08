#!/usr/bin/env bun
import { program } from "commander";
import { cp, mkdir, writeFile, readFile, rm, readdir } from "node:fs/promises";
import { join, resolve, relative, basename } from "node:path";
import { spawn } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { stat } from "node:fs/promises"; // Import stat for exists helper
import { TEMPLATES, RUNNER_README } from "./templates";
import { CourseLoader } from "./course-loader";
import { CourseContainer } from "./course-container";
import { GitUtils } from "./git-utils";
import { SyncManager } from "./sync-manager";

const CONFIG_DIR = join(homedir(), ".progy");
const GLOBAL_CONFIG_PATH = join(CONFIG_DIR, "config.json");
const BACKEND_URL = process.env.PROGY_API_URL || "https://progy.francy.workers.dev";
const FRONTEND_URL = process.env.PROGY_FRONTEND_URL || "https://progy.francy.workers.dev";

// Version & Source Check
import packageJson from "../package.json";
const isLocal = !import.meta.file.includes("node_modules");
const sourceLabel = isLocal ? "\x1b[33m(local/dev)\x1b[0m" : "\x1b[32m(npm)\x1b[0m";

// Only log if not running a completion command or internal pipe
if (!process.argv.includes("--completion") && !process.argv.includes("completion")) {
  console.log(`\x1b[1m[Progy]\x1b[0m v${packageJson.version} ${sourceLabel}`);
}

const CONFIG_NAME = "course.json";

// Helper for exists check
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function saveToken(token: string) {
  if (!(await exists(CONFIG_DIR))) {
    await mkdir(CONFIG_DIR, { recursive: true });
  }
  await writeFile(GLOBAL_CONFIG_PATH, JSON.stringify({ token }));
}

async function loadToken(): Promise<string | null> {
  if (!(await exists(GLOBAL_CONFIG_PATH))) return null;
  try {
    const config = JSON.parse(await readFile(GLOBAL_CONFIG_PATH, "utf-8"));
    return config.token || null;
  } catch {
    return null;
  }
}

function openBrowser(url: string) {
  const start = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(start, [url], { shell: true }).unref();
}

// Helper to run the server
async function runServer(runtimeCwd: string, isOffline: boolean, containerFile: string | null) {
  console.log(`[INFO] Starting UI in ${isOffline ? 'OFFLINE' : 'ONLINE'} mode...`);

  // dynamically find server file
  const isTs = import.meta.file.endsWith(".ts");
  const serverExt = isTs ? "ts" : "js";
  const serverPath = join(import.meta.dir, "backend", `server.${serverExt}`);

  const serverArgs = ["run", serverPath];
  if (process.env.ENABLE_HMR === "true") {
    serverArgs.splice(1, 0, "--hot");
  }

  const child = spawn("bun", serverArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      PROG_CWD: runtimeCwd, // Point server to runtime!
      PROGY_OFFLINE: isOffline ? "true" : "false"
    },
  });

  const cleanup = () => {
    if (child && !child.killed) {
      child.kill();
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", () => {
    if (child && !child.killed) child.kill();
  });

  // Watcher for Sync
  if (containerFile) {
    console.log(`[SYNC] Auto-save enabled.`);
    const { watch } = await import("node:fs");
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const watcher = watch(runtimeCwd, { recursive: true }, (event, filename) => {
      // Ignore temporary files if needed, or specific patterns
      if (!filename || filename.includes(".git") || filename.includes("node_modules")) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          await CourseContainer.sync(runtimeCwd, containerFile);
        } catch (e) {
          console.error(`[SYNC] Failed to save: ${e}`);
        }
      }, 1000); // 1s write debounce
    });

    child.on("close", () => {
      watcher.close();
      console.log(`[SYNC] Final save...`);
      CourseContainer.sync(runtimeCwd, containerFile).then(() => process.exit(0));
    });
  } else {
    child.on("close", (code) => process.exit(code ?? 0));
  }
}

async function startCourse(file: string | undefined, options: { offline: boolean }) {
  const cwd = process.cwd();
  const isOffline = !!options.offline;

  let runtimeCwd = cwd;
  let containerFile: string | null = null;

  // 1. Detect .progy file
  if (file && file.endsWith(".progy") && await exists(file)) {
    containerFile = resolve(file);
  } else {
    // Scan directory
    const files = await readdir(cwd);
    const progyFiles = [];
    for (const f of files) {
      if (f.endsWith(".progy") && f !== ".progy") {
        try {
          const stats = await stat(join(cwd, f));
          if (stats.isFile()) progyFiles.push(f);
        } catch { /* ignore */ }
      }
    }

    if (progyFiles.length > 0) {
      if (progyFiles.length > 1) {
        console.warn(`[WARN] Multiple .progy files found. Using ${progyFiles[0]}`);
      }
      containerFile = join(cwd, progyFiles[0] as string);
    }
  }

  if (containerFile) {
    console.log(`[OPEN] Opening course: ${basename(containerFile)}...`);
    try {
      // Unpack to global runtime
      runtimeCwd = await CourseContainer.unpack(containerFile);
      console.log(`[KT] Runtime ready at: ${runtimeCwd}`);
    } catch (e) {
      console.error(`[ERROR] Failed to unpack course: ${e}`);
      process.exit(1);
    }
  } else {
    // Check if open directory is a legacy course (has course.json)
    if (await exists(join(cwd, CONFIG_NAME))) {
      console.log(`[INFO] Legacy course directory detected.`);
    } else {
      // No course found
      console.log(`[INFO] No .progy file or course structure found.`);
      console.log(`Run 'progy init' to create a new course.`);
    }
  }

  await runServer(runtimeCwd, isOffline, containerFile);
}

program
  .name("progy")
  .description("Universal programming course runner")
  .version(`${packageJson.version} ${isLocal ? "(local/dev)" : "(npm)"}`);

program
  .command("validate")
  .description("Validate the current directory as a Progy course")
  .argument("[path]", "Path to course directory", ".")
  .action(async (path) => {
    const target = resolve(path);
    console.log(`[VAL] Validating course at: ${target}`);
    try {
      const config = await CourseLoader.validateCourse(target);
      console.log(`\n✅ Course is Valid!`);
      console.log(`   ID: ${config.id}`);
      console.log(`   Name: ${config.name}`);
      console.log(`   Content: ${config.content.root}`);
    } catch (e: any) {
      console.error(`\n❌ Validation Failed:`);
      console.error(e.message);
      process.exit(1);
    }
  });

program
  .command("dev")
  .description("Run the current directory as a course (Hot-reload/No-packaging)")
  .option("--offline", "Run in offline mode")
  .action(async (options) => {
    const cwd = process.cwd();
    // Validate first
    try {
      await CourseLoader.validateCourse(cwd);
    } catch (e: any) {
      console.error(`[ERROR] Current directory is not a valid course:`);
      console.error(e.message);
      process.exit(1);
    }

    console.log(`[DEV] Starting in Development Mode (Source: ${cwd})`);
    // Run server pointing to CWD, null containerFile (no sync)
    await runServer(cwd, !!options.offline, null);
  });

program
  .command("pack")
  .description("Package the current directory into a .progy file")
  .option("-o, --out <file>", "Output filename")
  .action(async (options) => {
    const cwd = process.cwd();
    try {
      const config = await CourseLoader.validateCourse(cwd);
      const filename = options.out || `${config.id}.progy`;
      const outPath = resolve(filename);

      console.log(`[PACK] Packaging course '${config.id}'...`);
      await CourseContainer.pack(cwd, outPath);
      console.log(`[SUCCESS] Created: ${filename}`);
    } catch (e: any) {
      console.error(`\n❌ Packaging Failed:`);
      console.error(e.message);
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize a new course in the current directory")
  .option("-c, --course <course>", "Language/Course to initialize (e.g., rust)")
  .option("--offline", "Run in offline mode (Guest access, local storage only)")
  .action(async (options) => {
    const cwd = process.cwd();
    const isOffline = !!options.offline;
    let courseId = options.course;

    // 0. Check existing configuration (Resume flow)
    const existingConfig = await SyncManager.loadConfig(cwd);
    if (existingConfig) {
      console.log(`[INIT] Found existing progy.toml. Resuming course '${existingConfig.course.id}'...`);
      courseId = existingConfig.course.id;
    }

    if (!courseId && !isOffline) {
       console.error("❌ Please specify a course ID (e.g., 'progy init -c rust') or run inside an existing course.");
       process.exit(1);
    }

    if (isOffline) {
        console.log("[INFO] Offline mode: Skipping Git Sync.");
        // Simplified offline fallback (Legacy Template Logic could go here)
        console.warn("⚠️  Offline init not fully supported in this version. Use online mode to sync first.");
        return;
    }

    // 1. Authentication
    let token = await loadToken();
    let gitCreds: { user: string, token: string } | null = null;

    if (!token) {
      console.error("❌ Authentication required. Run 'progy login' first.");
      process.exit(1);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/git/credentials`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
          gitCreds = await res.json() as any;
          console.log(`[SYNC] Connected as GitHub user: ${gitCreds?.user}`);
      } else {
          throw new Error("Git auth failed");
      }
    } catch (e) {
      console.warn("⚠️  Authentication check failed. Please re-login.");
      process.exit(1);
    }

    try {
        // 2. Resolve Official Course URL
        console.log(`[SYNC] Resolving official course '${courseId}'...`);
        const officialSource = await CourseLoader.resolveSource(courseId);

        // 3. Ensure User Repository Exists
        console.log(`[SYNC] Checking user repository...`);
        const ensureRes = await fetch(`${BACKEND_URL}/api/git/ensure-repo`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ courseId })
        });

        if (!ensureRes.ok) throw new Error("Failed to ensure user repository");
        const userRepoInfo = await ensureRes.json() as { repoUrl: string, isNew: boolean };

        // 4. Setup User Workspace (Clone/Pull User Repo)
        // Check if we are already in a git repo
        if (await exists(join(cwd, ".git"))) {
             const { remoteUrl } = await GitUtils.getGitInfo(cwd);
             // Safety check: Are we in the right repo?
             if (remoteUrl && remoteUrl.includes(userRepoInfo.repoUrl.replace("https://github.com/", ""))) {
                 console.log(`[SYNC] Pulling latest user progress...`);
                 await GitUtils.pull(cwd);
             } else {
                 console.warn(`[WARN] Current git remote (${remoteUrl}) differs from expected (${userRepoInfo.repoUrl}). Skipping user pull.`);
             }
        } else {
             // Clone User Repo
             // If directory is not empty, we might have issues.
             // Ideally init should be run in empty dir or matching dir.
             const files = await readdir(cwd);
             if (files.length > 0 && !existingConfig) {
                 console.warn(`[WARN] Directory not empty. Initializing in place...`);
                 await GitUtils.init(cwd);
                 await GitUtils.addRemote(cwd, gitCreds.token, userRepoInfo.repoUrl);
                 await GitUtils.pull(cwd);
             } else {
                 console.log(`[SYNC] Cloning user repository...`);
                 await GitUtils.clone(userRepoInfo.repoUrl, cwd, gitCreds.token);
             }
        }

        // 5. Sync Official Content (Layering)
        console.log(`[SYNC] Downloading official course content...`);
        const cacheDir = await SyncManager.ensureOfficialCourse(courseId, officialSource.url, officialSource.branch);

        console.log(`[SYNC] Updating workspace...`);
        // Force=false preserves user exercises
        await SyncManager.applyLayering(cwd, cacheDir, false);

        // 6. Final Configuration (If new or missing)
        if (!existingConfig) {
            console.log(`[SYNC] Configuring workspace...`);

            // Save progy.toml
            await SyncManager.saveConfig(cwd, {
                course: {
                    id: courseId,
                    repo: officialSource.url,
                    branch: officialSource.branch
                }
            });

            // Generate .gitignore
            await SyncManager.generateGitIgnore(cwd, courseId);

            // Initial Push of Config if new
            if (userRepoInfo.isNew || !(await exists(join(cwd, "progy.toml")))) {
                 await GitUtils.configUser(cwd, "Progy Bot", "bot@progy.dev");
                 await GitUtils.exec(["add", "."], cwd); // .gitignore filters this!
                 await GitUtils.exec(["commit", "-m", "Initialize course workspace"], cwd);
                 await GitUtils.exec(["push", "-u", "origin", "main"], cwd);
            }
        }

        console.log("[SUCCESS] Course initialized!");
        console.log("Run 'progy dev' to start.");

    } catch (e: any) {
        console.error(`[ERROR] Init failed: ${e.message}`);
        process.exit(1);
    }
  });

// Moved 'start' command to end to avoid default command shadowing issues

program
  .command("create-course")
  .description("Scaffold a new course with standard directory structure")
  .requiredOption("--name <name>", "Name of the course (e.g., rust-advanced)")
  .requiredOption("-c, --course <course>", "Programming language template (rust, go)")
  .action(async (options) => {
    const cwd = process.cwd();
    const courseName = options.name;
    const lang = options.course.toLowerCase();
    const courseDir = join(cwd, courseName);

    if (await exists(courseDir)) {
      console.error(`[ERROR] Directory '${courseName}' already exists.`);
      process.exit(1);
    }

    const template = TEMPLATES[lang];
    if (!template) {
      console.error(`[ERROR] Unsupported language '${lang}'. Supported: ${Object.keys(TEMPLATES).join(", ")}`);
      process.exit(1);
    }

    console.log(`[INFO] Creating course '${courseName}' with template '${lang}'...`);

    // 1. Create Directories
    await mkdir(courseDir, { recursive: true });
    await mkdir(join(courseDir, "content", "01_intro"), { recursive: true });

    // 2. Create course.json
    // Replace placeholders in course.json
    const configStr = JSON.stringify(template.courseJson, null, 2)
      .replace(/{{id}}/g, courseName)
      .replace(/{{name}}/g, courseName);
    await writeFile(join(courseDir, "course.json"), configStr);

    // 3. Create SETUP.md
    await writeFile(join(courseDir, "SETUP.md"), template.setupMd);

    // 4. Create First Lesson
    await writeFile(join(courseDir, "content", "01_intro", "README.md"), template.introReadme);
    await writeFile(join(courseDir, "content", "01_intro", template.introFilename), template.introCode);

    // 5. Create runner directory if needed for Go
    if (lang === "go") {
      const runnerDir = join(courseDir, "runner");
      await mkdir(runnerDir, { recursive: true });
      // We should ideally copy the generic runner source here, but for now we'll write a basic one or warn
      // For simplicity in this phase, we'll create a placeholder main.go for the runner
      // logic is a bit complex to inline, so for now we rely on the user or a future improvement
      // to populate the actual runner binary/source. 
      // ACTUALLY: Let's reuse the Go runner code we verified earlier and write it out.

      const runnerCode = `package main
import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
)
type SRPDiagnostic struct {
	Severity   string \`json:"severity"\`
	Message    string \`json:"message"\`
	File       string \`json:"file,omitempty"\`
	Line       int    \`json:"line,omitempty"\`
}
type SRPTest struct {
	Name    string \`json:"name"\`
	Status  string \`json:"status"\`
	Message string \`json:"message,omitempty"\`
}
type SRPOutput struct {
	Success     bool            \`json:"success"\`
	Summary     string          \`json:"summary"\`
	Diagnostics []SRPDiagnostic \`json:"diagnostics,omitempty"\`
	Tests       []SRPTest       \`json:"tests,omitempty"\`
	Raw         string          \`json:"raw"\`
}
func main() {
	if len(os.Args) < 3 { os.Exit(1) }
	id := os.Args[2]
	cmd := exec.Command("go", "test", "-v", "./content/"+id)
	output, _ := cmd.CombinedOutput()
	raw := string(output)
	srp := SRPOutput{ Success: cmd.ProcessState.Success(), Raw: raw, Summary: "Test execution completed" }
    // ... Simplified parsing for scaffold ...
	json, _ := json.MarshalIndent(srp, "", "  ")
	fmt.Println("__SRP_BEGIN__")
	fmt.Println(string(json))
	fmt.Println("__SRP_END__")
    if !srp.Success { os.Exit(0) }
}
`;
      await writeFile(join(runnerDir, "main.go"), runnerCode);

      // Also create go.mod
      await writeFile(join(courseDir, "go.mod"), `module ${courseName}\n\ngo 1.21\n`);
    }
    console.log(`[SUCCESS] Course created!`);
    console.log(`\nTo get started:\n  cd ${courseName}\n  bunx progy init`);
  });

const configCommand = program
  .command("config")
  .description("Manage global configuration");

configCommand
  .command("set <key> <value>")
  .description("Set a configuration value (e.g., ai.provider openai)")
  .action(async (path, value) => {
    // We use a simple strategy for nested keys like 'ai.provider'
    const keys = path.split(".");
    const configPath = join(homedir(), ".progy", "config.json");

    let config: any = {};
    if (await exists(configPath)) {
      config = JSON.parse(await readFile(configPath, "utf-8"));
    }

    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== "object") {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;

    if (!(await exists(join(homedir(), ".progy")))) {
      await mkdir(join(homedir(), ".progy"), { recursive: true });
    }
    await writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`[SUCCESS] Updated ${path} to ${value}`);
  });

configCommand
  .command("list")
  .description("List current configuration")
  .action(async () => {
    const configPath = join(homedir(), ".progy", "config.json");
    if (await exists(configPath)) {
      const config = await readFile(configPath, "utf-8");
      console.log(config);
    } else {
      console.log("{}");
    }
  });

program
  .command("login")
  .description("Authenticate with Progy")
  .action(async () => {
    // Dynamically import better-auth client to avoid top-level issues if not installed
    // @ts-ignore
    const { createAuthClient } = await import("better-auth/client");
    // @ts-ignore
    const { deviceAuthorizationClient } = await import("better-auth/client/plugins");

    const authClient = createAuthClient({
      baseURL: `${BACKEND_URL}/api/auth`,
      plugins: [deviceAuthorizationClient()],
    });

    try {
      console.log("[INFO] Requesting login session...");

      const { data, error } = await authClient.device.code({
        client_id: "progy-cli",
      });

      if (error) {
        throw new Error(error.error_description || "Failed to initiate device authorization");
      }

      const { device_code, user_code, verification_uri, interval } = data;
      const verificationUrl = verification_uri.startsWith("http")
        ? verification_uri
        : `${FRONTEND_URL}${verification_uri}`;

      console.log(`\nPlease authenticate in your browser:`);
      console.log(`\x1b[36m${verificationUrl}\x1b[0m`);
      console.log(`Code: \x1b[33m${user_code}\x1b[0m\n`);

      openBrowser(verificationUrl);

      console.log("[WAIT] Waiting for authorization...");

      // Poll function
      const poll = async (): Promise<string | null> => {
        while (true) {
          const { data: tokenData, error: tokenError } = await authClient.device.token({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code,
            client_id: 'progy-cli'
          });

          if (tokenData?.access_token) {
            return tokenData.access_token;
          }

          if (tokenError) {
            const code = tokenError.error;
            if (code === 'access_denied' || code === 'expired_token') {
              throw new Error(tokenError.error_description || code);
            }
            // otherwise 'authorization_pending' or 'slow_down' -> continue
          }

          await new Promise((resolve) => setTimeout(resolve, (interval || 5) * 1000));
        }
      };

      const token = await poll();
      if (token) {
        // We have the token, now let's get the user session/info if needed or just save it.
        // Usually we might want to save the token for future requests.
        // For better-auth, the client might handle state, but for a CLI we need to persist it.
        await saveToken(token);
        console.log("[SUCCESS] Logged in successfully!");
      }
    } catch (e: any) {
      console.error(`[ERROR] Login failed: ${e.message || e}`);
      process.exit(1);
    }
  });


program
  .command("save")
  .description("Save your progress to the cloud")
  .option("-m, --message <message>", "Commit message", "Progress Update")
  .action(async (options) => {
    const cwd = process.cwd();
    if (!(await exists(join(cwd, ".git")))) {
      console.error("❌ Not a synced course (No .git found).");
      return;
    }
    const token = await loadToken();
    if (!token) console.warn("⚠️  Offline mode. Changes might not be pushed if auth is required.");

    // Enforce .gitignore policy
    const config = await SyncManager.loadConfig(cwd);
    if (config?.course?.id) {
        await SyncManager.generateGitIgnore(cwd, config.course.id);
    }

    // Acquire Lock
    if (!(await GitUtils.lock(cwd))) {
      console.warn("⚠️  Another Progy process is syncing. Please wait.");
      return;
    }

    try {
      // Refresh Token in Remote to prevent 403
      if (token) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/git/credentials`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const gitCreds = await res.json() as any;
            await GitUtils.updateOrigin(cwd, gitCreds.token);
            console.log(`[SYNC] Authenticated as ${gitCreds.user}`);
          } else {
            console.warn(`[SYNC] Auth refresh failed: ${res.status}. Pushing might fail.`);
          }
        } catch (e) {
          console.warn(`[SYNC] Auth check failed. Offline?`);
        }
      }

      console.log(`[SYNC] Saving progress...`);

      // 1. Commit
      // We use "add ." to ensure new files are tracked
      // With the enforced .gitignore, only whitelisted files (exercises/config) will be added.
      await GitUtils.exec(["add", "."], cwd);
      const commit = await GitUtils.exec(["commit", "-m", options.message], cwd);

      if (commit.success) {
        console.log(`[SYNC] Committed changes.`);
      } else if (!commit.stdout.includes("nothing to commit")) {
        console.error(`[ERROR] Commit failed: ${commit.stderr}`);
        return;
      }

      // 2. Pull (Rebase) to sync with remote
      console.log(`[SYNC] Syncing with remote...`);
      const pull = await GitUtils.pull(cwd);
      if (!pull.success) {
        console.warn(`[WARN] Sync/Pull issue: ${pull.stderr}`);
        console.warn(`You might have conflicts. Resolve them and run 'progy save' again.`);
        return; // Don't push if pull failed
      }

      // 3. Push
      const push = await GitUtils.exec(["push", "origin", "HEAD"], cwd);
      if (push.success) {
        console.log(`[SUCCESS] Progress saved to cloud.`);
      } else {
        console.error(`[ERROR] Push failed: ${push.stderr}`);
      }
    } finally {
      await GitUtils.unlock(cwd);
    }
  });

program
  .command("sync")
  .description("Pull latest changes from the cloud")
  .action(async () => {
    const cwd = process.cwd();
    if (!(await exists(join(cwd, ".git")))) {
      console.error("❌ Not a synced course (No .git found).");
      return;
    }

    // Load Progy Config
    const config = await SyncManager.loadConfig(cwd);
    if (!config) {
        console.error("❌ Missing progy.toml. Is this a valid Progy workspace?");
        return;
    }

    if (!(await GitUtils.lock(cwd))) {
      console.warn("⚠️  Another Progy process is syncing. Please wait.");
      return;
    }

    try {
      // 1. Refresh User Repo Auth
      const token = await loadToken();
      if (token) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/git/credentials`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const gitCreds = await res.json() as any;
            await GitUtils.updateOrigin(cwd, gitCreds.token);
          }
        } catch { }
      }

      // 2. Sync Official Content (Upstream)
      console.log(`[SYNC] Checking official course updates...`);
      const cacheDir = await SyncManager.ensureOfficialCourse(
          config.course.id,
          config.course.repo,
          config.course.branch
      );

      console.log(`[SYNC] Applying official updates...`);
      await SyncManager.applyLayering(cwd, cacheDir, false);

      // 3. Sync User Content (Downstream)
      console.log(`[SYNC] Pulling your progress...`);
      const res = await GitUtils.pull(cwd);

      if (res.success) {
        // Update last sync time
        config.sync = { last_sync: new Date().toISOString() };
        await SyncManager.saveConfig(cwd, config);
        console.log(`[SUCCESS] Workspace synchronized.`);
      } else {
        console.error(`[ERROR] Failed to pull user changes: ${res.stderr}`);
        console.log("Tip: Resolve conflicts manually in the 'content' directory.");
      }
    } catch (e: any) {
        console.error(`[ERROR] Sync failed: ${e.message}`);
    } finally {
      await GitUtils.unlock(cwd);
    }
  });


program
  .command("reset")
  .description("Reset a specific file to its original state")
  .argument("<path>", "Path to the file (e.g., content/intro/hello.rs)")
  .action(async (path) => {
    const cwd = process.cwd();
    const targetFile = relative(cwd, resolve(path)); // Normalize relative path

    // Load Config
    const config = await SyncManager.loadConfig(cwd);
    if (!config) {
        console.error("❌ Not a valid Progy workspace (missing progy.toml).");
        process.exit(1);
    }

    try {
        console.log(`[RESET] restoring ${targetFile}...`);

        // Ensure cache is available (we don't pull to save time, unless missing)
        const cacheDir = SyncManager.getCacheDir(config.course.id);
        if (!(await exists(cacheDir))) {
             console.log("[SYNC] Cache missing. Downloading course...");
             await SyncManager.ensureOfficialCourse(config.course.id, config.course.repo, config.course.branch);
        }

        // Reset
        await SyncManager.resetExercise(cwd, cacheDir, targetFile);
        console.log(`[SUCCESS] File reset to original state.`);
    } catch (e: any) {
        console.error(`[ERROR] Reset failed: ${e.message}`);
    }
  });

program
  .command("start", { isDefault: true })
  .description("Start the Progy server (opens local .progy file)")
  .option("--offline", "Run in offline mode")
  .argument("[file]", "Specific .progy file to open")
  .action(async (file, options) => {
    // RUNTIME LOGIC (Default "progy start" behavior)
    await startCourse(file, options);
  });

program.parse();
