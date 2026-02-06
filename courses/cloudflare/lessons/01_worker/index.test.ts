import { describe, expect, it } from "bun:test";
import worker from "./index";

describe("Worker", () => {
  it("should return Hello Cloudflare", async () => {
    const req = new Request("http://localhost/");
    const res = await worker.fetch(req);
    expect(await res.text()).toBe("Hello Cloudflare");
  });
});
