import { serve } from "bun";
import { join } from "node:path";
import { healthRoutes } from "./endpoints/health";
import { progressRoutes } from "./endpoints/progress";
import { configRoutes } from "./endpoints/config";
import { exercisesRoutes } from "./endpoints/exercises";
import { setupRoutes } from "./endpoints/setup";
import { aiRoutes } from "./endpoints/ai";
import { ideRoutes } from "./endpoints/ide";

import { authRoutes } from "./endpoints/auth";
import { settingsRoutes } from "./endpoints/settings";

const IS_TS = import.meta.file.endsWith(".ts");
const PUBLIC_DIR = join(import.meta.dir, IS_TS ? "../../public" : "../public");

console.log(`[INFO] Server starting...`);

let server;
try {
  server = serve({
    port: 3001,
    routes: {
      "/": () => new Response(Bun.file(join(PUBLIC_DIR, "index.html"))),
      "/main.js": () => new Response(Bun.file(join(PUBLIC_DIR, "main.js"))),
      "/main.css": () => new Response(Bun.file(join(PUBLIC_DIR, "main.css"))),

      // Spread specialized routes
      ...healthRoutes,
      ...progressRoutes,
      ...configRoutes,
      ...exercisesRoutes,
      ...setupRoutes,
      ...aiRoutes,
      ...ideRoutes,
      ...authRoutes,
      ...settingsRoutes,
    },
    development: { hmr: process.env.ENABLE_HMR === "true" },
    fetch(req) {
      // CSRF Protection: Strict Origin Check
      const origin = req.headers.get("Origin");
      const host = req.headers.get("Host");

      // Allow requests with no Origin (like curl, CLI, or same-origin GETs)
      // But if Origin is present, it MUST match the host (localhost:3001)
      if (origin) {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          console.warn(`[SECURITY] Blocked CSRF attempt from ${origin}`);
          return new Response("Forbidden", { status: 403 });
        }
      }

      return new Response("Not Found", { status: 404 });
    }
  });
  console.log(`🚀 Progy Server running on ${server.url}`);
} catch (e: any) {
  if (e.code === "EADDRINUSE" || e.syscall === "listen") {
    console.error(`\n❌ \x1b[31mError: Port 3001 is already in use.\x1b[0m`);
    console.error(`   To fix this, you can:`);
    console.error(`   1. Stop the other Progy instance (Ctrl+C)`);
    console.error(`   2. Kill the process manually: \x1b[33mbunx progy kill-port 3001\x1b[0m (if implemented) or use task manager`);
    console.error(`   3. Wait a few seconds and try again.\n`);
    process.exit(1);
  } else {
    throw e;
  }
}
