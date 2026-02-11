import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ProgressService } from "../services/progress.service";
import type { AuthVariables } from "../middlewares/auth";

const progress = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .post(
    "/sync",
    zValidator(
      "json",
      z.object({
        courseId: z.string(),
        data: z.any()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId, data } = c.req.valid("json");
      const progressService = new ProgressService(c.env);

      try {
        const result = await progressService.syncProgress(user.id, courseId, data);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: "Failed to sync progress" }, 500);
      }
    }
  )
  .get(
    "/get",
    zValidator(
      "query",
      z.object({
        courseId: z.string()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId } = c.req.valid("query");
      const progressService = new ProgressService(c.env);

      try {
        const data = await progressService.getProgress(user.id, courseId);
        return c.json(data);
      } catch (e: any) {
        return c.json(null);
      }
    }
  )
  .get("/list", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const progressService = new ProgressService(c.env);
    try {
      const list = await progressService.listProgress(user.id);
      return c.json(list);
    } catch (e: any) {
      return c.json([]);
    }
  })
  .post(
    "/reset",
    zValidator(
      "json",
      z.object({
        courseId: z.string()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId } = c.req.valid("json");
      const progressService = new ProgressService(c.env);

      try {
        const result = await progressService.resetProgress(user.id, courseId);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: "Failed to reset progress" }, 500);
      }
    }
  );

export default progress;
