import { describe, test, expect, beforeAll, mock } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

// Mock DB setup
const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });

// Mock drizzle-orm/d1
mock.module("drizzle-orm/d1", () => {
  return {
    drizzle: () => db,
  };
});

// Import UserService after mocking
const { UserService } = await import("../services/user.service");

// Setup tables manually
function setupDb() {
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      email_verified INTEGER NOT NULL,
      image TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      subscription TEXT DEFAULT 'free',
      has_lifetime INTEGER DEFAULT 0,
      stripe_customer_id TEXT,
      metadata TEXT
    );
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS registries_packages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft',
      latest_version TEXT,
      is_public INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

describe("UserService Performance", () => {
  beforeAll(() => {
    setupDb();
  });

  test("updateUsername N+1 issue check", async () => {
    // 1. Seed data
    const userId = "user_1";
    await db.insert(schema.users).values({
      id: userId,
      name: "Old Name",
      username: "oldname",
      email: "test@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create another user
    await db.insert(schema.users).values({
      id: "user_2",
      name: "Other User",
      username: "otheruser",
      email: "other@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const packageCount = 5;
    const packages = [];
    for (let i = 0; i < packageCount; i++) {
      packages.push({
        id: `pkg_${i}`,
        userId: userId,
        name: `@oldname/pkg-${i}`,
        slug: `pkg-${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await db.insert(schema.registryPackages).values(packages);

    // 2. Instrument DB to count queries
    let queryCount = 0;
    const originalPrepare = sqlite.prepare;
    sqlite.prepare = (sql: string) => {
        // console.log('SQL:', sql);
        if (typeof sql === 'string' && (sql.trim().toLowerCase().startsWith('select') || sql.trim().toLowerCase().startsWith('update'))) {
             queryCount++;
        }
        return originalPrepare.call(sqlite, sql);
    };

    // 3. Run updateUsername
    const env = { DB: {} as any };
    const service = new UserService(env);

    await service.updateUsername(userId, "oldname", "newname");

    // Restore prepare
    sqlite.prepare = originalPrepare;

    console.log(`Detected queries: ${queryCount}`);

    // 4. Check data integrity
    const updatedPackages = await db.select().from(schema.registryPackages).where(eq(schema.registryPackages.userId, userId));
    expect(updatedPackages.length).toBe(packageCount);
    for(const pkg of updatedPackages) {
        expect(pkg.name).toBe(`@newname/${pkg.slug}`);
    }

    // 5. Assert optimization (N+1 eliminated)
    // 1 check user + 1 update user + 1 update packages (batch)
    // Total should be 3 queries regardless of N.
    expect(queryCount).toBeLessThanOrEqual(4);
    // We expect exactly 3, but allow some flexibility for driver internal queries if any
    expect(queryCount).toBe(3);
  });
});
