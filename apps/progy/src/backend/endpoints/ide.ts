import type { ServerType } from "../types";
import { spawn } from "node:child_process";

const ideOpenHandler: ServerType<"/ide/open"> = async (req) => {
  try {
    const { path } = await req.json() as { path: string };
    if (!path) return Response.json({ success: false, error: "Missing path" });

    // Try to open with VS Code
    console.log(`[IDE] Opening ${path} in VS Code...`);
    const child = spawn("code", [path], { shell: true });

    return new Promise((resolve) => {
      child.on("error", (e) => {
        console.error(`[IDE] Failed to spawn 'code': ${e}`);
        resolve(Response.json({ success: false, error: "VS Code not found in PATH" }));
      });
      child.on("spawn", () => {
        resolve(Response.json({ success: true }));
      });
    });
  } catch (e) {
    console.error(`[IDE] Failed to open: ${e}`);
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
};

export const ideRoutes = {
  "/ide/open": { POST: ideOpenHandler }
};
