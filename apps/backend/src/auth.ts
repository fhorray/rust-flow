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
    httpClient: Stripe.createFetchHttpClient()
  });

  if (!env.BETTER_AUTH_SECRET) {
    console.error("[AUTH-SECRET-MISSING] BETTER_AUTH_SECRET is not defined in environment variables!");
  }

  return betterAuth({
    database: drizzleAdapter(drizzle(env.DB), {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        subscription: schema.subscription,
        deviceCode: schema.device,
      },
    }),
    user: {
      additionalFields: {
        subscription: {
          type: "string",
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ? `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/api/auth` : "https://progy.francy.workers.dev/api/auth",
    trustedOrigins: [
      "http://localhost:3001",
      "https://progy.francy.workers.dev",
      "https://progy-web.francy.workers.dev"
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID!,
        clientSecret: env.GITHUB_CLIENT_SECRET!,
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
      cookieDomain: ".francy.workers.dev",
    },
    trustHost: true,
    callbacks: {
      session: async ({ session, user }: any) => {
        const db = drizzle(env.DB);

        // 1. If user table already has premium status, trust it
        if (user.subscription && user.subscription !== "free") {
          return {
            ...session,
            user: {
              ...session.user,
              subscription: user.subscription
            }
          };
        }

        // 2. Otherwise check the subscription table (e.g. for recently completed ones)
        // @ts-ignore
        const activeSub = await db.select().from(schema.subscription).where(
          and(
            eq(schema.subscription.referenceId, user.id),
            eq(schema.subscription.plan, "pro")
          )
        ).get();

        if (activeSub && (activeSub.status === "active" || activeSub.status === "trialing")) {
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
          },
          {
            name: "lifetime",
            priceId: env.STRIPE_PRICE_ID_LIFETIME,
            group: "subscription",
          }
          ],
          onSubscriptionComplete: async ({ subscription, plan }) => {
            console.log(`[STRIPE-HOOK] Subscription complete for ${subscription.referenceId}: ${plan.name}`);
            const db = drizzle(env.DB);
            await db.update(schema.user)
              .set({ subscription: plan.name === "standard" ? "pro" : plan.name })
              .where(eq(schema.user.id, subscription.referenceId))
              .execute();
          },
          onSubscriptionDeleted: async ({ subscription }) => {
            console.log(`[STRIPE-HOOK] Subscription deleted for ${subscription.referenceId}`);
            const db = drizzle(env.DB);
            await db.update(schema.user)
              .set({ subscription: "free" })
              .where(eq(schema.user.id, subscription.referenceId))
              .execute();
          }
        },
        // onEvent: async (event) => {
        //   if (event.type === "checkout.session.completed") {
        //     const session = event.data.object as Stripe.Checkout.Session;
        //     const planType = session.metadata?.planType;
        //     if (planType === "lifetime" || planType === "pro" || planType === "standard") {
        //       const userEmail = session.customer_details?.email;
        //       if (userEmail) {
        //         console.log(`[STRIPE-WEBHOOK-SYNC] Syncing ${planType} to user ${userEmail}`);
        //         await drizzle(env.DB).update(schema.user)
        //           .set({ subscription: planType === "standard" ? "pro" : planType })
        //           .where(eq(schema.user.email, userEmail))
        //           .execute();
        //       }
        //     }
        //   }
        // },
      }),
    ],
  });
};

export type AuthServer = ReturnType<typeof authServer>;

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [deviceAuthorizationClient()],
});