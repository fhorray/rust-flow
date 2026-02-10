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
  const key = `packages/${name}/${version}.progy`;

  // analytics logic could go here

  const object = await c.env.R2.get(key);
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
  const key = `packages/${metadata.name}/${metadata.version}.progy`;
  await c.env.R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: 'application/octet-stream' },
    customMetadata: { userId: user.id, version: metadata.version },
  });

  // 6. Record Version
  await db.insert(schema.registryVersions).values({
    id: crypto.randomUUID(),
    packageId: pkg.id,
    version: metadata.version,
    storageKey: key,
    sizeBytes: file.size,
    checksum: 'sha256-placeholder', // TODO: Compute actual checksum
    changelog: metadata.changelog,
  });

  // 7. Update Package Head
  await db
    .update(schema.registryPackages)
    .set({ latestVersion: metadata.version, updatedAt: new Date() })
    .where(eq(schema.registryPackages.id, pkg.id));

  return c.json({ success: true, version: metadata.version });
});

export default registry;
