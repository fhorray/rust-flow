import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { users } from './auth';

export const registryPackages = sqliteTable(
  'registries_packages',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    status: text('status', { enum: ['draft', 'published', 'archived', 'deleted', 'in_review', 'rejected', 'banned', 'in_development'] }).notNull().default('draft'),
    latestVersion: text('latest_version'),
    isPublic: integer('is_public', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('registry_packages_name_idx').on(table.name),
    index('registry_packages_user_id_idx').on(table.userId),
  ],
);

export const registryVersions = sqliteTable(
  'registries_versions',
  {
    id: text('id').primaryKey(),
    packageId: text('package_id')
      .notNull()
      .references(() => registryPackages.id),
    version: text('version').notNull(),
    storageKey: text('storage_key').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    checksum: text('checksum').notNull(),
    changelog: text('changelog'),
    engineVersion: text('engine_version'),
    manifest: text('manifest'),
    status: text('status', { enum: ['pending', 'active', 'rejected'] }).notNull().default('pending'),
    statusMessage: text('status_message'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('registry_versions_pkg_ver_idx').on(
      table.packageId,
      table.version,
    ),
  ],
);

export const registryDownloads = sqliteTable('registries_downloads', {
  id: text('id').primaryKey(),
  packageId: text('package_id').notNull(),
  versionId: text('version_id').notNull(),
  userId: text('user_id'),
  ipAddress: text('ip_address'),
  downloadedAt: integer('downloaded_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const registryStats = sqliteTable('registries_stats', {
  id: text('id').primaryKey(),
  packageId: text('package_id').notNull(),
  date: text('date').notNull(),
  downloadCount: integer('downloads_count').notNull().default(0),
});
