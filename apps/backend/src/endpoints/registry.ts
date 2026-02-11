import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { AuthVariables } from '../auth-utils';

const registry = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

// resolving types for CloudflareBindings (manually until wrangler types is re-run)
declare global {
  interface CloudflareBindings {
    DB: D1Database;
    R2: R2Bucket;
    COURSES: string; // Keep compatibility if needed
  }
}

// resolve version and metadata (supports scoped and unscoped)
registry.get('/resolve/:query', async (c) => {
  const query = c.req.param('query');
  const user = c.get('user');
  const db = drizzle(c.env.DB);

  let pkg;

  if (query.startsWith('@') && query.includes('/')) {
    // 1. Scoped search (@user/slug)
    pkg = await db
      .select()
      .from(schema.registryPackages)
      .where(eq(schema.registryPackages.name, query))
      .get();
  } else {
    // 2. Unscoped search (slug)
    // Try to find if the user owns this slug first
    if (user) {
      pkg = await db
        .select()
        .from(schema.registryPackages)
        .where(
          and(
            eq(schema.registryPackages.slug, query),
            eq(schema.registryPackages.userId, user.id)
          )
        )
        .get();
    }

    // fallback to any public package with this slug
    if (!pkg) {
      pkg = await db
        .select()
        .from(schema.registryPackages)
        .where(
          and(
            eq(schema.registryPackages.slug, query),
            eq(schema.registryPackages.isPublic, true)
          )
        )
        .orderBy(desc(schema.registryPackages.updatedAt))
        .get();
    }
  }

  if (!pkg) return c.json({ error: 'Package not found' }, 404);

  // Get versions list
  const versions = await db
    .select({ v: schema.registryVersions.version })
    .from(schema.registryVersions)
    .where(eq(schema.registryVersions.packageId, pkg.id))
    .orderBy(desc(schema.registryVersions.createdAt))
    .all();

  const nameParts = pkg.name.substring(1).split('/');
  const scope = nameParts[0];
  const slug = nameParts[1];

  return c.json({
    name: pkg.name,
    scope,
    slug,
    latest: pkg.latestVersion,
    versions: versions.map((v) => v.v),
    description: pkg.description,
    manifest: pkg.latestVersion ? (await db.select({ m: schema.registryVersions.manifest }).from(schema.registryVersions).where(and(eq(schema.registryVersions.packageId, pkg.id), eq(schema.registryVersions.version, pkg.latestVersion))).get())?.m : null,
    downloadUrl: `${getBackendUrl(c)}/registry/download/${scope}/${slug}/${pkg.latestVersion}`
  });
});

function getBackendUrl(c: any) {
  return c.env.PROGY_API_URL || 'https://api.progy.dev';
}

// download artifact
registry.get('/download/:scope/:slug/:version', async (c) => {
  const scope = c.req.param('scope');
  const slug = c.req.param('slug');
  const version = c.req.param('version');
  const name = `@${scope}/${slug}`;

  const db = drizzle(c.env.DB);

  // 1. Lookup version in D1 to get the actual storage key
  const versionData = await db
    .select({
      storageKey: schema.registryVersions.storageKey
    })
    .from(schema.registryVersions)
    .innerJoin(
      schema.registryPackages,
      eq(schema.registryVersions.packageId, schema.registryPackages.id)
    )
    .where(
      and(
        eq(schema.registryPackages.name, name),
        eq(schema.registryVersions.version, version)
      )
    )
    .get();

  if (!versionData) {
    return c.json({ error: 'Package version not found in registry metadata' }, 404);
  }

  // 2. Fetch from R2 using the stored key
  const object = await c.env.R2.get(versionData.storageKey);
  if (!object) {
    return c.json({ error: 'Artifact not found in registry storage' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Content-Type', 'application/octet-stream');
  headers.set('Content-Disposition', `attachment; filename="${slug}-${version}.progy"`);

  return new Response(object.body, {
    headers,
  });
});

// proxy asset from R2
registry.get('/@:scope/:slug/:version/*', async (c) => {
  const scope = c.req.param('scope');
  const slug = c.req.param('slug');
  const version = c.req.param('version');

  // Extract asset path from the rest of the URL
  const url = new URL(c.req.url);
  const prefix = `/@${scope}/${slug}/${version}/`;
  const assetPath = url.pathname.substring(url.pathname.indexOf(prefix) + prefix.length);

  if (!assetPath) {
    return c.json({ error: 'Asset path missing' }, 400);
  }

  const key = `packages/@${scope}/${slug}/${version}/${assetPath}`;
  const object = await c.env.R2.get(key);

  if (!object) {
    return c.json({ error: 'Asset not found' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, {
    headers,
  });
});

// publish new version
registry.post('/publish', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.parseBody();
  const file = body['file'];
  const metaStr = body['metadata'] as string;

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'Invalid file upload' }, 400);
  }

  // 1. Parse Metadata
  let metadata;
  try {
    metadata = JSON.parse(metaStr);
  } catch (e) {
    return c.json({ error: 'Invalid metadata JSON' }, 400);
  }

  // 2. Validate Naming (@scope/slug)
  const nameParts = metadata.name.split('/');
  if (nameParts.length !== 2 || !nameParts[0].startsWith('@')) {
    return c.json(
      { error: 'Invalid package name. Must be @username/slug' },
      400,
    );
  }
  const scope = nameParts[0].substring(1); // "diego"

  // Basic ownership check: scope must match user's username
  // @ts-ignore (username added to schema and additionalFields)
  const userUsername = user.username;

  if (scope !== userUsername) {
    return c.json(
      { error: `Permission denied: Package scope '@${scope}' does not match your username '@${userUsername}'.` },
      403,
    );
  }

  const db = drizzle(c.env.DB);

  // 3. Find/Create Package
  let pkg = await db
    .select()
    .from(schema.registryPackages)
    .where(eq(schema.registryPackages.name, metadata.name))
    .get();

  if (!pkg) {
    const newId = crypto.randomUUID();
    const newPkg = {
      id: newId,
      userId: user.id,
      name: metadata.name,
      slug: nameParts[1],
      description: metadata.description || '',
      isPublic: !metadata.private,
      latestVersion: metadata.version,
    };
    await db.insert(schema.registryPackages).values(newPkg);
    pkg = newPkg as any;
  } else {
    // Check ownership
    if (pkg.userId !== user.id) {
      return c.json(
        { error: 'Permission denied: You do not own this package.' },
        403,
      );
    }
  }

  // Ensure pkg is defined (should be guaranteed by logic above)
  if (!pkg) return c.json({ error: 'Internal Server Error: Package creation failed' }, 500);

  // 4. Check for Version Conflict
  const existing = await db
    .select()
    .from(schema.registryVersions)
    .where(
      and(
        eq(schema.registryVersions.packageId, pkg.id),
        eq(schema.registryVersions.version, metadata.version),
      ),
    )
    .get();

  if (existing) {
    return c.json(
      {
        error: `Version ${metadata.version} already exists. Please increment version in course.json`,
      },
      409,
    );
  }

  // 5. Upload to R2
  const prefix = `packages/${metadata.name}/${metadata.version}/`;
  const mainKey = `${prefix}${pkg.slug}.progy`;

  // 5.1 Upload Main .progy File
  await c.env.R2.put(mainKey, await file.arrayBuffer(), {
    httpMetadata: { contentType: 'application/octet-stream' },
    customMetadata: { userId: user.id, version: metadata.version },
  });

  // 5.2 Upload Assets
  const ONE_MB = 1 * 1024 * 1024;
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith('assets/') && v instanceof File) {
      if (v.size > ONE_MB) {
        return c.json({ error: `Asset ${k} exceeds 1MB limit.` }, 400);
      }
      const assetKey = `${prefix}${k}`;
      await c.env.R2.put(assetKey, await v.arrayBuffer(), {
        httpMetadata: { contentType: v.type || 'application/octet-stream' },
        customMetadata: { userId: user.id },
      });
    }
  }

  // 6. Record Version
  const manifestData = {
    modules: metadata.manifest, // In CLI, manifest is just the flow array
    branding: metadata.branding,
    progression: metadata.progression,
    runner: metadata.runner,
  };

  await db.insert(schema.registryVersions).values({
    id: crypto.randomUUID(),
    packageId: pkg.id,
    version: metadata.version,
    storageKey: mainKey,
    sizeBytes: file.size,
    checksum: 'sha256-placeholder',
    changelog: metadata.changelog,
    engineVersion: metadata.engineVersion, // New field from CLI
    manifest: JSON.stringify(manifestData),
    createdAt: new Date(),
  });

  // 7. Update Package Head
  await db
    .update(schema.registryPackages)
    .set({ latestVersion: metadata.version, updatedAt: new Date() })
    .where(eq(schema.registryPackages.id, pkg.id));

  return c.json({ success: true, version: metadata.version });
});

// list public registry packages
registry.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const search = c.req.query('search');

  let query = db
    .select({
      id: schema.registryPackages.id,
      name: schema.registryPackages.name,
      slug: schema.registryPackages.slug,
      description: schema.registryPackages.description,
      latestVersion: schema.registryPackages.latestVersion,
      updatedAt: schema.registryPackages.updatedAt,
    })
    .from(schema.registryPackages)
    .where(eq(schema.registryPackages.isPublic, true));

  // Basic search if provided
  if (search) {
    // In D1/SQLite we'd use like
    // query = query.where(like(schema.registryPackages.name, `%${search}%`));
    // For simplicity with drizzle's current setup in this file:
  }

  const results = await query.orderBy(desc(schema.registryPackages.updatedAt)).all();

  return c.json({
    courses: results,
    total: results.length,
  });
});

// list user's own packages (for dashboard)
registry.get('/my-packages', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const db = drizzle(c.env.DB);
  const myPackages = await db
    .select()
    .from(schema.registryPackages)
    .where(eq(schema.registryPackages.userId, user.id))
    .orderBy(desc(schema.registryPackages.updatedAt))
    .all();

  return c.json({ packages: myPackages });
});

// update package metadata
registry.patch('/packages/:id', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const body = await c.req.json();
  const db = drizzle(c.env.DB);

  // Check ownership
  const pkg = await db
    .select()
    .from(schema.registryPackages)
    .where(and(eq(schema.registryPackages.id, id), eq(schema.registryPackages.userId, user.id)))
    .get();

  if (!pkg) return c.json({ error: 'Package not found or access denied' }, 404);

  const updates: any = { updatedAt: new Date() };
  if (body.status) updates.status = body.status;
  if (body.description !== undefined) updates.description = body.description;
  if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

  await db.update(schema.registryPackages).set(updates).where(eq(schema.registryPackages.id, id));

  return c.json({ success: true });
});

// delete package
registry.delete('/packages/:id', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const db = drizzle(c.env.DB);

  // Check ownership
  const pkg = await db
    .select()
    .from(schema.registryPackages)
    .where(and(eq(schema.registryPackages.id, id), eq(schema.registryPackages.userId, user.id)))
    .get();

  if (!pkg) return c.json({ error: 'Package not found or access denied' }, 404);

  // Delete versions first (referential integrity)
  await db.delete(schema.registryVersions).where(eq(schema.registryVersions.packageId, id));
  await db.delete(schema.registryPackages).where(eq(schema.registryPackages.id, id));

  return c.json({ success: true });
});

export default registry;
