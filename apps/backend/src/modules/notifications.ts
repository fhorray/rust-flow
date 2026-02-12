import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "../middlewares/auth";
import type { Notification } from "@progy/core";

const notifications = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  /**
   * List notifications for the authenticated user
   */
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      // List keys for this user
      const keys = await c.env.KV.list({
        prefix: `notifications:${user.id}:`,
      });

      // Parallel fetch for all notifications
      const values = await Promise.all(
        keys.keys.map((key) => c.env.KV.get(key.name))
      );

      const list: Notification[] = [];
      for (const val of values) {
        if (val) {
          list.push(JSON.parse(val));
        }
      }

      // Sort by descending date
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return c.json(list);
    } catch (e: any) {
      console.error("[KV-GET-ERROR]", e);
      return c.json({ error: "Failed to fetch notifications" }, 500);
    }
  })

  /**
   * Mark a notification as read (we delete it from KV to keep it clean, 
   * or we could update it. Let's update the 'read' status)
   */
  .post(
    "/read",
    zValidator(
      "json",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { id } = c.req.valid("json");
      const key = `notifications:${user.id}:${id}`;

      try {
        const val = await c.env.KV.get(key);
        if (!val) return c.json({ error: "Notification not found" }, 404);

        const notification: Notification = JSON.parse(val);
        notification.read = true;

        await c.env.KV.put(key, JSON.stringify(notification), {
          expirationTtl: 60 * 60 * 24 * 7
        });

        return c.json({ success: true });
      } catch (e: any) {
        return c.json({ error: "Failed to update notification" }, 500);
      }
    }
  )

  /**
   * Mark all as read
   */
  .post("/read-all", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
      const keys = await c.env.KV.list({ prefix: `notifications:${user.id}:` });

      await Promise.all(
        keys.keys.map(async (key) => {
          const val = await c.env.KV.get(key.name);
          if (val) {
            const notification: Notification = JSON.parse(val);
            if (!notification.read) {
              notification.read = true;
              await c.env.KV.put(key.name, JSON.stringify(notification), {
                expirationTtl: 60 * 60 * 24 * 7,
              });
            }
          }
        })
      );

      return c.json({ success: true });
    } catch (e: any) {
      return c.json({ error: "Failed to clear notifications" }, 500);
    }
  });

export default notifications;
