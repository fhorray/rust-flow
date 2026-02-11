import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { UserService } from '../services/user.service';
import type { AuthVariables } from '../middlewares/auth';

const user = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .post(
    '/update-username',
    zValidator(
      'json',
      z.object({
        username: z.string().regex(/^[a-zA-Z0-9.-]{3,20}$/, 'Invalid username format. 3-20 characters, alphanumeric, dots or hyphens only.')
      })
    ),
    async (c) => {
      const sessionUser = c.get('user');
      if (!sessionUser) return c.json({ error: 'Unauthorized' }, 401);

      const { username } = c.req.valid('json');
      const userService = new UserService(c.env);

      try {
        const result = await userService.updateUsername(sessionUser.id, sessionUser.username, username);
        return c.json(result);
      } catch (e: any) {
        if (e.message === 'Username is already taken') {
          return c.json({ error: e.message }, 409);
        }
        return c.json({ error: 'Failed to update username' }, 500);
      }
    }
  );

export default user;
