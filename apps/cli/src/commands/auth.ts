import { BACKEND_URL, FRONTEND_URL, saveToken, clearToken, logger, loadToken } from "@progy/core";
import { spawn } from "node:child_process";

function openBrowser(url: string) {
  const start = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(start, [url], { shell: true }).unref();
}

export async function login() {
  const { createAuthClient } = await import("better-auth/client");
  const { deviceAuthorizationClient } = await import("better-auth/client/plugins");

  const authClient = createAuthClient({
    baseURL: BACKEND_URL,
    basePath: "/auth",
    plugins: [deviceAuthorizationClient()],
  });

  try {
    logger.info("Requesting login session...", "AUTH");

    const { data, error } = await authClient.device.code({
      client_id: "progy-cli",
    });

    if (error) {
      throw new Error(error.error_description || "Failed to initiate device authorization");
    }

    const { device_code, user_code, verification_uri, interval } = data;
    const verificationUrl = verification_uri.startsWith("http")
      ? verification_uri
      : `${FRONTEND_URL}${verification_uri}`;

    console.log(`\n  ${"\x1b[1m"}Please authenticate in your browser:${"\x1b[0m"}`);
    console.log(`  URL:  \x1b[36m\x1b[4m${verificationUrl}\x1b[0m`);
    console.log(`  Code: \x1b[38;5;208m\x1b[1m${user_code}\x1b[0m\n`);

    openBrowser(verificationUrl);

    logger.info("Waiting for authorization (polling)...", "WAIT");

    const poll = async (): Promise<string | null> => {
      while (true) {
        const { data: tokenData, error: tokenError } = await authClient.device.token({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code,
          client_id: 'progy-cli'
        });

        if (tokenData?.access_token) {
          return tokenData.access_token;
        }

        if (tokenError) {
          const code = tokenError.error;
          if (code === 'access_denied' || code === 'expired_token') {
            throw new Error(tokenError.error_description || code);
          }
        }

        await new Promise((resolve) => setTimeout(resolve, (interval || 5) * 1000));
      }
    };

    const token = await poll();
    if (token) {
      await saveToken(token);
      logger.success("Authentication successful! Welcome back.");
    }
  } catch (e: any) {
    logger.error(`Login failed`, e.message || String(e));
    process.exit(1);
  }
}

export async function logout() {
  await clearToken();
  logger.success("Logged out successfully. Your session has been ended.");
}

export async function whoami() {
  const token = await loadToken();
  if (!token) {
    logger.error("Not logged in.", "Run 'progy login' first.");
    process.exit(1);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch session: ${res.statusText}`);
    }

    const session = await res.json();
    if (!session || !session.user) {
      logger.error("Invalid session.", "Run 'progy login' again.");
      process.exit(1);
    }

    const user = session.user;
    logger.info("Current user session:", "WHOAMI");
    console.log(`  Name:     ${user.name}`);
    console.log(`  Handle:   \x1b[36m@${user.username || 'no-username'}\x1b[0m`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Plan:     ${user.subscription.toUpperCase()}${user.hasLifetime ? ' (LIFETIME)' : ''}`);
  } catch (e: any) {
    logger.error("Failed to retrieve user information", e.message);
    process.exit(1);
  }
}
