import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../db/schema';

export class UserService {
  constructor(private env: CloudflareBindings) { }

  private get db() {
    return drizzle(this.env.DB);
  }

  async updateUsername(userId: string, oldUsername: string | null, newUsername: string) {
    const username = newUsername.toLowerCase();

    // 1. Check for uniqueness
    const existing = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .get();

    if (existing && existing.id !== userId) {
      throw new Error('Username is already taken');
    }

    // 2. Update user
    await this.db.update(schema.users)
      .set({ username, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    // 3. Migrate packages
    const packages = await this.db
      .update(schema.registryPackages)
      .set({
        name: sql`'@' || ${username} || '/' || ${schema.registryPackages.slug}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.registryPackages.userId, userId))
      .returning();

    return {
      success: true,
      username,
      packagesMigrated: packages.length,
    };
  }
}
