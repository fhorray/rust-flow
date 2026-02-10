import { mkdir, rm, writeFile, readFile, cp } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

console.log("[BUILD] Starting monorepo build process...");

async function buildApp(appName: string, entryPoints: string[], hasFrontend: boolean = true) {
  console.log(`\n[BUILD] Building app: ${appName}...`);
  const appRoot = join(import.meta.dir, `../apps/${appName}`);
  const dist = join(appRoot, "dist");
  const publicSrc = join(appRoot, "public");
  const publicDist = join(dist, "public");

  // 1. Clean dist
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  if (hasFrontend && existsSync(publicSrc)) {
    await mkdir(publicDist, { recursive: true });

    // Copy static assets
    await cp(publicSrc, publicDist, { recursive: true });

    console.log(`[BUILD][${appName}] Building Frontend...`);
    const frontendBuild = await Bun.build({
      entrypoints: [join(appRoot, "src/frontend/main.tsx")],
      outdir: publicDist,
      naming: "main.[ext]",
      minify: true,
    });

    if (!frontendBuild.success) {
      console.error(`[${appName}] Frontend build failed:`, frontendBuild.logs);
      process.exit(1);
    }

    // Process index.html
    const indexHtmlPath = join(publicDist, "index.html");
    if (existsSync(indexHtmlPath)) {
      let indexHtml = await readFile(indexHtmlPath, "utf-8");
      // Replace source script with bundle
      indexHtml = indexHtml.replace(/src=".*frontend\/main\.tsx"/, 'src="/main.js"');
      indexHtml = indexHtml.replace(/src="\/app\.js"/, 'src="/main.js"'); // For editor index.html

      if (existsSync(join(publicDist, "main.css"))) {
        if (!indexHtml.includes("main.css")) {
          indexHtml = indexHtml.replace("</head>", '<link rel="stylesheet" href="/main.css">\n</head>');
        }
      }
      await writeFile(indexHtmlPath, indexHtml);
    }
  }

  console.log(`[BUILD][${appName}] Building Backend & CLI...`);
  const backendBuild = await Bun.build({
    entrypoints: entryPoints.map(p => join(appRoot, p)),
    outdir: dist,
    target: "bun",
    minify: true,
    packages: "bundle",
    external: [],
  });

  if (!backendBuild.success) {
    console.error(`[${appName}] Backend build failed:`, backendBuild.logs);
    process.exit(1);
  }
}

// Build CLI
await buildApp("cli", ["src/cli.ts", "src/backend/server.ts"]);

// Build Editor
await buildApp("editor", ["src/cli.ts", "src/server.ts"]);

console.log("\n[BUILD] All apps built successfully!");
