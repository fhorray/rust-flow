import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { AuthVariables } from '../auth-utils';

const user = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

// update username
user.post('/update-username', async (c) => {
  const sessionUser = c.get('user');
  if (!sessionUser) return c.json({ error: 'Unauthorized' }, 401);

  const { username } = await c.req.json() as { username: string };

  if (!username) {
    return c.json({ error: 'Username is required' }, 400);
  }

  // 1. Validate format
  const usernameRegex = /^[a-zA-Z0-9.-]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return c.json({ error: 'Invalid username format. 3-20 characters, alphanumeric, dots or hyphens only.' }, 400);
  }

  const db = drizzle(c.env.DB);

  // 2. Check for uniqueness
  const existing = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.username, username.toLowerCase()))
    .get();

  if (existing && existing.id !== sessionUser.id) {
    return c.json({ error: 'Username is already taken' }, 409);
  }

  // 3. Update
  try {
    await db
      .update(schema.user)
      .set({ username: username.toLowerCase(), updatedAt: new Date() })
      .where(eq(schema.user.id, sessionUser.id));

    return c.json({ success: true, username: username.toLowerCase() });
  } catch (e: any) {
    return c.json({ error: 'Failed to update username' }, 500);
  }
});

export default user;
