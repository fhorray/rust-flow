#!/usr/bin/env bun
import { program } from "commander";
import { cp, exists, mkdir, writeFile, readFile } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { TEMPLATES } from "./templates";
import { CourseLoader } from "./course-loader";

const CONFIG_DIR = join(homedir(), ".progy");
const GLOBAL_CONFIG_PATH = join(CONFIG_DIR, "config.json");
const BACKEND_URL = process.env.PROGY_API_URL || "https://progy.francy.workers.dev";
const FRONTEND_URL = process.env.PROGY_FRONTEND_URL || BACKEND_URL; // Assuming frontend is hosted on the same domain or subpath

const CONFIG_NAME = "course.json";

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

program
  .name("progy")
  .description("Universal programming course runner")
  .version("0.0.1");

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

      // 2. Try CourseLoader (Alias, URL, Local Path)
      if (!installed) {
        try {
          sourceInfo = await CourseLoader.load(lang, cwd);
          installed = true;
        } catch (e) {
          console.error(`[ERROR] Failed to initialize course: ${e}`);
          process.exit(1);
        }
      }
      console.log("[INFO] Initialization complete!");
    }

    // Persist Metadata & Dynamic ID Injection (Always run on init)
    try {
      if (await exists(courseConfigPath)) {
        console.log(`[DEBUG] Found course.json at ${courseConfigPath}. Checking for updates...`);
        const configContent = await readFile(courseConfigPath, "utf-8");
        const config = JSON.parse(configContent);
        let updated = false;

        // 1. If we just loaded from CourseLoader, we have source info
        if (sourceInfo) {
          console.log(`[DEBUG] sourceInfo URL: ${sourceInfo.url}`);
          config.repo = sourceInfo.url;
          updated = true;
        }

        // 2. Dynamic ID Injection based on Git (if available)
        const gitInfo = await getGitInfo(cwd);
        console.log(`[DEBUG] gitInfo: ${JSON.stringify(gitInfo)}`);

        if (gitInfo.remoteUrl && gitInfo.root) {
          const { remoteUrl, root } = gitInfo;
          if (!config.repo) {
            config.repo = remoteUrl;
            updated = true;
          }
          const newId = generateCourseId(remoteUrl, root, cwd);
          if (config.id !== newId) {
            console.log(`[ID] Updating course ID to match repository: ${newId}`);
            config.id = newId;
            updated = true;
          }
        } else if (sourceInfo) {
          // Fallback ID generation if no git but we have source
          const dummyRoot = "/";
          const newId = generateCourseId(sourceInfo.url, dummyRoot, sourceInfo.path || "");
          if (config.id !== newId) {
            console.log(`[ID] Setting course ID from source: ${newId}`);
            config.id = newId;
            updated = true;
          }
        }

        console.log(`[DEBUG] Update pending? ${updated}`);
        if (updated) {
          await writeFile(courseConfigPath, JSON.stringify(config, null, 2));
          console.log(`[META] Course metadata updated at ${courseConfigPath}.`);
        }
      } else {
        console.log(`[DEBUG] No course.json found at ${courseConfigPath}`);
      }
    } catch (e) {
      console.warn(`[WARN] Failed to update course metadata: ${e}`);
    }

    console.log(`[INFO] Starting UI in ${isOffline ? 'OFFLINE' : 'ONLINE'} mode...`);

    // dynamically find server file (ts in dev, js in prod)
    // In dev: src/cli.ts -> backend/server.ts
    // In prod: dist/cli.js -> backend/server.js
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
        PROG_CWD: cwd,
        PROGY_OFFLINE: isOffline ? "true" : "false"
      },
    });

    child.on("close", (code) => process.exit(code ?? 0));
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

program
  .command("login")
  .description("Authenticate with Progy")
  .action(async () => {
    // Dynamically import better-auth client to avoid top-level issues if not installed
    const { createAuthClient } = await import("better-auth/client");
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
