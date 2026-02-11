import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { GitService } from "../services/git.service";
import type { AuthVariables } from "../middlewares/auth";

const git = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .get("/credentials", async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const gitService = new GitService(c.env);
    try {
      const creds = await gitService.getCredentials(user.id);
      return c.json(creds);
    } catch (e: any) {
      if (e.message === "No GitHub connection found") return c.json({ error: e.message }, 404);
      if (e.message === "GitHub token expired") return c.json({ error: e.message }, 403);
      return c.json({ error: "Internal error" }, 500);
    }
  })
  .post(
    "/ensure-repo",
    zValidator(
      "json",
      z.object({
        courseId: z.string()
      })
    ),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId } = c.req.valid('json');
      const gitService = new GitService(c.env);

      try {
        const result = await gitService.ensureRepo(user.id, courseId);
        return c.json(result);
      } catch (e: any) {
        console.error("[GIT-ERROR]", e);
        return c.json({ error: e.message }, 500);
      }
    }
  );

export default git;
