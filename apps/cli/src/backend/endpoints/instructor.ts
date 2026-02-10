import { join, dirname } from "node:path";
import { readFile, writeFile, mkdir, rename, rm, readdir, stat } from "node:fs/promises";
import type { ServerType } from "../types";
import { PROG_CWD, COURSE_CONFIG_PATH, ensureConfig, currentConfig } from "../helpers";
import { logger } from "../../core/logger";
import { CourseLoader } from "../../core/loader";

const IS_EDITOR = () => process.env.PROGY_EDITOR_MODE === "true";

// Prevent directory traversal attacks
const sanitizePath = (p: string): string => {
  const resolved = join(PROG_CWD, p);
  if (!resolved.startsWith(PROG_CWD)) throw new Error("Access denied: path traversal detected");
  return resolved;
};

// Guard middleware — returns 403 if not in editor mode
const guardEditor = (): Response | null => {
  if (!IS_EDITOR()) {
    return Response.json({ error: "Editor mode not enabled" }, { status: 403 });
  }
  return null;
};

// ─── File System Handler ────────────────────────────────────────────────────

const fsGetHandler: ServerType<"/instructor/fs"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || ".";
  const typeParam = url.searchParams.get("type") || "file";

  try {
    const absPath = sanitizePath(pathParam);

    if (typeParam === "dir") {
      const entries = await readdir(absPath, { withFileTypes: true });
      const tree = entries
        .filter(e => !e.name.startsWith(".") && e.name !== "node_modules")
        .map(e => ({
          name: e.name,
          type: e.isDirectory() ? "dir" as const : "file" as const,
          path: join(pathParam, e.name).replace(/\\/g, "/"),
        }))
        .sort((a, b) => {
          // Dirs first, then alphabetical
          if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      return Response.json({ success: true, data: tree });
    } else {
      const content = await readFile(absPath, "utf-8");
      return Response.json({ success: true, content });
    }
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

const fsWriteHandler: ServerType<"/instructor/fs"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || "";
  const typeParam = url.searchParams.get("type") || "file";

  try {
    const absPath = sanitizePath(pathParam);
    const body = await req.json().catch(() => ({})) as { content?: string };

    if (typeParam === "dir") {
      await mkdir(absPath, { recursive: true });
    } else {
      await mkdir(dirname(absPath), { recursive: true });
      await writeFile(absPath, body.content || "");
    }
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

const fsDeleteHandler: ServerType<"/instructor/fs"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || "";

  try {
    const absPath = sanitizePath(pathParam);
    await rm(absPath, { recursive: true, force: true });
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

const fsMoveHandler: ServerType<"/instructor/fs"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path") || "";

  try {
    const absPath = sanitizePath(pathParam);
    const { newPath } = await req.json() as { newPath: string };
    const absNewPath = sanitizePath(newPath);
    await mkdir(dirname(absNewPath), { recursive: true });
    await rename(absPath, absNewPath);
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

// ─── Config Handler ─────────────────────────────────────────────────────────

const instructorConfigGet: ServerType<"/instructor/config"> = async () => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  try {
    const content = await readFile(COURSE_CONFIG_PATH, "utf-8");
    return Response.json({ success: true, config: JSON.parse(content) });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

const instructorConfigPost: ServerType<"/instructor/config"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  try {
    const updates = await req.json();
    await writeFile(COURSE_CONFIG_PATH, JSON.stringify(updates, null, 2));
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

// ─── Scaffold Handler ───────────────────────────────────────────────────────

const getExercisesDir = async (): Promise<string> => {
  try {
    const raw = await readFile(COURSE_CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw);
    return config?.content?.exercises || "content";
  } catch {
    return "content";
  }
};

const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const getNextNumber = async (parentDir: string): Promise<string> => {
  try {
    const entries = await readdir(parentDir, { withFileTypes: true });
    const dirs = entries
      .filter(e => e.isDirectory())
      .map(e => parseInt(e.name.split("_")[0]!))
      .filter(n => !isNaN(n));
    const next = dirs.length > 0 ? Math.max(...dirs) + 1 : 1;
    return next.toString().padStart(2, "0");
  } catch {
    return "01";
  }
};

const scaffoldHandler: ServerType<"/instructor/scaffold"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json() as {
      type: "module" | "exercise";
      title: string;
      message?: string;
      // exercise-specific
      modulePath?: string;
      fileExtension?: string;
    };

    const exercisesDir = await getExercisesDir();
    const absExercisesDir = join(PROG_CWD, exercisesDir);

    if (body.type === "module") {
      const num = await getNextNumber(absExercisesDir);
      const slug = slugify(body.title);
      const dirName = `${num}_${slug}`;
      const absDir = join(absExercisesDir, dirName);

      await mkdir(absDir, { recursive: true });

      const infoToml = `[module]\ntitle = "${body.title}"\nmessage = "${body.message || `Welcome to ${body.title}!`}"\n\n[exercises]\n`;
      await writeFile(join(absDir, "info.toml"), infoToml);

      return Response.json({
        success: true,
        path: join(exercisesDir, dirName).replace(/\\/g, "/"),
      });
    }

    if (body.type === "exercise") {
      if (!body.modulePath) {
        return Response.json({ success: false, error: "modulePath is required" }, { status: 400 });
      }

      const absModuleDir = sanitizePath(body.modulePath);
      const num = await getNextNumber(absModuleDir);
      const slug = slugify(body.title);
      const ext = body.fileExtension || "py";
      const dirName = `${num}_${slug}`;
      const absDir = join(absModuleDir, dirName);

      await mkdir(absDir, { recursive: true });

      // Create README.md
      const readme = `# ${body.title}\n\nWrite your lesson instructions here.\n`;
      await writeFile(join(absDir, "README.md"), readme);

      // Create starter code file
      const starterComments: Record<string, string> = {
        py: `# ${body.title}\n# Write your solution below\n`,
        rs: `// ${body.title}\n// Write your solution below\nfn main() {\n    \n}\n`,
        js: `// ${body.title}\n// Write your solution below\n`,
        ts: `// ${body.title}\n// Write your solution below\n`,
        sql: `-- ${body.title}\n-- Write your query below\n`,
        go: `package main\n\n// ${body.title}\nfunc main() {\n\t\n}\n`,
      };
      const starterContent = starterComments[ext] || `// ${body.title}\n`;
      const mainFile = ext === "rs" ? "exercise" : "main";
      await writeFile(join(absDir, `${mainFile}.${ext}`), starterContent);

      // Update info.toml — append exercise entry
      const infoPath = join(absModuleDir, "info.toml");
      try {
        let tomlContent = await readFile(infoPath, "utf-8");
        tomlContent = tomlContent.trimEnd() + `\n"${dirName}" = "${body.title}"\n`;
        await writeFile(infoPath, tomlContent);
      } catch {
        // info.toml doesn't exist yet — skip
      }

      return Response.json({
        success: true,
        path: join(body.modulePath, dirName).replace(/\\/g, "/"),
      });
    }

    return Response.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

// ─── Modules List Handler ───────────────────────────────────────────────────

const modulesListHandler: ServerType<"/instructor/modules"> = async () => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  try {
    const exercisesDir = await getExercisesDir();
    const absDir = join(PROG_CWD, exercisesDir);
    const entries = await readdir(absDir, { withFileTypes: true });
    const modules = entries
      .filter(e => e.isDirectory() && !e.name.startsWith("."))
      .map(e => ({
        name: e.name,
        path: join(exercisesDir, e.name).replace(/\\/g, "/"),
      }));

    // Try to read title from info.toml for each module
    const enriched = await Promise.all(
      modules.map(async (m) => {
        try {
          const toml = await readFile(join(absDir, m.name, "info.toml"), "utf-8");
          const titleMatch = toml.match(/title\s*=\s*"([^"]+)"/);
          return { ...m, title: titleMatch ? titleMatch[1]! : m.name };
        } catch {
          return { ...m, title: m.name };
        }
      })
    );

    return Response.json({ success: true, modules: enriched });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

// ─── Flow Handler ──────────────────────────────────────────────────────────

const flowHandler: ServerType = async () => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  try {
    const modules = await CourseLoader.getCourseFlow(PROG_CWD);
    return Response.json({ success: true, modules });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

// ─── Validate Handler ───────────────────────────────────────────────────────

const validateHandler: ServerType = async () => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  try {
    const config = await CourseLoader.validateCourse(PROG_CWD);
    return Response.json({
      success: true,
      message: "Course structure is valid!",
      course: { id: config.id, name: config.name },
    });
  } catch (e: any) {
    // Parse multi-line error messages into an array of issues
    const message = e.message || "Unknown validation error";
    const issues = message.split("\n").filter((l: string) => l.trim());
    return Response.json({
      success: false,
      errors: issues,
    });
  }
};

// ─── Reorder Handler ────────────────────────────────────────────────────────

const reorderHandler: ServerType<"/instructor/reorder"> = async (req) => {
  const blocked = guardEditor();
  if (blocked) return blocked;

  try {
    const { parentPath, order } = await req.json() as { parentPath: string; order: string[] };
    if (!parentPath || !Array.isArray(order)) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const absParent = sanitizePath(parentPath);
    const existing = await readdir(absParent);

    // Filter only those in the order list to prevent accidents
    const toRename = existing.filter(f => order.includes(f));

    // 1. Rename to temporary to avoid collisions
    for (const name of toRename) {
      await rename(join(absParent, name), join(absParent, `__tmp_${name}`));
    }

    // 2. Rename to new numbered names
    for (let i = 0; i < order.length; i++) {
      const oldName = order[i];
      const newPrefix = (i + 1).toString().padStart(2, "0");
      // remove old prefix if exists (e.g. 03_hello -> hello)
      const cleanName = oldName.replace(/^\d+_/, "");
      const newName = `${newPrefix}_${cleanName}`;

      await rename(join(absParent, `__tmp_${oldName}`), join(absParent, newName));
    }

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

// ─── Export Routes ──────────────────────────────────────────────────────────

export const instructorRoutes = {
  "/instructor/fs": {
    GET: fsGetHandler,
    POST: fsWriteHandler,
    PUT: fsWriteHandler,
    DELETE: fsDeleteHandler,
    PATCH: fsMoveHandler,
  },
  "/instructor/config": {
    GET: instructorConfigGet,
    POST: instructorConfigPost,
  },
  "/instructor/flow": {
    GET: flowHandler,
  },
  "/instructor/scaffold": {
    POST: scaffoldHandler,
  },
  "/instructor/modules": {
    GET: modulesListHandler,
  },
  "/instructor/validate": {
    POST: validateHandler,
  },
  "/instructor/reorder": {
    POST: reorderHandler,
  },
};
