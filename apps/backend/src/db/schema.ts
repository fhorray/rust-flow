import { sqliteTable, text, integer, int } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  subscription: text('subscription').default('free'), // Custom field
  hasLifetime: integer('has_lifetime', { mode: 'boolean' }).default(false), // Tracks lifetime ownership
  stripeCustomerId: text('stripe_customer_id'), // New field from plugin
  metadata: text('metadata'), // JSON string for persistent settings
});

export const subscription = sqliteTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id), // Added missing userId field
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status"),
  periodStart: integer("period_start", { mode: "timestamp" }),
  periodEnd: integer("period_end", { mode: "timestamp" }),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }),
  seats: integer("seats"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id)
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const device = sqliteTable("device", {
  id: text("id").primaryKey(),
  deviceCode: text("device_code").notNull(),
  userCode: text("user_code").notNull(),
  userId: text("user_id").references(() => user.id),
  clientId: text("client_id"),
  scope: text("scope"),
  status: text("status").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  lastPolledAt: integer("last_polled_at", { mode: "timestamp" }),
  pollingInterval: integer("polling_interval"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const courseProgress = sqliteTable("course_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  courseId: text("course_id").notNull(), // e.g., 'rust-flow'
  data: text("data").notNull(), // JSON blob of the Progress object
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ─── Registry Schema ─────────────────────────────────────────────────────────

import { uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const registryPackages = sqliteTable(
  'registry_packages',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    name: text('name').notNull(), // e.g. "@diego/rust-mastery"
    slug: text('slug').notNull(), // e.g. "rust-mastery"
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
  (table) => ({
    uniqueName: uniqueIndex('registry_packages_name_idx').on(table.name),
    userIdIdx: index('registry_packages_user_id_idx').on(table.userId),
  }),
);

export const registryVersions = sqliteTable(
  'registry_versions',
  {
    id: text('id').primaryKey(),
    packageId: text('package_id')
      .notNull()
      .references(() => registryPackages.id),
    version: text('version').notNull(), // SemVer e.g. "1.0.0"
    storageKey: text('storage_key').notNull(), // R2 key
    sizeBytes: integer('size_bytes').notNull(),
    checksum: text('checksum').notNull(),
    changelog: text('changelog'),
    engineVersion: text('engine_version'), // Added for compatibility tracking
    manifest: text('manifest'), // JSON index of course content
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    uniqueVersion: uniqueIndex('registry_versions_pkg_ver_idx').on(
      table.packageId,
      table.version,
    ),
  }),
);

export const registryDownloads = sqliteTable('registry_downloads', {
  id: text('id').primaryKey(),
  packageId: text('package_id').notNull(),
  versionId: text('version_id').notNull(),
  userId: text('user_id'),
  ipAddress: text('ip_address'),
  downloadedAt: integer('downloaded_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
