import { describe, expect, it, mock } from "bun:test";
import { DockerClient } from "../docker/client";

// Mock child_process
const mockSpawn = mock((cmd, args, opts) => {
  return {
    stdout: { on: (event, cb) => cb("mock output") },
    stderr: { on: (event, cb) => cb("") },
    on: (event, cb) => {
      if (event === "close") cb(0);
    }
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

describe("DockerClient", () => {
  it("checkAvailability returns true when docker info succeeds", async () => {
    mockSpawn.mockClear();
    const client = new DockerClient();
    const result = await client.checkAvailability();
    expect(result).toBe(true);
    expect(mockSpawn).toHaveBeenCalled();
    const calls = mockSpawn.mock.calls;
    expect(calls[0][0]).toBe("docker");
    expect(calls[0][1]).toContain("info");
  });

  it("runContainer constructs correct arguments", async () => {
    mockSpawn.mockClear();
    const client = new DockerClient();
    await client.runContainer("test-image", {
      cwd: "/test/cwd",
      command: "echo hello",
      network: "bridge"
    });

    const calls = mockSpawn.mock.calls;
    const args = calls[0][1];

    // Check core flags
    expect(args).toContain("run");
    expect(args).toContain("--rm");

    // Check network
    const netIndex = args.indexOf("--network");
    expect(netIndex).toBeGreaterThan(-1);
    expect(args[netIndex + 1]).toBe("bridge");

    // Check volume mount
    const volIndex = args.indexOf("-v");
    expect(volIndex).toBeGreaterThan(-1);
    const mountArg = `/test/cwd:/workspace`;
    expect(args[volIndex + 1]).toBe(mountArg);

    // Check image and command
    expect(args).toContain("test-image");
    expect(args).toContain("sh");
    expect(args).toContain("-c");

    const cmdIndex = args.indexOf("-c");
    expect(args[cmdIndex + 1]).toBe("echo hello");
  });
});
