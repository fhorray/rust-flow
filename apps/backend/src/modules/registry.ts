import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { RegistryService } from '../services/registry.service';
import type { AuthVariables } from '../middlewares/auth';

const registry = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .get(
    '/resolve/:query',
    zValidator('param', z.object({ query: z.string() })),
    async (c) => {
      const { query } = c.req.valid('param');
      const user = c.get('user');
      const service = new RegistryService(c.env);
      try {
        const pkg = await service.resolvePackage(query, user);
        return c.json(pkg);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    }
  )
  .get(
    '/download/:scope/:slug/:version',
    zValidator('param', z.object({ scope: z.string(), slug: z.string(), version: z.string() })),
    async (c) => {
      const { scope, slug, version } = c.req.valid('param');
      const service = new RegistryService(c.env);
      try {
        const object = await service.downloadArtifact(scope, slug, version);
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${slug}-${version}.progy"`);
        return new Response(object.body, { headers });
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    }
  )
  .get('/@:scope/:slug/:version/*', async (c) => {
    const scope = c.req.param('scope');
    const slug = c.req.param('slug');
    const version = c.req.param('version');
    const url = new URL(c.req.url);
    const prefix = `/@${scope}/${slug}/${version}/`;
    const assetPath = url.pathname.substring(url.pathname.indexOf(prefix) + prefix.length);

    if (!assetPath) return c.json({ error: 'Asset path missing' }, 400);

    const key = `packages/@${scope}/${slug}/${version}/${assetPath}`;
    const object = await c.env.R2.get(key);
    if (!object) return c.json({ error: 'Asset not found' }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
  })
  .post('/publish', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = await c.req.parseBody();
    const file = body['file'];
    const metaStr = body['metadata'] as string;

    if (!file || !(file instanceof File)) return c.json({ error: 'Invalid file upload' }, 400);

    let metadata;
    try {
      metadata = JSON.parse(metaStr);
    } catch (e) {
      return c.json({ error: 'Invalid metadata JSON' }, 400);
    }

    const assets: Record<string, File> = {};
    for (const [k, v] of Object.entries(body)) {
      if (k.startsWith('assets/') && v instanceof File) {
        assets[k.replace('assets/', '')] = v;
      }
    }

    const service = new RegistryService(c.env);
    try {
      const result = await service.publish(user.id, (user as any).username, file, metadata, assets);
      return c.json(result);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  })
  .get('/', async (c) => {
    const service = new RegistryService(c.env);
    const results = await service.listPublicPackages();
    return c.json({ courses: results, total: results.length });
  })
  .get('/my-packages', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    const service = new RegistryService(c.env);
    const packages = await service.listMyPackages(user.id);
    return c.json({ packages });
  })
  .patch(
    '/packages/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.json({ error: 'Unauthorized' }, 401);
      const { id } = c.req.valid('param');
      const body = await c.req.json();
      const service = new RegistryService(c.env);
      try {
        const result = await service.updatePackage(user.id, id, body);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    }
  )
  .delete(
    '/packages/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const user = c.get('user');
      if (!user) return c.json({ error: 'Unauthorized' }, 401);
      const { id } = c.req.valid('param');
      const service = new RegistryService(c.env);
      try {
        const result = await service.deletePackage(user.id, id);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: e.message }, 404);
      }
    }
  );

export default registry;
