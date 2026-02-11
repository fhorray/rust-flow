import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";

export class ProgressService {
  constructor(private env: CloudflareBindings) { }

  private get db() {
    return drizzle(this.env.DB);
  }

  async syncProgress(userId: string, courseId: string, data: any) {
    const syncId = `${userId}:${courseId}`;
    await this.db
      .insert(schema.courseProgress)
      .values({
        id: syncId,
        userId: userId,
        courseId,
        data: typeof data === "string" ? data : JSON.stringify(data),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.courseProgress.id,
        set: {
          data: typeof data === "string" ? data : JSON.stringify(data),
          updatedAt: new Date(),
        },
      });
    return { success: true };
  }

  async getProgress(userId: string, courseId: string) {
    const progress = await this.db
      .select()
      .from(schema.courseProgress)
      .where(and(eq(schema.courseProgress.userId, userId), eq(schema.courseProgress.courseId, courseId)))
      .get();

    if (progress?.data) {
      return JSON.parse(progress.data);
    }
    return null;
  }

  async listProgress(userId: string) {
    const progressList = await this.db
      .select()
      .from(schema.courseProgress)
      .where(eq(schema.courseProgress.userId, userId))
      .all();

    return progressList.map((p) => {
      let data = {};
      try {
        data = JSON.parse(p.data);
      } catch (e) {
        console.error(`[PROGRESS-LIST-PARSE-ERROR]`, e);
      }
      return {
        courseId: p.courseId,
        data,
        updatedAt: p.updatedAt,
      };
    });
  }

  async resetProgress(userId: string, courseId: string) {
    const syncId = `${userId}:${courseId}`;
    await this.db.delete(schema.courseProgress).where(eq(schema.courseProgress.id, syncId));
    return { success: true, message: "Course progress reset successfully" };
  }
}
