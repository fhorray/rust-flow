import { authServer } from "./auth";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { Context } from "hono";

// Helper for robust session verification
export async function verifySession(c: Context<{ Bindings: CloudflareBindings }>) {
  const auth = authServer(c.env);
  const authHeader = c.req.header('Authorization');
  const db = drizzle(c.env.DB);

  let token = '';
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  try {
    // 1. Better Auth check (Standard Cookie/Header)
    const session = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (session) {
      return session;
    }

    // 2. Manual Lookup (Fallback for CLI/Bearer if not handled by better-auth yet)
    if (token) {
      // A. Check 'session' table by token string
      const sessionRow = await db.select()
        .from(schema.session)
        .where(eq(schema.session.token, token))
        .get();

      if (sessionRow) {
        const userRow = await db.select()
          .from(schema.user)
          .where(eq(schema.user.id, sessionRow.userId))
          .get();

        if (userRow) {
          // Return compatible session object
          return {
            user: userRow as typeof schema.user.$inferSelect,
            session: sessionRow as typeof schema.session.$inferSelect
          };
        }
      }

      // B. Check if token is actually a Session ID (some clients might send ID)
      // (This was in original index.ts logic, keeping for compatibility)
      const sessionById = await db.select()
        .from(schema.session)
        .where(eq(schema.session.id, token))
        .get();
      if (sessionById) {
        const userRow = await db.select()
          .from(schema.user)
          .where(eq(schema.user.id, sessionById.userId))
          .get();
        if (userRow) {
          return {
            user: userRow as typeof schema.user.$inferSelect,
            session: sessionById as typeof schema.session.$inferSelect
          };
        }
      }
    }
    return null;
  } catch (err: any) {
    console.error(`[AUTH-ERROR-CRITICAL] ${err.message}`, err.stack);
    return null;
  }
}
