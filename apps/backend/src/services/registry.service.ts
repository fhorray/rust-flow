import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema';

export class RegistryService {
  constructor(private env: CloudflareBindings) { }

  private get db() {
    return drizzle(this.env.DB);
  }

  private getBackendUrl() {
    return this.env.PROGY_API_URL || 'https://api.progy.dev';
  }

  async resolvePackage(query: string, user: any | null) {
    let pkg;

    if (query.startsWith('@') && query.includes('/')) {
      pkg = await this.db.select().from(schema.registryPackages).where(eq(schema.registryPackages.name, query)).get();
    } else {
      if (user) {
        pkg = await this.db.select().from(schema.registryPackages).where(and(eq(schema.registryPackages.slug, query), eq(schema.registryPackages.userId, user.id))).get();
      }
      if (!pkg) {
        pkg = await this.db.select().from(schema.registryPackages).where(and(eq(schema.registryPackages.slug, query), eq(schema.registryPackages.isPublic, true))).orderBy(desc(schema.registryPackages.updatedAt)).get();
      }
    }

    if (!pkg) throw new Error('Package not found');

    const versions = await this.db
      .select({ v: schema.registryVersions.version })
      .from(schema.registryVersions)
      .where(eq(schema.registryVersions.packageId, pkg.id))
      .orderBy(desc(schema.registryVersions.createdAt))
      .all();

    const nameParts = pkg.name.substring(1).split('/');
    const scope = nameParts[0];
    const slug = nameParts[1];

    let manifest = null;
    let engineVersion = null;

    if (pkg.latestVersion) {
      const versionData = await this.db.select({ m: schema.registryVersions.manifest, ev: schema.registryVersions.engineVersion }).from(schema.registryVersions).where(and(eq(schema.registryVersions.packageId, pkg.id), eq(schema.registryVersions.version, pkg.latestVersion))).get();
      manifest = versionData?.m;
      engineVersion = versionData?.ev;
    }

    return {
      name: pkg.name,
      scope,
      slug,
      latest: pkg.latestVersion,
      versions: versions.map((v) => v.v),
      description: pkg.description,
      manifest,
      engineVersion,
      downloadUrl: `${this.getBackendUrl()}/registry/download/${scope}/${slug}/${pkg.latestVersion}`
    };
  }

  async downloadArtifact(scope: string, slug: string, version: string) {
    const name = `@${scope}/${slug}`;
    const versionData = await this.db
      .select({ storageKey: schema.registryVersions.storageKey })
      .from(schema.registryVersions)
      .innerJoin(schema.registryPackages, eq(schema.registryVersions.packageId, schema.registryPackages.id))
      .where(and(eq(schema.registryPackages.name, name), eq(schema.registryVersions.version, version)))
      .get();

    if (!versionData) throw new Error('Package version not found');

    const object = await this.env.R2.get(versionData.storageKey);
    if (!object) throw new Error('Artifact not found in storage');

    return object;
  }

  async publish(userId: string, userUsername: string, file: File, metadata: any, assets: Record<string, File>) {
    const nameParts = metadata.name.split('/');
    if (nameParts.length !== 2 || !nameParts[0].startsWith('@')) {
      throw new Error('Invalid package name');
    }
    const scope = nameParts[0].substring(1);

    if (scope !== userUsername) {
      throw new Error('Permission denied: Scope mismatch');
    }

    let pkg = await this.db.select().from(schema.registryPackages).where(eq(schema.registryPackages.name, metadata.name)).get();

    if (!pkg) {
      const newId = crypto.randomUUID();
      const newPkg = {
        id: newId,
        userId: userId,
        name: metadata.name,
        slug: nameParts[1],
        description: metadata.description || '',
        isPublic: !metadata.private,
        latestVersion: metadata.version,
      };
      await this.db.insert(schema.registryPackages).values(newPkg);
      pkg = newPkg as any;
    } else if (pkg.userId !== userId) {
      throw new Error('Permission denied: Ownership mismatch');
    }

    const existing = await this.db.select().from(schema.registryVersions).where(and(eq(schema.registryVersions.packageId, pkg!.id), eq(schema.registryVersions.version, metadata.version))).get();
    if (existing) throw new Error(`Version ${metadata.version} already exists`);

    const normalizedName = metadata.name.startsWith('@') ? metadata.name.substring(1) : metadata.name;
    const prefix = `packages/${normalizedName}/${metadata.version}/`;
    const mainKey = `${prefix}${pkg!.slug}.progy`;

    await this.env.R2.put(mainKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: 'application/octet-stream' },
      customMetadata: { userId: userId, version: metadata.version },
    });

    const ONE_MB = 1 * 1024 * 1024;
    await Promise.all(
      Object.entries(assets).map(async ([k, v]) => {
        if (v.size > ONE_MB) throw new Error(`Asset ${k} exceeds 1MB`);
        await this.env.R2.put(`${prefix}${k}`, await v.arrayBuffer(), {
          httpMetadata: { contentType: v.type || 'application/octet-stream' },
          customMetadata: { userId: userId },
        });
      })
    );

    const versionId = crypto.randomUUID();
    await this.db.insert(schema.registryVersions).values({
      id: versionId,
      packageId: pkg!.id,
      version: metadata.version,
      storageKey: mainKey,
      sizeBytes: file.size,
      checksum: 'sha256-placeholder',
      changelog: metadata.changelog,
      engineVersion: metadata.engineVersion,
      manifest: JSON.stringify({
        modules: metadata.manifest,
        branding: metadata.branding,
        progression: metadata.progression,
        runner: metadata.runner,
      }),
      status: 'pending',
      createdAt: new Date(),
    });

    try {
      await this.env.COURSE_GUARD.create({
        id: `cg-${versionId}`,
        params: { versionId, packageName: metadata.name, version: metadata.version }
      });
    } catch (e) {
      console.error(`[Registry] Workflow trigger failed`, e);
    }

    await this.db.update(schema.registryPackages).set({ latestVersion: metadata.version, updatedAt: new Date() }).where(eq(schema.registryPackages.id, pkg!.id));

    this.rotateVersions(metadata.name, pkg!.id).catch(e => console.error('Rotation failed', e));

    return { success: true, version: metadata.version };
  }

  private async rotateVersions(packageName: string, packageId: string) {
    const versions = await this.db.select().from(schema.registryVersions).where(eq(schema.registryVersions.packageId, packageId)).orderBy(desc(schema.registryVersions.createdAt)).all();

    if (versions.length > 3) {
      const keepVersions = new Set(versions.slice(0, 3).map(v => v.version));
      const normalizedName = packageName.startsWith('@') ? packageName.substring(1) : packageName;
      const packagePrefix = `packages/${normalizedName}/`;

      let truncated = true;
      let cursor: string | undefined;
      const r2Versions = new Set<string>();

      while (truncated) {
        const list = await this.env.R2.list({ prefix: packagePrefix, cursor, delimiter: '/' });
        for (const cp of list.delimitedPrefixes) {
          const parts = cp.split('/');
          const ver = parts[parts.length - 2];
          if (ver) r2Versions.add(ver);
        }
        truncated = list.truncated;
        cursor = list.truncated ? list.cursor : undefined;
      }

      for (const ver of r2Versions) {
        if (!keepVersions.has(ver)) {
          const versionPrefix = `${packagePrefix}${ver}/`;
          let vTruncated = true;
          let vCursor: string | undefined;
          while (vTruncated) {
            const vList = await this.env.R2.list({ prefix: versionPrefix, cursor: vCursor });
            const keys = vList.objects.map((obj) => obj.key);
            if (keys.length > 0) await this.env.R2.delete(keys);
            vTruncated = vList.truncated;
            vCursor = vList.truncated ? vList.cursor : undefined;
          }
        }
      }

      const toDeleteFromDb = versions.slice(3);
      for (const oldVer of toDeleteFromDb) {
        await this.db.delete(schema.registryVersions).where(eq(schema.registryVersions.id, oldVer.id));
      }
    }
  }

  async listPublicPackages() {
    return await this.db
      .select({
        id: schema.registryPackages.id,
        name: schema.registryPackages.name,
        slug: schema.registryPackages.slug,
        description: schema.registryPackages.description,
        latestVersion: schema.registryPackages.latestVersion,
        updatedAt: schema.registryPackages.updatedAt,
      })
      .from(schema.registryPackages)
      .where(eq(schema.registryPackages.isPublic, true))
      .orderBy(desc(schema.registryPackages.updatedAt))
      .all();
  }

  async listMyPackages(userId: string) {
    return await this.db
      .select()
      .from(schema.registryPackages)
      .where(eq(schema.registryPackages.userId, userId))
      .orderBy(desc(schema.registryPackages.updatedAt))
      .all();
  }

  async updatePackage(userId: string, id: string, body: any) {
    const pkg = await this.db.select().from(schema.registryPackages).where(and(eq(schema.registryPackages.id, id), eq(schema.registryPackages.userId, userId))).get();
    if (!pkg) throw new Error('Package not found');

    const updates: any = { updatedAt: new Date() };
    if (body.status) updates.status = body.status;
    if (body.description !== undefined) updates.description = body.description;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

    await this.db.update(schema.registryPackages).set(updates).where(eq(schema.registryPackages.id, id));
    return { success: true };
  }

  async deletePackage(userId: string, id: string) {
    const pkg = await this.db.select().from(schema.registryPackages).where(and(eq(schema.registryPackages.id, id), eq(schema.registryPackages.userId, userId))).get();
    if (!pkg) throw new Error('Package not found');

    try {
      const normalizedName = pkg.name.startsWith('@') ? pkg.name.substring(1) : pkg.name;
      const prefix = `packages/${normalizedName}/`;
      let truncated = true;
      let cursor: string | undefined;
      while (truncated) {
        const list = await this.env.R2.list({ prefix, cursor });
        const keys = list.objects.map((obj) => obj.key);
        if (keys.length > 0) await this.env.R2.delete(keys);
        truncated = list.truncated;
        cursor = list.truncated ? list.cursor : undefined;
      }
    } catch (e) {
      console.error(`[Registry] R2 cleanup failed`, e);
    }

    await this.db.delete(schema.registryVersions).where(eq(schema.registryVersions.packageId, id));
    await this.db.delete(schema.registryPackages).where(eq(schema.registryPackages.id, id));
    return { success: true };
  }
}
