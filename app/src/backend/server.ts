import { serve } from "bun";
import index from "../../public/index.html";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const EXERCISES_DIR = join(import.meta.dir, "../../../src/exercises");
const RUSTFLOW_DIR = join(import.meta.dir, "../../../.rustflow");
const CONFIG_PATH = join(RUSTFLOW_DIR, "config.json");
const MANIFEST_PATH = join(RUSTFLOW_DIR, "exercises.json");

console.log(`[INFO] Server starting...`);
console.log(`[INFO] EXERCISES_DIR: ${EXERCISES_DIR}`);

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
    const allFiles = await readdir(EXERCISES_DIR);
    const modules = allFiles.filter(m => m !== "mod.rs" && m !== "README.md");

    // Sort modules numerically (e.g. 01_variables < 02_functions)
    modules.sort((a, b) => {
      const numA = parseInt(a.split('_')[0] || "999");
      const numB = parseInt(b.split('_')[0] || "999");
      return numA - numB;
    });

    const manifest: Record<string, any[]> = {};

    for (const mod of modules) {
      const modPath = join(EXERCISES_DIR, mod);
      const stats = await Bun.file(modPath).stat();

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
          if (entry.name === 'mod.rs' || entry.name === 'README.md') continue;

          if (entry.isDirectory()) {
            const exercisePath = join(modPath, entry.name, 'exercise.rs');
            const readmePath = join(modPath, entry.name, 'README.md');
            // Check if exercise.rs exists
            try {
              await readFile(exercisePath); // Quick check
              manifest[mod].push({
                id: `${mod}/${entry.name}`,
                module: mod,
                cleanModule: mod.replace(/^\d+_/, ""),
                name: entry.name,
                exerciseName: entry.name,
                path: exercisePath,
                markdownPath: readmePath
              });
            } catch (e) {
              // Not an exercise directory or empty
            }
          } else if (entry.isFile() && entry.name.endsWith('.rs')) {
            // Flat file support
            const name = entry.name.replace(".rs", "");
            manifest[mod].push({
              id: `${mod}/${entry.name}`,
              module: mod,
              cleanModule: mod.replace(/^\d+_/, ""),
              name: entry.name,
              exerciseName: name,
              path: join(modPath, entry.name),
              markdownPath: null
            });
          }
        }

        // Sort exercises uses pedagogical order
        manifest[mod].sort((a, b) => {
          const nameA = a.exerciseName;
          const nameB = b.exerciseName;
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

// Parse compiler output into friendly format
function parseCompilerOutput(rawOutput: string, success: boolean): string {
  if (success) {
    return "✅ All tests passed! Great job!\n\nYour solution is correct. You can move on to the next exercise.";
  }

  const lines = rawOutput.split('\n');
  const friendlyLines: string[] = [];

  // Extract only the relevant error information
  let foundError = false;
  let errorMessage = "";
  let errorLocation = "";
  let helpMessage = "";
  let codeSnippet: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Skip cargo/runner noise
    if (line.includes('warning: unused') ||
      line.includes('Compiling') ||
      line.includes('Finished') ||
      line.includes('Running') ||
      line.includes('runner') ||
      line.includes('#[warn') ||
      line.includes('= note:') ||
      line.trim() === '') {
      continue;
    }

    // Capture error line
    if (line.includes('error:') || line.includes('error[E')) {
      foundError = true;
      errorMessage = line.replace(/error\[E\d+\]:?\s*/, '').replace('error:', '').trim();
    }

    // Capture location
    if (line.includes('-->') && foundError) {
      const match = line.match(/-->\s*(.+):(\d+):(\d+)/);
      if (match) {
        const file = match[1]?.split(/[\\/]/).pop() || 'unknown';
        errorLocation = `Line ${match[2]} in ${file}`;
      }
    }

    // Capture code snippet (lines with | )
    if (line.includes(' | ') && foundError) {
      codeSnippet.push(line.trim());
    }

    // Capture help message
    if (line.includes('help:')) {
      helpMessage = line.replace('help:', '').trim();
    }
  }

  // Build friendly output
  if (foundError) {
    friendlyLines.push("❌ Compilation Error\n");
    friendlyLines.push(`📍 ${errorLocation}\n`);
    friendlyLines.push(`💡 Problem: ${errorMessage}\n`);

    if (codeSnippet.length > 0) {
      friendlyLines.push("\n📝 Your code:");
      codeSnippet.forEach(line => friendlyLines.push(`   ${line}`));
    }

    if (helpMessage) {
      friendlyLines.push(`\n🔧 Suggestion: ${helpMessage}`);
    }

    friendlyLines.push("\n\n💪 Don't give up! Fix the error and try again.");
  } else if (rawOutput.includes('❌')) {
    friendlyLines.push("❌ Test failed\n");
    friendlyLines.push("Check your logic and try again!");
  } else {
    return rawOutput; // Fallback to raw
  }

  return friendlyLines.join('\n');
}

const server = serve({
  port: 3001,
  routes: {
    "/": index,

    "/api/exercises": {
      async GET() {
        if (!exerciseManifest) {
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
          const { exerciseName } = body;
          console.log(`[INFO] Evaluating: ${exerciseName}`);

          return new Promise((resolve) => {
            const child = spawn("cargo", ["run", "-q", "-p", "runner", "--", "test", exerciseName], {
              cwd: join(import.meta.dir, "../../../"),
              env: { ...process.env, RUST_BACKTRACE: "1" },
              stdio: ["ignore", "pipe", "pipe"]
            });

            let output = "";
            if (child.stdout) child.stdout.on("data", (data) => output += data.toString());
            if (child.stderr) child.stderr.on("data", (data) => output += data.toString());

            child.on("close", async (code) => {
              const success = !output.includes("❌") && !output.includes("error[E") && !output.includes("error:");

              // Parse output into friendly format
              const friendlyOutput = parseCompilerOutput(output, success);

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

        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a Rust mentor. Provide a subtle hint." },
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

        const systemPrompt = `Você é um instrutor de Rust expert. Gere um exercício baseado no pedido do usuário.

REGRAS ABSOLUTAS:
1. Gere código COM ERROS propositais para o usuário corrigir
2. NUNCA entregue código funcionando
3. Marque onde está o erro com // TODO: fix this
4. A dificuldade é: ${difficulty}
5. Responda APENAS em JSON válido, sem markdown

Formato EXATO de resposta (JSON):
{
  "title": "Nome curto do exercício",
  "description": "Descrição do que o usuário deve fazer para corrigir",
  "code": "// Código Rust COM ERROS para corrigir\\nfn main() {...}",
  "hint": "Dica sutil SEM entregar a resposta"
}`;

        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Crie um exercício sobre: ${prompt}` }
              ],
              temperature: 0.8
            })
          });
          const data = await response.json() as any;
          const content = data.choices[0].message.content;

          // Parse JSON from response
          let parsed;
          try {
            parsed = JSON.parse(content);
          } catch (parseErr) {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```json?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[1]);
            } else {
              return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
            }
          }

          // Save to practice folder
          const practiceDir = join(EXERCISES_DIR, "practice");
          try {
            await mkdir(practiceDir, { recursive: true });
          } catch (e) {
            // Directory may already exist
          }

          // Generate unique filename
          const timestamp = Date.now();
          const safeName = parsed.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 30);
          const filename = `${safeName}_${timestamp}.rs`;
          const filePath = join(practiceDir, filename);

          // Write file with header
          const fileContent = `// 🤖 Desafio Gerado por IA
// Título: ${parsed.title}
// Descrição: ${parsed.description}
// Dica: ${parsed.hint}
//
// Corrija os erros marcados com TODO!

${parsed.code}
`;
          await writeFile(filePath, fileContent, 'utf-8');
          console.log(`[INFO] Saved generated exercise to: ${filePath}`);

          // Invalidate manifest cache
          exerciseManifest = null;

          return Response.json({
            ...parsed,
            filePath,
            filename,
            message: `Exercício salvo em src/exercises/practice/${filename}`
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
