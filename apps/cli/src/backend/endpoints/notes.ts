import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import type { ServerType } from "@progy/core";

const saveNoteHandler: ServerType<"/notes/save"> = async (req) => {
  try {
    const { path: notePath, content } = await req.json() as { path: string, content: string };

    if (!notePath || !content) {
      return Response.json({ success: false, error: "Missing path or content" }, { status: 400 });
    }

    const cwd = process.env.PROG_CWD;
    if (!cwd) return Response.json({ error: "No active course directory" }, { status: 500 });

    // Security: Prevent breaking out of root
    const absoluteBase = resolve(cwd);
    const fullPath = resolve(cwd, notePath);
    const relFromBase = relative(absoluteBase, fullPath);

    if (relFromBase.startsWith('..') || isAbsolute(relFromBase)) {
      return Response.json({ success: false, error: "Invalid path" }, { status: 400 });
    }

    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true });

    // Write file
    await writeFile(fullPath, content, "utf-8");

    return Response.json({ success: true, path: fullPath });
  } catch (e: any) {
    console.error(`[NOTES] Failed to save note: ${e}`);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
};

export const notesRoutes = {
  "/notes/save": { POST: saveNoteHandler }
};
