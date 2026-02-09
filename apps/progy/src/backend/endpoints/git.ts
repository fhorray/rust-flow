import { GitUtils } from "@/src/core/git";
import { getCourseConfig } from "../helpers";
import { join, relative } from "node:path";

const getStatus = async () => {
  const cwd = process.env.PROG_CWD;
  if (!cwd) return Response.json({ error: "No active course directory" }, { status: 500 });

  // Check strict status with branch info
  const res = await GitUtils.exec(["status", "--porcelain", "-b"], cwd);
  if (!res.success) {
    return Response.json({ error: res.stderr }, { status: 500 });
  }

  // Parse simple status
  const lines = res.stdout.split("\n").filter(l => l.trim().length > 0);

  let ahead = 0;
  let behind = 0;
  let currentBranch = "main";

  // Parse branch line (e.g. ## main...origin/main [ahead 1, behind 2])
  if (lines.length > 0 && lines[0]?.startsWith("##")) {
    const branchLine = lines[0];
    // Extract branch name
    const matchBranch = branchLine.match(/^## (.+?)\.\.\./);
    if (matchBranch && matchBranch[1]) currentBranch = matchBranch[1];

    // Extract ahead/behind
    const matchAhead = branchLine.match(/ahead (\d+)/);
    const matchBehind = branchLine.match(/behind (\d+)/);
    if (matchAhead && matchAhead[1]) ahead = parseInt(matchAhead[1], 10);
    if (matchBehind && matchBehind[1]) behind = parseInt(matchBehind[1], 10);

    // Remove branch line from changes
    lines.shift();
  }

  const changes = lines
    .map(line => {
      const code = line.substring(0, 2);
      const file = line.substring(2).trim(); // Robust parsing
      return { code, file: file.replace(/\\/g, "/") }; // Normalize Windows paths
    })
    .filter(change => {
      const filePath = change.file;

      // 1. Filter out internal progy files and common junk
      const isInternal = filePath.includes(".progy") ||
        filePath.includes(".git/") ||
        filePath.includes("node_modules/") ||
        filePath.includes("target/") ||
        filePath.includes("dist/") ||
        filePath.includes("bin/") ||
        filePath.includes(".vscode/");

      // 2. Filter out hidden files (except current dir)
      const isHidden = filePath.split("/").some(part => part.startsWith(".") && part !== ".");

      // 3. Filter out specific course metadata
      const isMetadata = filePath.endsWith("info.toml") ||
        filePath.endsWith("course.json") ||
        filePath.endsWith("package-lock.json") ||
        filePath.endsWith("bun.lockb");

      return !isInternal && !isHidden && !isMetadata;
    });

  return Response.json({ changes, ahead, behind, currentBranch });
};

const commit = async (req: Request) => {
  const cwd = process.env.PROG_CWD;
  if (!cwd) return Response.json({ error: "No active course directory" }, { status: 500 });

  try {
    const body = await req.json() as any;
    const message = body.message || "Update from Progy UI";

    if (!(await GitUtils.lock(cwd))) {
      return Response.json({ error: "Git is locked by another process" }, { status: 409 });
    }

    try {
      // 0. Ensure Git Identity (Critical for commit)
      const checkUser = await GitUtils.exec(["config", "user.name"], cwd);
      if (!checkUser.success || !checkUser.stdout.trim()) {
        // Config missing, set local fallback
        await GitUtils.configUser(cwd, "Progy User", "user@progy.dev");
      }

      // 1. Get filtered status to know what to add
      const statusRes = await GitUtils.exec(["status", "--porcelain"], cwd);
      if (!statusRes.success) {
        throw new Error(statusRes.stderr);
      }
      const config = await getCourseConfig();
      let exercisesDir = config?.content?.exercises || "exercises";
      const normalizedExercisesDir = exercisesDir.replace(/^\.\//, "").replace(/\/$/, "");

      const filesToAdd = statusRes.stdout.split("\n")
        .filter(l => l.trim().length > 0)
        .map(l => l.substring(2).trim().replace(/\\/g, "/")) // Robust parsing
        .filter(f => {
          // Sync selective filtering (must match getStatus logic)
          const isInternal = f.includes(".progy") ||
            f.includes(".git/") ||
            f.includes("node_modules/") ||
            f.includes("target/") ||
            f.includes("dist/") ||
            f.includes("bin/") ||
            f.includes(".vscode/");

          const isHidden = f.split("/").some(part => part.startsWith(".") && part !== ".");

          const isMetadata = f.endsWith("info.toml") ||
            f.endsWith("course.json") ||
            f.endsWith("package-lock.json") ||
            f.endsWith("bun.lockb");

          return !isInternal && !isHidden && !isMetadata;
        });

      if (filesToAdd.length === 0) {
        return Response.json({ success: true, message: "Nothing to commit" });
      }

      // 2. Add files explicitly
      for (const f of filesToAdd) {
        const addRes = await GitUtils.exec(["add", f], cwd);
        if (!addRes.success) {
          console.warn(`[WARN] Failed to add file ${f}: ${addRes.stderr}`);
        }
      }

      const commitRes = await GitUtils.exec(["commit", "-m", message], cwd);
      if (!commitRes.success && !commitRes.stdout.includes("nothing to commit")) {
        const errorMsg = commitRes.stderr || commitRes.stdout || "Unknown git commit error";
        throw new Error(errorMsg);
      }
      return Response.json({ success: true, stdout: commitRes.stdout });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    } finally {
      await GitUtils.unlock(cwd);
    }
  } catch (e: any) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
};

const sync = async () => {
  const cwd = process.env.PROG_CWD;
  if (!cwd) return Response.json({ error: "No active course directory" }, { status: 500 });

  if (!(await GitUtils.lock(cwd))) {
    return Response.json({ error: "Git is locked by another process" }, { status: 409 });
  }

  try {
    // 1. Pull
    const pull = await GitUtils.pull(cwd);
    if (!pull.success) {
      throw new Error(pull.stderr);
    }

    // 2. Push
    const push = await GitUtils.exec(["push", "origin", "main"], cwd);
    if (!push.success) {
      throw new Error(push.stderr);
    }

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  } finally {
    await GitUtils.unlock(cwd);
  }
};

export const gitRoutes = {
  "/local/git/status": { GET: getStatus },
  "/local/git/commit": { POST: commit },
  "/local/git/sync": { POST: sync }
};
