import type { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";



export default async (c: Context, next: Next) => {
  const limiter = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 min
    limit: 10,
    keyGenerator: (c: Context) => {
      const user = c.get("user") as { id: string } | undefined;
      return user?.id ?? c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "guest";
    },
    handler: (c, next) => {
      return c.json({ error: "Ops! A lot of requests.", message: "Try again later." }, 429);
    },
  });

  return limiter(c, next);
};