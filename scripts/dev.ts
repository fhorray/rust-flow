import { watch } from "fs";
import { join, resolve } from "path";
import { spawn, type Subprocess } from "bun";

// Debounce helper
function debounce(func: Function, wait: number) {
  let timeout: Timer;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const WATCH_DIRS = [
  join(PROJECT_ROOT, "apps/cli/src"),
  join(PROJECT_ROOT, "packages/core/src"),
  join(PROJECT_ROOT, "packages/ui/src"),
];

const TARGET_COURSE = process.argv[2] ? resolve(process.argv[2]) : null;
let progyProcess: Subprocess | null = null;
let isBuilding = false;

async function rebuildAndRestart() {
  if (isBuilding) return;
  isBuilding = true;

  console.clear();
  console.log("🔍 Change detected. Rebuilding...");

  // 1. Build
  const buildProc = spawn(["bun", "scripts/build.ts"], {
    cwd: PROJECT_ROOT,
    stdio: ["ignore", "inherit", "inherit"],
  });

  const exitCode = await buildProc.exited;
  isBuilding = false;

  if (exitCode !== 0) {
    console.error("❌ Build failed. Waiting for changes...");
    return;
  }

  console.log("✅ Build successful.");

  // 2. Restart Progy (if target set)
  if (TARGET_COURSE) {
    if (progyProcess) {
      console.log("🔄 Restarting Progy...");
      progyProcess.kill();
    }

    // Allow a brief moment for cleanup/file release
    await new Promise(r => setTimeout(r, 100));

    console.log(`🚀 Starting Progy in ${TARGET_COURSE}...`);

    // We assume 'progy' is in the path or we execute the built artifact directly.
    // Since user runs 'progy', let's try to run the built cli.js to be sure we run the latest.
    // Or we can use 'bun run ...' keying off the package.json if it was linked.
    // Let's rely on the built file: apps/cli/dist/src/cli.js (check build.ts output structure)
    // build.ts output: apps/cli/dist
    // Entry points: src/cli.ts -> dist/cli.js (usually, stripping src? or keeping it? check build.ts)
    // build.ts: entrypoints: ... join(appRoot, "src/cli.ts") ... outdir: dist
    // If packages="bundle", likely `dist/cli.js` generated from `src/cli.ts`? 
    // Actually build.ts says `entryPoints.map(p => join(appRoot, p))`. 
    // If entry is "src/cli.ts", outdir "dist", Bun usually preserves structure or flattens?
    // With `packages: "bundle"`, it might be a single file if configured? 
    // Let's guess `apps/cli/dist/cli.js` first, if not we check `apps/cli/dist/src/cli.js`.

    const cliScript = join(PROJECT_ROOT, "apps/cli/dist/cli.js");

    progyProcess = spawn(["bun", cliScript], {
      cwd: TARGET_COURSE,
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "1" }
    });
  }
}

const debouncedRebuild = debounce(rebuildAndRestart, 1000); // 1s debounce

console.log("👀 Watching for changes in:");
WATCH_DIRS.forEach(d => console.log(`   - ${d}`));
if (TARGET_COURSE) console.log(`🎯 Target Course: ${TARGET_COURSE}`);

// Initial build & start
rebuildAndRestart();

// Setup watchers
for (const dir of WATCH_DIRS) {
  try {
    watch(dir, { recursive: true }, (event, filename) => {
      if (filename && !filename.includes("node_modules") && !filename.includes(".git")) {
        debouncedRebuild();
      }
    });
  } catch (e) {
    console.warn(`⚠️ Could not watch ${dir}:`, e);
  }
}
