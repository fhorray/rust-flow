import { expect, test, describe, beforeAll, afterAll, spyOn, mock } from "bun:test";
import { CourseLoader } from "@progy/core";
import { OFICIAL_USERNAME } from "@consts";

describe("CourseLoader Registry Resolution", () => {

  beforeAll(() => {
    // Ensure we are using the REAL @progy/core and CourseLoader
    mock.restore();
    // Point to the source file to bypass mocked module cache
    mock.module("@progy/core", () => require("../index"));
  });

  test("should auto-prefix simple slug with official username", async () => {
    // Mock fetch to simulate successful resolution
    const mockResponse = {
      ok: true,
      json: async () => ({
        scope: "progy",
        slug: "sql-basics",
        latest: "1.0.0",
        downloadUrl: "https://api.progy.dev/registry/download/progy/sql-basics/1.0.0"
      })
    };

    const originalFetch = global.fetch;
    global.fetch = mock(() => Promise.resolve(mockResponse)) as any;

    try {
      const source = await CourseLoader.resolveSource("sql-basics");

      expect(global.fetch).toHaveBeenCalled();
      const callUrl = (global.fetch as any).mock.calls[0][0] as string;
      expect(callUrl).toContain(encodeURIComponent(`${OFICIAL_USERNAME}/sql-basics`));
      expect(source.isRegistry).toBe(true);
      expect(source.url).toContain("sql-basics/1.0.0");
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should preserve explicit community handle", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        scope: "fhorray",
        slug: "rust-flow",
        latest: "0.5.0",
        downloadUrl: "https://api.progy.dev/registry/download/fhorray/rust-flow/0.5.0"
      })
    };

    const originalFetch = global.fetch;
    global.fetch = mock(() => Promise.resolve(mockResponse)) as any;

    try {
      const source = await CourseLoader.resolveSource("@fhorray/rust-flow");

      expect(global.fetch).toHaveBeenCalled();
      const callUrl = (global.fetch as any).mock.calls[0][0] as string;
      expect(callUrl).toContain(encodeURIComponent("@fhorray/rust-flow"));
      expect(source.url).toContain("fhorray/rust-flow/0.5.0");
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should throw error for non-registry inputs", async () => {
    // Assert that it throws the specific error message about Git URLs not being supported
    const originalFetch = global.fetch;
    // Mock failure to trigger the catch block in loader.ts
    global.fetch = mock(() => Promise.reject(new Error("Network Error"))) as any;

    try {
      await CourseLoader.resolveSource("fhorray/some-repo");
      expect(true).toBe(false); // Should not reach here
    } catch (e: any) {
      if (!e.message.includes("Git URLs are no longer supported")) {
        console.log("Registry Test Caught Unexpected Error:", e.message);
      }
      expect(e.message).toContain("Git URLs are no longer supported");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
