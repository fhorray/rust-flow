#!/usr/bin/env bun
import { program } from "commander";
import { cp, exists, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { TEMPLATES } from "./templates";

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

async function cloneCourse(lang: string, dest: string) {
  // Fallback: Clone from the repository if local courses folder is missing
  // This supports running the tool when installed globally on a different machine
  const REPO = "https://github.com/fhorray/rust-flow.git";
  console.log(`[INFO] Local courses not found. Attempting to download ${lang} from ${REPO}...`);

  const tempDir = join(process.cwd(), ".prog-temp-" + Date.now());

  try {
    console.log(`[GIT] Cloning repository...`);
    const proc = spawn("git", ["clone", "--depth", "1", REPO, tempDir], { stdio: "inherit" });
    await new Promise((resolve, reject) => {
      proc.on("close", (code) => code === 0 ? resolve(null) : reject("Git clone failed"));
    });

    // Check generic structure: courses/<lang> or root (if repo is per-course?)
    // Assuming monorepo structure: courses/rust
    const sourceCourse = join(tempDir, "courses", lang);
    if (!(await exists(sourceCourse))) {
      // Try root if user gave specific repo
      // But for now assume monorepo
      throw new Error(`Course '${lang}' not found in repository.`);
    }

    // Copy from temp to dest
    const files = ["content", "runner", "Cargo.toml", "go.mod", "SETUP.md", CONFIG_NAME];
    for (const file of files) {
      const srcPath = join(sourceCourse, file);
      const destPath = join(dest, file);
      if (await exists(srcPath)) {
        console.log(`[COPY] ${file}...`);
        await cp(srcPath, destPath, { recursive: true });
      }
    }

  } finally {
    try {
      if (await exists(tempDir)) {
        const rm = spawn("rm", ["-rf", tempDir], { stdio: "ignore" });
        rm.unref();
      }
    } catch (e) { /* ignore */ }
  }
}

program
  .name("progy")
  .description("Universal programming course runner")
  .version("0.0.1");

program
  .command("init")
  .description("Initialize a new course in the current directory")
  .option("-c, --course <course>", "Language/Course to initialize (e.g., rust)")
  .action(async (options) => {
    const cwd = process.cwd();
    const courseConfigPath = join(cwd, CONFIG_NAME);
    const hasConfig = await exists(courseConfigPath);

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

      if (coursesDir) {
        // ...
        console.log(`[INFO] Found local courses directory: ${coursesDir}`);
        const sourceDir = join(coursesDir, lang);
        if (await exists(sourceDir)) {
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
        } else {
          console.warn(`[WARN] Course ${lang} not found locally.`);
        }
      }

      if (!installed) {
        try {
          await cloneCourse(lang, cwd);
        } catch (e) {
          console.error(`[ERROR] Failed to initialize course: ${e}`);
          process.exit(1);
        }
      }
      console.log("[INFO] Initialization complete!");
    }

    console.log("[INFO] Starting UI...");

    const serverPath = join(import.meta.dir, "backend", "server.ts");

    const child = spawn("bun", ["run", "--hot", serverPath], {
      stdio: "inherit",
      env: { ...process.env, PROG_CWD: cwd },
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

program.parse();
