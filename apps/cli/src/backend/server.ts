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

import { logger } from "../core/logger";

const IS_TS = import.meta.file.endsWith(".ts");
const PUBLIC_DIR = join(import.meta.dir, IS_TS ? "../../public" : "../public");

// Server start is handled by console.log in the serve block now, or kept here if needed.
// But we want to avoid double logging with the command's banner.
// logger.info("Server engine initializing...", "BACKEND");

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
          logger.security(`Blocked CSRF attempt from ${origin}`);
          return new Response("Forbidden", { status: 403 });
        }
      }

      const localFilePath = join(PUBLIC_DIR, url.pathname);
      const file = Bun.file(localFilePath);

      // 1. Try to serve static file if it exists
      if (await file.exists()) {
        return new Response(file);
      }

      // 2. SPA Fallback: If it's not found and doesn't look like an API call or asset, serve index.html
      // We assume API routes are handled by the 'routes' object or separate logic.
      // Since 'routes' object handles exact matches or specific patterns, if we are here, it's a 404 or a client-side route.
      // We check if it lacks a file extension to assume it's a route.
      if (!url.pathname.includes('.')) {
        return new Response(Bun.file(join(PUBLIC_DIR, "index.html")));
      }

      return new Response("Not Found", { status: 404 });
    }
  });
  // logger.success(`Progy API ready`);
} catch (e: any) {
  if (e.code === "EADDRINUSE" || e.syscall === "listen") {
    logger.error(`Port 3001 is already in use.`, "To fix this: bunx progy kill-port 3001 (or close existing Progy)");
    process.exit(1);
  } else {
    throw e;
  }
}
