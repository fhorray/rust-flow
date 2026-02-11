import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';


export default async (c: Context, next: Next) => {

  const corsMid = cors({
    origin: ['http://localhost:3001', 'https://api.progy.dev', 'https://progy.dev'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  return corsMid(c, next)
};