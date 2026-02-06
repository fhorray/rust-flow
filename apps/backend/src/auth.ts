import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { deviceAuthorization } from "better-auth/plugins";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

export const authServer = (env: CloudflareBindings) =>
  betterAuth({
    database: drizzleAdapter(drizzle(env.DB), {
      provider: "sqlite",
      schema: {
        ...schema,
        deviceCode: schema.device,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ? `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/api/auth` : "https://progy.francy.workers.dev/api/auth",
    trustedOrigins: [
      "http://localhost:3001",
      "https://progy.francy.workers.dev"
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
    },
    plugins: [
      deviceAuthorization({
        verificationUri: "/device",
      }),
    ],
  });

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [deviceAuthorizationClient()],
});