import { join } from "node:path";
import { logger } from "@progy/core";
import { instructorRoutes } from "./backend/endpoints/instructor";
import { configRoutes } from "./backend/endpoints/config";
import { setupRoutes } from "./backend/endpoints/setup";
import { gitRoutes } from "./backend/endpoints/git";
import { ideRoutes } from "./backend/endpoints/ide";
import { PORTS } from "@consts";

const PORT = parseInt(process.env.PORT || String(PORTS.EDITOR));
const PUBLIC_DIR = join(import.meta.dir, "..", "public");

// Force editor mode — the editor app is always in editor mode
process.env.PROGY_EDITOR_MODE = "true";

logger.brand(`✨ Progy Studio starting on http://localhost:${PORT}`);

try {
  Bun.serve({
    port: PORT,
    routes: {
      "/": () => new Response(Bun.file(join(PUBLIC_DIR, "index.html"))),

      // Frontend bundle — built on the fly via Bun.build
      "/app.js": async () => {
        const build = await Bun.build({
          entrypoints: [join(import.meta.dir, "frontend", "main.tsx")],
          minify: false,
          sourcemap: "inline",
        });

        if (!build.success) {
          const msg = build.logs.map(l => l.message).join("\n");
          logger.error("Build failed", msg);
          return new Response(`// BUILD FAILED\n${msg}`, {
            status: 500,
            headers: { "Content-Type": "application/javascript" },
          });
        }

        return new Response(build.outputs[0], {
          headers: { "Content-Type": "application/javascript" },
        });
      },

      // API health check
      "/api/health": () => Response.json({ status: "ok", app: "progy-editor" }),

      // Spread backend routes
      ...instructorRoutes,
      ...configRoutes,
      ...setupRoutes,
      ...gitRoutes,
      ...ideRoutes,
    },

    development: { hmr: true },

    async fetch(req) {
      const url = new URL(req.url);

      // CSRF Protection
      const origin = req.headers.get("Origin");
      const host = req.headers.get("Host");
      if (origin) {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          logger.error(`Blocked CSRF attempt from ${origin}`);
          return new Response("Forbidden", { status: 403 });
        }
      }

      // Try serving static files from public/
      const localFilePath = join(PUBLIC_DIR, url.pathname);
      const file = Bun.file(localFilePath);
      if (await file.exists()) {
        return new Response(file);
      }

      // SPA Fallback — serve index.html for client-side routes
      if (!url.pathname.includes(".")) {
        return new Response(Bun.file(join(PUBLIC_DIR, "index.html")));
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  logger.success(`Progy Studio ready at http://localhost:${PORT}`);
} catch (e: any) {
  if (e.code === "EADDRINUSE" || e.syscall === "listen") {
    logger.error(`Port ${PORT} is already in use.`, "Close any running Progy instance or use PORT=XXXX");
    process.exit(1);
  } else {
    throw e;
  }
}
