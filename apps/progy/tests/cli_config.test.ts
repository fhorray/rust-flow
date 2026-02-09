import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";

// --- Mocks ---

const mockConfig = {
    getGlobalConfig: mock(async () => ({ ai: { provider: "openai" } })),
    saveGlobalConfig: mock(async (config) => {
        // Update mock state if needed, but for now just spy
        return config;
    }),
};

mock.module("../src/core/config", () => ({
    getGlobalConfig: mockConfig.getGlobalConfig,
    saveGlobalConfig: mockConfig.saveGlobalConfig,
    loadToken: mock(async () => null),
    saveToken: mock(async () => {}),
    clearToken: mock(async () => {}),
}));


describe("CLI Config Commands", () => {

    beforeEach(() => {
        mockConfig.getGlobalConfig.mockClear();
        mockConfig.saveGlobalConfig.mockClear();
    });

    test("setConfig updates nested value", async () => {
        const { setConfig } = await import("../src/commands/config");

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(" "));

        try {
            await setConfig("ai.model", "gpt-4");
        } finally {
            console.log = originalLog;
        }

        expect(mockConfig.getGlobalConfig).toHaveBeenCalled();
        expect(mockConfig.saveGlobalConfig).toHaveBeenCalled();

        // Verify structure
        const lastCallArg = (mockConfig.saveGlobalConfig as any).mock.calls[0][0];
        expect(lastCallArg.ai.model).toBe("gpt-4");
        expect(lastCallArg.ai.provider).toBe("openai"); // Preserves existing
    });

    test("listConfig prints JSON", async () => {
        const { listConfig } = await import("../src/commands/config");

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(" "));

        try {
            await listConfig();
        } finally {
            console.log = originalLog;
        }

        const output = logs.join("");
        expect(output).toContain('"provider": "openai"');
    });
});
