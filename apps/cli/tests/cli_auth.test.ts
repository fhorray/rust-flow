import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";

// --- Mocks ---

// Mock Config
const mockConfig = {
    saveToken: mock(async () => {}),
    clearToken: mock(async () => {}),
};

mock.module("../src/core/config", () => ({
    saveToken: mockConfig.saveToken,
    clearToken: mockConfig.clearToken,
    loadToken: mock(async () => null), // Added missing export
    getGlobalConfig: mock(async () => ({})), // Added missing export
    saveGlobalConfig: mock(async () => {}), // Added missing export
}));

// Mock Spawn (openBrowser)
const mockSpawn = mock(() => {
    return {
        unref: () => {}
    };
});

mock.module("node:child_process", () => ({
    spawn: mockSpawn
}));


// Mock Better Auth
const mockAuthClient = {
    device: {
        code: mock(async () => ({
            data: {
                device_code: "dev-code",
                user_code: "USER-CODE",
                verification_uri: "/verify",
                interval: 0.1 // speed up test
            },
            error: null
        })),
        token: mock(async () => ({
             // Return token on first call
            data: { access_token: "mock-access-token" },
            error: null
        }))
    }
};

mock.module("better-auth/client", () => ({
    createAuthClient: () => mockAuthClient
}));

mock.module("better-auth/client/plugins", () => ({
    deviceAuthorizationClient: () => ({})
}));


describe("CLI Auth Commands", () => {

    beforeEach(() => {
        mockConfig.saveToken.mockClear();
        mockConfig.clearToken.mockClear();
        mockAuthClient.device.code.mockClear();
        mockAuthClient.device.token.mockClear();
        mockSpawn.mockClear();
    });

    test("login flow saves token on success", async () => {
        const { login } = await import("../src/commands/auth");

        // Spy on console to avoid noise
        const originalLog = console.log;
        console.log = () => {};

        try {
            await login();
        } finally {
            console.log = originalLog;
        }

        expect(mockAuthClient.device.code).toHaveBeenCalled();
        expect(mockAuthClient.device.token).toHaveBeenCalled();
        expect(mockConfig.saveToken).toHaveBeenCalledWith("mock-access-token");
        expect(mockSpawn).toHaveBeenCalled(); // openBrowser
    });

    test("logout clears token", async () => {
        const { logout } = await import("../src/commands/auth");

        const originalLog = console.log;
        console.log = () => {};

        try {
            await logout();
        } finally {
             console.log = originalLog;
        }

        expect(mockConfig.clearToken).toHaveBeenCalled();
    });
});
