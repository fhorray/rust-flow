import { serve } from "bun";
import index from "../../public/index.html";
import { readdir, readFile, writeFile, mkdir, stat, exists } from "node:fs/promises";
import { join, dirname } from "node:path";
import { spawn } from "node:child_process";

// Paths relative to the current working directory where the user ran `prog init`
const CWD = process.cwd();
const LESSONS_DIR = join(CWD, "lessons");
const COURSE_CONFIG_PATH = join(CWD, "course.json");
const RUSTFLOW_DIR = join(CWD, ".rustflow");
const CONFIG_PATH = join(RUSTFLOW_DIR, "config.json");
const MANIFEST_PATH = join(RUSTFLOW_DIR, "exercises.json");

console.log(`[INFO] Server starting...`);
console.log(`[INFO] CWD: ${CWD}`);

interface CourseConfig {
  language: string;
  commands: {
    test: string;
  };
}

async function getCourseConfig(): Promise<CourseConfig | null> {
  try {
    const content = await readFile(COURSE_CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error("[ERROR] Failed to read course.json:", e);
    return null;
  }
}

async function getApiKey() {
  try {
    const configText = await readFile(CONFIG_PATH, "utf-8");
    const config = JSON.parse(configText);
    return config.api_keys?.OpenAI;
  } catch (e) {
    return process.env.OPENAI_API_KEY;
  }
}

async function scanAndGenerateManifest() {
  console.log("[INFO] Scanning exercises to generate manifest...");
  try {
    // Check if lessons dir exists
    if (!await exists(LESSONS_DIR)) {
      console.warn(`[WARN] Lessons directory not found at ${LESSONS_DIR}`);
      return {};
    }

    const allFiles = await readdir(LESSONS_DIR);
    const modules = allFiles.filter(m => m !== "mod.rs" && m !== "README.md" && !m.startsWith("."));

    // Sort modules numerically (e.g. 01_variables < 02_functions)
    modules.sort((a, b) => {
      const numA = parseInt(a.split('_')[0] || "999");
      const numB = parseInt(b.split('_')[0] || "999");
      return numA - numB;
    });

    const manifest: Record<string, any[]> = {};

    for (const mod of modules) {
      const modPath = join(LESSONS_DIR, mod);
      const stats = await stat(modPath);

      if (stats.isDirectory()) {
        const entries = await readdir(modPath, { withFileTypes: true });

        // Try to read info.toml for explicit order
        let explicitOrder: string[] | null = null;
        try {
          const infoPath = join(modPath, "info.toml");
          // Simple TOML parsing for "name" fields
          const content = await readFile(infoPath, "utf-8");
          const matches = content.match(/name\s*=\s*"(.*?)"/g);
          if (matches) {
            explicitOrder = matches.map(m => m.match(/"(.*?)"/)?.[1] || "").filter(Boolean);
          }
        } catch (e) { /* ignore */ }

        // Parse README for pedagogical order if available (fallback)
        const pedagogicalOrder: string[] = explicitOrder || [];
        if (!explicitOrder) {
          try {
            const readmePath = join(modPath, "README.md");
            const content = await readFile(readmePath, "utf-8");
            const lines = content.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("-") && trimmed.includes("[")) {
                const match = trimmed.match(/\[(.*?)\]/);
                if (match) pedagogicalOrder.push(match[1] as string);
              }
            }
          } catch (e) { /* ignore */ }
        }

        manifest[mod] = [];

        for (const entry of entries) {
          if (entry.name === 'mod.rs' || entry.name === 'README.md' || entry.name === 'info.toml') continue;

          // Logic to determine if it's an exercise directory or file
          let exercisePath = "";
          let markdownPath: string | null = null;
          let exerciseName = entry.name;
          const entryPath = join(modPath, entry.name);

          if (entry.isDirectory()) {
             // Look for main exercise file
             // For Rust: exercise.rs
             // For Go: main.go
             // For TS: index.ts
             // We can check common patterns
             const possibleFiles = ["exercise.rs", "main.go", "index.ts", "main.rs"];
             for (const f of possibleFiles) {
                if (await exists(join(entryPath, f))) {
                    exercisePath = join(entryPath, f);
                    break;
                }
             }

             if (!exercisePath) {
                 // Maybe the dir itself is the lesson unit (e.g. Go package)
                 // Just point to the dir relative to lessons?
                 // For now, let's assume we need a file to show code.
                 // If no specific file found, maybe list the first one?
                 const subFiles = await readdir(entryPath);
                 const firstCode = subFiles.find(f => f.endsWith('.go') || f.endsWith('.rs') || f.endsWith('.ts') || f.endsWith('.js'));
                 if (firstCode) exercisePath = join(entryPath, firstCode);
             }

             if (await exists(join(entryPath, "README.md"))) {
                 markdownPath = join(entryPath, "README.md");
             }

          } else if (entry.isFile()) {
             // Flat structure
             exercisePath = entryPath;
             exerciseName = entry.name.replace(/\.(rs|go|ts|js)$/, "");
          }

          if (exercisePath) {
              manifest[mod].push({
                  id: `${mod}/${entry.name}`,
                  module: mod,
                  cleanModule: mod.replace(/^\d+_/, ""),
                  name: entry.name,
                  exerciseName: `${mod}/${entry.name}`, // Relative to lessons dir usually
                  path: exercisePath,
                  markdownPath: markdownPath
              });
          }
        }

        // Sort exercises
        manifest[mod].sort((a, b) => {
          const nameA = a.name;
          const nameB = b.name;
          const indexA = pedagogicalOrder.indexOf(nameA);
          const indexB = pedagogicalOrder.indexOf(nameB);

          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return nameA.localeCompare(nameB);
        });
      }
    }

    await mkdir(RUSTFLOW_DIR, { recursive: true });
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`[INFO] Manifest generated successfully with ${Object.keys(manifest).length} modules.`);
    return manifest;
  } catch (error) {
    console.error("[ERROR] Failed to generate manifest:", error);
    return null;
  }
}

// Initial scan
let exerciseManifest: Record<string, any[]> | null = null;
scanAndGenerateManifest().then(m => exerciseManifest = m);

function parseOutput(rawOutput: string, success: boolean, language: string): string {
    // Simple pass-through for now, can be specialized per language
    if (success) {
        return "✅ Test Passed!\n\n" + rawOutput;
    }
    return "❌ Test Failed\n\n" + rawOutput;
}

const server = serve({
  port: 3000, // Revert to 3000 as per requirement
  routes: {
    "/": index,

    "/api/exercises": {
      async GET() {
        if (!exerciseManifest) {
          exerciseManifest = await scanAndGenerateManifest();
        }

        if (!exerciseManifest) {
            // Retry scan
             exerciseManifest = await scanAndGenerateManifest();
        }

        if (!exerciseManifest) {
             return Response.json({ error: "Failed to load exercises manifest" }, { status: 500 });
        }

        return new Response(JSON.stringify(exerciseManifest), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          }
        });
      }
    },

    "/api/exercises/code": {
      async GET(req) {
        const url = new URL(req.url);
        const filePath = url.searchParams.get('path');
        const markdownPath = url.searchParams.get('markdownPath');

        if (!filePath) {
          return new Response('Missing path parameter', { status: 400 });
        }
        try {
          const code = await readFile(filePath, 'utf-8');
          let markdown: string | null = null;

          if (markdownPath && markdownPath !== 'null' && markdownPath !== 'undefined') {
            try {
              markdown = await readFile(markdownPath, 'utf-8');
            } catch (e) {
              console.warn(`[WARN] Failed to read markdown at ${markdownPath}`);
            }
          }

          return Response.json({ code, markdown });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
        }
      }
    },

    "/api/exercises/run": {
      async POST(req) {
        try {
          const body = await req.json() as { exerciseName: string };
          const { exerciseName } = body; // e.g., "01_variables/variables1"
          console.log(`[INFO] Evaluating: ${exerciseName}`);

          const config = await getCourseConfig();
          if (!config) {
              return Response.json({ success: false, output: "Configuration not found", friendlyOutput: "❌ No course.json found." });
          }

          let commandTemplate = config.commands.test;
          // Substitute {{exercise}}
          const cmd = commandTemplate.replace("{{exercise}}", exerciseName);

          const parts = cmd.split(" ");
          const executable = parts[0];
          const args = parts.slice(1);

          return new Promise((resolve) => {
            const child = spawn(executable, args, {
              cwd: CWD,
              env: { ...process.env }, // Inherit env
              stdio: ["ignore", "pipe", "pipe"]
            });

            let output = "";
            if (child.stdout) child.stdout.on("data", (data) => output += data.toString());
            if (child.stderr) child.stderr.on("data", (data) => output += data.toString());

            child.on("close", async (code) => {
              const success = code === 0;
              const friendlyOutput = parseOutput(output, success, config.language);

              resolve(Response.json({
                success,
                output: output || "No output captured.",
                friendlyOutput
              }));
            });

            child.on("error", (err) => {
              resolve(Response.json({ success: false, output: `Spawn error: ${err.message}`, friendlyOutput: `❌ Failed to run: ${err.message}` }));
            });
          });
        } catch (e) {
          return Response.json({ success: false, output: `Error: ${String(e)}`, friendlyOutput: `❌ Error: ${String(e)}` });
        }
      }
    },

    "/api/ai/hint": {
      async POST(req) {
        const { code, error } = await req.json() as { code: string, error: string };
        const apiKey = await getApiKey();
        if (!apiKey) return Response.json({ error: "Missing API Key" }, { status: 500 });
        const config = await getCourseConfig();

        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: `You are a helpful mentor for the ${config?.language || 'programming'} language. Provide a subtle hint.` },
                { role: "user", content: `Code:\n${code}\n\nError:\n${error}` }
              ]
            })
          });
          const data = await response.json() as any;
          return Response.json({ hint: data.choices[0].message.content });
        } catch (err) {
          return Response.json({ error: "AI failed" }, { status: 500 });
        }
      }
    },
     "/api/ai/generate": {
      async POST(req) {
        const { prompt, difficulty } = await req.json() as { prompt: string, difficulty: string };
        const apiKey = await getApiKey();
        if (!apiKey) return Response.json({ error: "Missing API Key" }, { status: 500 });
        const config = await getCourseConfig();

        const systemPrompt = `You are a ${config?.language || 'programming'} expert instructor. Generate an exercise based on the user's request.

ABSOLUTE RULES:
1. Generate code WITH INTENTIONAL ERRORS for the user to fix.
2. NEVER provide working code.
3. Mark where the error is with comments like // TODO: fix this
4. Difficulty: ${difficulty}
5. Respond ONLY in valid JSON.

JSON Format:
{
  "title": "Short title",
  "description": "Description",
  "code": "// Code with errors...",
  "hint": "Subtle hint"
}`;

        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Create an exercise about: ${prompt}` }
              ],
              temperature: 0.8
            })
          });
          const data = await response.json() as any;
          const content = data.choices[0].message.content;

          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch (parseErr) {
            const jsonMatch = content.match(/```json?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[1]);
            } else {
              return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
            }
          }

          const practiceDir = join(LESSONS_DIR, "practice");
          try {
            await mkdir(practiceDir, { recursive: true });
          } catch (e) { }

          const timestamp = Date.now();
          const safeName = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);

          // Determine extension based on language
          let ext = "txt";
          if (config?.language === "rust") ext = "rs";
          else if (config?.language === "go") ext = "go";
          else if (config?.language === "typescript") ext = "ts";
          else if (config?.language === "javascript") ext = "js";

          const filename = `${safeName}_${timestamp}.${ext}`;
          const filePath = join(practiceDir, filename);

          const fileContent = `// 🤖 AI Generated Challenge
// Title: ${parsed.title}
// Description: ${parsed.description}
// Hint: ${parsed.hint}

${parsed.code}
`;
          await writeFile(filePath, fileContent, 'utf-8');
          console.log(`[INFO] Saved generated exercise to: ${filePath}`);

          exerciseManifest = null;

          return Response.json({
            ...parsed,
            filePath,
            filename,
            message: `Exercise saved to lessons/practice/${filename}`
          });
        } catch (err) {
          return Response.json({ error: "AI generation failed" }, { status: 500 });
        }
      }
    }
  },
  development: { hmr: true, console: true },
  fetch(req) { return new Response("Not Found", { status: 404 }); },
});

console.log(`🚀 RustFlow Server running at ${server.url}`);
