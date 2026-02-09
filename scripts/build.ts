import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

console.log("[BUILD] Starting build process...");

const ROOT = join(import.meta.dir, "../apps/cli");
const DIST = join(ROOT, "dist");
const PUBLIC_SRC = join(ROOT, "public");
const PUBLIC_DIST = join(DIST, "public");

// 1. Clean dist
await rm(DIST, { recursive: true, force: true });
await mkdir(PUBLIC_DIST, { recursive: true });

// Copy static assets
// We need to copy everything from PUBLIC_SRC to PUBLIC_DIST excluding index.html which is processed later
// But simplest is to copy all and overwrite index.html later.
// Bun/Node cp
const { cp } = await import("node:fs/promises");
await cp(PUBLIC_SRC, PUBLIC_DIST, { recursive: true });

console.log("[BUILD] Building Frontend...");
// 2. Build Frontend
const frontendBuild = await Bun.build({
  entrypoints: [join(ROOT, "src/frontend/main.tsx")],
  outdir: PUBLIC_DIST,
  naming: "main.[ext]", // Force main.js / main.css
  minify: true,
});

if (!frontendBuild.success) {
  console.error("Frontend build failed:", frontendBuild.logs);
  process.exit(1);
}

// 3. Process index.html
console.log("[BUILD] Processing index.html...");
let indexHtml = await readFile(join(PUBLIC_SRC, "index.html"), "utf-8");

// Replace script tag TSX -> JS
// Matches <script type="module" src="../src/frontend/main.tsx"></script> or similar
indexHtml = indexHtml.replace(/src=".*main\.tsx"/, 'src="/main.js"');

// Inject CSS if generated
if (existsSync(join(PUBLIC_DIST, "main.css"))) {
  if (!indexHtml.includes("main.css")) {
    indexHtml = indexHtml.replace("</head>", '<link rel="stylesheet" href="/main.css">\n</head>');
  }
}

await writeFile(join(PUBLIC_DIST, "index.html"), indexHtml);

// 4. Build Backend & CLI
console.log("[BUILD] Building Backend & CLI...");
const backendBuild = await Bun.build({
  entrypoints: [
    join(ROOT, "src/cli.ts"),
    join(ROOT, "src/backend/server.ts")
  ],
  outdir: DIST,
  target: "bun",
  minify: true,
  external: ["better-auth"], // Externalize if needed, usually CLI bundles deps? Or relies on node_modules?
  // For npm cli, we usually want minimal bundle, relying on installed node_modules.
  // But Bun target bundles.
  // Let's bundle to specific file names to match package.json bin
});

if (!backendBuild.success) {
  console.error("Backend build failed:", backendBuild.logs);
  process.exit(1);
}

console.log("[BUILD] Success! Artifacts in dist/");
