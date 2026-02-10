import type { ServerType } from "@progy/core";
import { spawn } from "node:child_process";
import { currentConfig } from "@progy/core";

const ideOpenHandler: ServerType<"/ide/open"> = async (req) => {
  try {
    const { path } = await req.json() as { path: string };
    if (!path) return Response.json({ success: false, error: "Missing path" });

    const ideCmd = (currentConfig as any)?.editor?.ideCommand || "code";

    console.log(`[IDE] Opening ${path} with command: ${ideCmd}...`);

    // If it's just a command name, we append the path. 
    // If it's a template, we might want to replace {{path}}, but for now keep it simple.
    const child = spawn(ideCmd, [path], { shell: true, stdio: 'inherit' });

    return new Promise((resolve) => {
      child.on("error", (e) => {
        console.error(`[IDE] Failed to spawn '${ideCmd}': ${e}`);
        resolve(Response.json({ success: false, error: `${ideCmd} not found in PATH` }));
      });
      // In shell:true, it might return immediately or we might not get a reliable spawn event if it fails later
      // But for "code" it works well.
      setTimeout(() => {
        resolve(Response.json({ success: true }));
      }, 500);
    });
  } catch (e) {
    console.error(`[IDE] Failed to open: ${e}`);
    return Response.json({ success: false, error: String(e) }, { status: 500 });
  }
};

export const ideRoutes = {
  "/ide/open": { POST: ideOpenHandler }
};
