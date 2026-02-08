import { serve } from "bun";
import { join } from "node:path";
import { healthRoutes } from "./endpoints/health";
import { progressRoutes } from "./endpoints/progress";
import { configRoutes } from "./endpoints/config";
import { exercisesRoutes } from "./endpoints/exercises";
import { setupRoutes } from "./endpoints/setup";
import { ideRoutes } from "./endpoints/ide";

import { authRoutes } from "./endpoints/auth";
import { settingsRoutes } from "./endpoints/settings";
import { gitRoutes } from "./endpoints/git";
import { notesRoutes } from "./endpoints/notes";

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
      "/sounds/success.mp3": () => new Response(Bun.file(join(PUBLIC_DIR, "sounds/success.mp3"))),
      "/sounds/error.mp3": () => new Response(Bun.file(join(PUBLIC_DIR, "sounds/error.mp3"))),
      "/sounds/success-2.mp3": () => new Response(Bun.file(join(PUBLIC_DIR, "sounds/success-2.mp3"))),

      // Spread specialized routes
      ...healthRoutes,
      ...progressRoutes,
      ...configRoutes,
      ...exercisesRoutes,
      ...setupRoutes,
      ...ideRoutes,
      ...authRoutes,
      ...settingsRoutes,
      ...gitRoutes,
      ...notesRoutes,
    },
    development: { hmr: process.env.ENABLE_HMR === "true" },
    async fetch(req) {
      const url = new URL(req.url);

      // CSRF Protection: Strict Origin Check
      const origin = req.headers.get("Origin");
      const host = req.headers.get("Host");

      if (origin) {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          console.warn(`[SECURITY] Blocked CSRF attempt from ${origin}`);
          return new Response("Forbidden", { status: 403 });
        }
      }

      // Handle generic routes (SPA Fallback)
      // If the path doesn't start with /api and doesn't have an extension, serve index.html
      // Handle generic routes (SPA Fallback)
      // If the path doesn't start with /api and doesn't have an extension, serve index.html
      if (!url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
        return new Response(Bun.file(join(PUBLIC_DIR, "index.html")));
      }

      // Try to serve static file from public dir
      const localFilePath = join(PUBLIC_DIR, url.pathname);
      const file = Bun.file(localFilePath);
      if (await file.exists()) {
        return new Response(file);
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
