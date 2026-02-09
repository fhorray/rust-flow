import { describe, test, expect, mock, beforeEach } from "bun:test";
import { DockerClient } from "../src/docker/client";
import { DockerComposeClient } from "../src/docker/compose-client";

// Mock spawn
const mockSpawn = mock(() => {
  return {
    stdout: { on: (event: string, cb: any) => { if (event === 'data') cb("output"); } },
    stderr: { on: (event: string, cb: any) => { } },
    on: (event: string, cb: any) => { if (event === 'close') cb(0); }, // Default success
    kill: () => {},
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

describe("DockerClient", () => {
  beforeEach(() => {
    mockSpawn.mockClear();
  });

  test("checkAvailability should return true if docker info succeeds", async () => {
    const client = new DockerClient();
    const result = await client.checkAvailability();
    expect(result).toBe(true);
    // checkAvailability calls runCommand which calls spawn("docker", ["info"], ...)
    expect(mockSpawn).toHaveBeenCalled();
    const calls = mockSpawn.mock.calls;
    expect(calls[0]).toEqual(["docker", ["info"], expect.any(Object)]);
  });

  test("buildImage should call docker build", async () => {
    const client = new DockerClient();
    await client.buildImage("test-tag", ".", "Dockerfile");
    const calls = mockSpawn.mock.calls;
    // Last call should be build
    const args = calls[calls.length - 1][1];
    expect(args).toEqual(["build", "-t", "test-tag", "-f", "Dockerfile", "."]);
  });

  test("runContainer should call docker run with correct args", async () => {
    const client = new DockerClient();
    await client.runContainer("test-tag", { cwd: "/app", command: "echo hello" });
    
    const calls = mockSpawn.mock.calls;
    const args = calls[calls.length - 1][1];
    
    expect(args).toContain("run");
    expect(args).toContain("-v");
    expect(args).toContain("/app:/workspace");
    expect(args).toContain("test-tag");
    expect(args).toContain("sh");
    expect(args).toContain("-c");
    expect(args).toContain("echo hello");
  });

  test("runContainer should add -t if tty is true", async () => {
    const client = new DockerClient();
    await client.runContainer("test-tag", { cwd: "/app", command: "echo", tty: true });
    
    const calls = mockSpawn.mock.calls;
    const args = calls[calls.length - 1][1];
    expect(args).toContain("-t");
  });
});

describe("DockerComposeClient", () => {
  beforeEach(() => {
    mockSpawn.mockClear();
  });

  test("detectExecutable should detect docker compose v2", async () => {
    const client = new DockerComposeClient();
    // runService awaits readyPromise
    await client.runService("docker-compose.yml", "app", "echo hello");
    
    const calls = mockSpawn.mock.calls;
    // First call: docker compose version
    expect(calls[0]).toEqual(["docker", ["compose", "version"], expect.any(Object)]);
    // Second call: docker compose -f ... run ...
    expect(calls[1][0]).toBe("docker");
    expect(calls[1][1]).toContain("compose");
    expect(calls[1][1]).toContain("run");
  });

  test("runService should call down in finally block", async () => {
    const client = new DockerComposeClient();
    await client.runService("docker-compose.yml", "app", "echo hello");
    
    const calls = mockSpawn.mock.calls;
    // First: version
    // Second: run
    // Third: down
    expect(calls.length).toBe(3);
    const downArgs = calls[2][1];
    expect(downArgs).toContain("down");
    expect(downArgs).toContain("docker-compose.yml");
  });
  
  test("detectExecutable fallback to docker-compose", async () => {
      // Mock failure for version check
      mockSpawn.mockImplementationOnce(() => ({
          stdout: { on: () => {} },
          stderr: { on: () => {} },
          on: (event: string, cb: any) => { if (event === 'close') cb(1); }, // Exit 1
          kill: () => {},
      }));
      // Mock success for runService
      mockSpawn.mockImplementationOnce(() => ({
          stdout: { on: () => {} },
          stderr: { on: () => {} },
          on: (event: string, cb: any) => { if (event === 'close') cb(0); },
          kill: () => {},
      }));
       // Mock success for down
       mockSpawn.mockImplementationOnce(() => ({
          stdout: { on: () => {} },
          stderr: { on: () => {} },
          on: (event: string, cb: any) => { if (event === 'close') cb(0); },
          kill: () => {},
      }));

      const client = new DockerComposeClient();
      await client.runService("docker-compose.yml", "app", "echo hello");
      
      const calls = mockSpawn.mock.calls;
      // First call check
      expect(calls[0]).toEqual(["docker", ["compose", "version"], expect.any(Object)]);
      
      // Second call should utilize docker-compose
      expect(calls[1][0]).toBe("docker-compose");
      expect(calls[1][1]).not.toContain("compose"); // v1 doesn't use 'compose' subcommand
      expect(calls[1][1]).toContain("run");

      // Third call should utilize docker-compose down
      expect(calls[2][0]).toBe("docker-compose");
      expect(calls[2][1]).toContain("down");
  });
});
