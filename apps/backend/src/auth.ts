import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "./db/schema";
import { deviceAuthorization } from "better-auth/plugins/device-authorization";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

export const authServer = (env: CloudflareBindings) => {
  const stripeClient = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover", // Fixed version type helper
  });

  return betterAuth({
    database: drizzleAdapter(drizzle(env.DB), {
      provider: "sqlite",
      schema: {
        ...schema,
        deviceCode: schema.device,
        subscription: schema.subscription,
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
    callbacks: {
      session: async ({ session, user }: any) => {
        const db = drizzle(env.DB);
        // @ts-ignore
        const activeSub = await db.select().from(schema.subscription).where(
          and(
            eq(schema.subscription.userId, user.id),
            eq(schema.subscription.status, "active"),
            eq(schema.subscription.plan, "pro")
          )
        ).get();
        if (activeSub) {
          return {
            ...session,
            user: {
              ...session.user,
              subscription: "pro"
            }
          }
        }
        return session;
      }
    },
    plugins: [
      deviceAuthorization({
        verificationUri: "/device",
      }),
      stripe({
        stripeClient,
        stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
        createCustomerOnSignUp: true,
        subscription: {
          enabled: true,
          plans: [{
            name: "pro",
            priceId: env.STRIPE_PRICE_ID_PRO,
            group: "subscription",
          }],
        },
        onEvent: async (event) => {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.metadata?.planType === "standard") {
              const userEmail = session.customer_details?.email;
              if (userEmail) {
                // Use drizzle-orm operators for update query
                // @ts-ignore - d1 types
                await drizzle(env.DB).update(schema.user)
                  .set({ subscription: 'standard' })
                  // @ts-ignore - d1 types
                  .where(schema.eq(schema.user.email, userEmail))
                  .execute();
              }
            }
          }
        },
      }),
    ],
  });
};

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [deviceAuthorizationClient()],
});