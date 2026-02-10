# Database Migrations

Progy uses **Drizzle ORM** with **Cloudflare D1** for database management. This document explains how to handle schema changes and apply migrations in different environments.

## Prerequisites

- Ensure you have `bun` installed.
- Be logged into Cloudflare CLI (`wrangler login`) for remote migrations.

## Workflow

### 1. Modify the Schema

All database tables and relationships are defined in:
`apps/backend/src/db/schema.ts`

Make your changes directly to this file.

### 2. Generate Migration Files

After modifying the schema, you need to generate a new SQL migration file.

```bash
cd apps/backend
bun run db:gen
```

This command runs `drizzle-kit generate`, which compares your `schema.ts` with the existing migrations and creates a new `.sql` file in `apps/backend/drizzle/`.

### 3. Apply Migrations Locally

To update your local development database (SQLite handled by Wrangler), run:

```bash
cd apps/backend
bun run db:up:local
```

This script (`scripts/migrate-d1.ts`) identifies any pending migrations in the `drizzle/` folder and executes them against the local D1 instance using `wrangler d1 execute`.

### 4. Apply Migrations to Production (Remote)

To apply the changes to the live production database on Cloudflare:

```bash
cd apps/backend
bun run db:up:remote
```

> [!WARNING]
> Always verify your migration files and test locally before running this command. Remote migrations are destructive and cannot be easily undone without a backup.

## Cleaning Content

If you need to wipe all data from the database (e.g., for a fresh start or to clear test data), you can use the following commands:

**Local Environment:**

```bash
cd apps/backend
bun run db:clean:local
```

**Production Environment:**

```bash
cd apps/backend
bun run db:clean:remote
```

> [!CAUTION]
> These commands will DELETE all records from all tables (users, courses, progress, registry, etc.). This action is irreversible. Remote cleanup has a 5-second delay to prevent accidental execution.

## Visualizing the Database

You can use **Drizzle Studio** to explore your data and schema visually:

```bash
cd apps/backend
bun run db:studio
```

This will open a web interface (usually at `https://local.drizzle.studio`) where you can interact with your local database records.

## Troubleshooting

### Important Note on Errors

When running `db:up:local` or `db:up:remote`, you might see several "SQLITE_ERROR: table already exists" or "duplicate column name" errors for older migration files (e.g., `0000`, `0001`).

**This is expected behavior** because the current migration script attempts to run all files in the `drizzle/` directory sequentially. If a file fails because the table already exists, the script simply moves to the next one. As long as your **latest** migration file shows `✅ Success`, your database is up to date.

### Migration Already Applied

If a migration fails because a table or column already exists, it might be because the D1 metadata is out of sync or the migration was partially applied. Check the D1 console or the local `.wrangler` directory for consistency.

### Typescript Errors

If you add new tables, remember to run the type generator to update the `CloudflareBindings` interface:

```bash
cd apps/backend
bun run cf-typegen
```
