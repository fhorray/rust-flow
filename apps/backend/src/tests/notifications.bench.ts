
import { Hono } from "hono";
import notifications from "../modules/notifications";
import { describe, test, expect } from "bun:test";

// Mock Notification Type
interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Mock KV
class MockKV {
  store: Map<string, string> = new Map();
  latencyMs = 5; // Simulate network latency per operation

  async list(options: { prefix: string }) {
    await new Promise(r => setTimeout(r, this.latencyMs));
    const keys = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(options.prefix)) {
        keys.push({ name: key });
      }
    }
    return { keys, list_complete: true, cursor: null };
  }

  async get(key: string) {
    await new Promise(r => setTimeout(r, this.latencyMs));
    return this.store.get(key) || null;
  }

  async put(key: string, value: string) {
    await new Promise(r => setTimeout(r, this.latencyMs));
    this.store.set(key, value);
  }

  async delete(key: string) {
      await new Promise(r => setTimeout(r, this.latencyMs));
      this.store.delete(key);
  }
}

// Mock User
const mockUser = {
  id: "user_123",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  subscription: "free",
  hasLifetime: false,
} as any;

describe("Notifications Performance", () => {
  const kv = new MockKV();
  const app = new Hono<{ Bindings: { KV: any }, Variables: { user: any } }>()
    .use('*', async (c, next) => {
      c.set('user', mockUser);
      await next();
    })
    .route('/', notifications);

  // Helper to seed notifications
  const seedNotifications = async (count: number) => {
    kv.store.clear();
    for (let i = 0; i < count; i++) {
      const notification: Notification = {
        id: `notif_${i}`,
        userId: mockUser.id,
        type: "system",
        title: `Notification ${i}`,
        message: "This is a test notification",
        read: false, // Ensure they are unread so read-all does work
        createdAt: new Date().toISOString(),
      };
      await kv.put(`notifications:${mockUser.id}:${notification.id}`, JSON.stringify(notification));
    }
  };

  test("Benchmark Read-All (50 notifications)", async () => {
    const COUNT = 50;

    // Warmup
    await seedNotifications(5);
    await app.request("/read-all", { method: "POST" }, { KV: kv });

    // Measure
    await seedNotifications(COUNT);
    const start = performance.now();
    const res = await app.request("/read-all", { method: "POST" }, { KV: kv });
    const end = performance.now();

    expect(res.status).toBe(200);
    const duration = end - start;
    console.log(`\n[Benchmark] Read-All ${COUNT} notifications took: ${duration.toFixed(2)}ms`);

    // Verify all are read
    const keys = await kv.list({ prefix: `notifications:${mockUser.id}:` });
    for(const key of keys.keys) {
        const val = await kv.get(key.name);
        const n = JSON.parse(val!);
        if (!n.read) throw new Error("Notification not marked as read");
    }
  });
});
