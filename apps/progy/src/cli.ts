#!/usr/bin/env bun
import { program } from "commander";
import { cp, mkdir, writeFile, readFile, rm, readdir } from "node:fs/promises";
import { join, resolve, relative, basename } from "node:path";
import { spawn } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { stat } from "node:fs/promises"; // Import stat for exists helper
import { TEMPLATES } from "./templates";
import { CourseLoader } from "./course-loader";
import { CourseContainer } from "./course-container";

const CONFIG_DIR = join(homedir(), ".progy");
const GLOBAL_CONFIG_PATH = join(CONFIG_DIR, "config.json");
const BACKEND_URL = process.env.PROGY_API_URL || "https://progy-api.francy.workers.dev";
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

// Heuristic to find the root "courses" directory
// When linked locally, import.meta.dir resolves to the real location (apps/prog/src)
// So we check ../../../courses
async function findCoursesDir(): Promise<string | null> {
  const localAttempt = join(import.meta.dir, "../../../courses");
  // Check if we are in a monorepo structure
  if (await exists(localAttempt)) {
    return localAttempt;
  }
  return null;
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

// Helper to get git info
async function getGitInfo(cwd: string): Promise<{ remoteUrl: string | null; root: string | null }> {
  try {
    const remoteProc = spawn("git", ["remote", "get-url", "origin"], { cwd });
    const remoteUrl = await new Promise<string | null>((resolve) => {
      let data = "";
      remoteProc.stdout.on("data", (d) => data += d.toString());
      remoteProc.on("close", (code) => resolve(code === 0 ? data.trim() : null));
    });

    const rootProc = spawn("git", ["rev-parse", "--show-toplevel"], { cwd });
    const root = await new Promise<string | null>((resolve) => {
      let data = "";
      rootProc.stdout.on("data", (d) => data += d.toString());
      rootProc.on("close", (code) => resolve(code === 0 ? data.trim() : null));
    });

    return { remoteUrl, root };
  } catch {
    return { remoteUrl: null, root: null };
  }
}

function generateCourseId(remoteUrl: string, repoRoot: string, cwd: string): string {
  try {
    // 1. Extract slug from URL (e.g., https://github.com/user/repo.git -> user/repo)
    let slug = "";
    if (remoteUrl.startsWith("http")) {
      const parts = remoteUrl.replace(/\.git$/, "").split("/");
      slug = parts.slice(-2).join("/");
    } else if (remoteUrl.startsWith("git@")) {
      const parts = remoteUrl.replace(/\.git$/, "").split(":");
      slug = parts[1] || "";
    }

    if (!slug) return "local/course";

    // 2. Get relative path using Node's path.relative for safety
    const relPath = relative(repoRoot.trim(), cwd.trim()).replace(/\\/g, "/");

    // 3. Combine (if relPath is empty, it means cwd == root)
    return relPath ? `${slug}/${relPath}` : slug;
  } catch {
    return "local/course";
  }
}

function openBrowser(url: string) {
  const start = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(start, [url], { shell: true }).unref();
}

// cloneCourse removed, moved to CourseLoader

async function startCourse(file: string | undefined, options: { offline: boolean }) {
  const cwd = process.cwd();
  const isOffline = !!options.offline;

  // ---------------------------------------------------------
  // RUNTIME LOGIC
  // ---------------------------------------------------------

  let runtimeCwd = cwd;
  let containerFile = "";

  // 1. Detect .progy file
  if (file && file.endsWith(".progy") && await exists(file)) {
    containerFile = resolve(file);
  } else {
    // Scan directory
    const files = await readdir(cwd);
    const progyFiles = files.filter(f => f.endsWith(".progy"));
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
      // We allow server to start so it can show "No Course" UI if implemented.
    }
  }

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

program
  .name("progy")
  .description("Universal programming course runner")
  .version(`${packageJson.version} ${isLocal ? "(local/dev)" : "(npm)"}`);

program
  .command("init")
  .description("Initialize a new course in the current directory")
  .option("-c, --course <course>", "Language/Course to initialize (e.g., rust)")
  .option("--offline", "Run in offline mode (Guest access, local storage only)")
  .action(async (options) => {
    const cwd = process.cwd();
    const isOffline = !!options.offline;
    const courseConfigPath = join(cwd, CONFIG_NAME);
    const hasConfig = await exists(courseConfigPath);
    let sourceInfo: { url: string; branch?: string; path?: string } | null = null;

    // Enforce Login if Online
    let token: string | null = null;
    if (!isOffline) {
      token = await loadToken();
      if (!token) {
        console.error("❌ Authentication required for Online Mode.");
        console.error("   Run `bunx progy login` to authenticate.");
        console.error("   Or use `--offline` for Guest access (progress will only be saved locally).");
        process.exit(1);
      }
    }

    // If no course provided, check if we are already in a course directory
    if (!options.course) {
      if (hasConfig) {
        console.log(`[INFO] Detected '${CONFIG_NAME}'. Starting progy...`);
      } else {
        console.error(`[ERROR] No '${CONFIG_NAME}' found. Please specify a course to initialize:`);
        console.error(`       progy init --course <rust|go|cloudflare...>`);
        process.exit(1);
      }
    } else {
      // Course provided, so we are initializing
      const lang = options.course;
      console.log(`[INFO] Initializing ${lang} course in ${cwd}...`);

      const coursesDir = await findCoursesDir();
      let installed = false;

      // 1. Try Local Courses Folder (Monorepo)
      if (coursesDir) {
        console.log(`[INFO] Checking local courses directory: ${coursesDir}`);
        const sourceDir = join(coursesDir, lang);
        if (await exists(sourceDir)) {
          try {
            console.log(`[VAL] Validating local course...`);
            await CourseLoader.validateCourse(sourceDir);

            const files = ["content", "runner", "Cargo.toml", "go.mod", "SETUP.md", CONFIG_NAME];
            for (const file of files) {
              const srcPath = join(sourceDir, file);
              const destPath = join(cwd, file);
              if (await exists(srcPath)) {
                console.log(`[COPY] ${file}...`);
                await cp(srcPath, destPath, { recursive: true });
              }
            }
            installed = true;
          } catch (e) {
            console.warn(`[WARN] Local course validation failed: ${e}`);
          }
        }
      }

      // 1. Optimistic Check: If [course].progy exists, use it validly
      // Note: aliases like "javascript" might map to "js-essentials", so this only catches exact matches
      // or if the user provided the ID directly.
      const optimisticFile = join(cwd, `${lang}.progy`);
      if (await exists(optimisticFile)) {
        console.log(`[INFO] Found '${lang}.progy'. Opening existing file...`);
        await startCourse(optimisticFile, { offline: isOffline });
        return;
      }

      // 2. Download and Package
      const tempDir = join(tmpdir(), `progy-init-${Date.now()}`);
      await mkdir(tempDir, { recursive: true });
      let courseId = lang.replace(/\//g, "-");

      try {
        // Download to temp
        sourceInfo = await CourseLoader.load(lang, tempDir);

        // Read config to get real ID and inject metadata
        const configPath = join(tempDir, CONFIG_NAME);
        if (await exists(configPath)) {
          const configContent = await readFile(configPath, "utf-8");
          const config = JSON.parse(configContent);

          if (config.id) courseId = config.id;

          // Metadata Injection
          let updated = false;
          if (sourceInfo) {
            config.repo = sourceInfo.url;
            updated = true;
          }

          if (updated) {
            await writeFile(configPath, JSON.stringify(config, null, 2));
            console.log(`[META] Course metadata injected.`);
          }
        }

        // Pack to .progy file
        const progyFile = join(cwd, `${courseId}.progy`);
        if (await exists(progyFile)) {
          console.log(`[INFO] File '${courseId}.progy' already exists. Using existing file.`);
          // Skip packaging, just proceed to start
        } else {
          // Package the course
          console.log(`[INFO] Packaging course from ${tempDir}...`);
          await CourseContainer.pack(tempDir, progyFile);
          console.log(`[SUCCESS] Course packaged: ${courseId}.progy`);
        }

        // 4. Clean up temp
        if (tempDir && await exists(tempDir)) {
          await rm(tempDir, { recursive: true, force: true });
        }

        console.log(`\nTo start the course, run:\n  bunx progy`);

        // Auto-start
        await startCourse(progyFile, { offline: isOffline });

      } catch (e) {
        console.error(`[ERROR] Failed to initialize course: ${e}`);
        await rm(tempDir, { recursive: true, force: true });
        process.exit(1);
      } finally {
        if (await exists(tempDir)) {
          await rm(tempDir, { recursive: true, force: true });
        }
      }
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
      baseURL: BACKEND_URL,
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

program.parse();
