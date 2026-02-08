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
    basePath: "/auth",

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
        hasLifetime: {
          type: "boolean",
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ? `${env.BETTER_AUTH_URL.replace(/\/$/, "")}/auth` : "https://api.progy.dev/auth",
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://api.progy.dev",
      "https://progy.dev"
    ],
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID!,
        clientSecret: env.GITHUB_CLIENT_SECRET!,
        scope: ["user:email", "repo"],
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

        // Priority:
        // 1. If there's an active "pro" subscription in the dedicated table, they are PRO
        // 2. Otherwise trust the "subscription" field in the user table

        let effectiveSubscription = user.subscription || "free";

        // Check for active recurring subscriptions (covers Pro, Pro-Discount, etc)
        // @ts-ignore
        const activeSub = await db.select().from(schema.subscription).where(
          and(
            eq(schema.subscription.referenceId, user.id),
            eq(schema.subscription.status, "active")
          )
        ).get();

        if (activeSub) {
          if (activeSub.plan === "pro" || activeSub.plan === "pro-discount" || activeSub.plan === "standard") {
            effectiveSubscription = "pro";
          } else if (activeSub.plan === "lifetime") {
            effectiveSubscription = "lifetime";
          }
        }

        return {
          ...session,
          user: {
            ...session.user,
            subscription: effectiveSubscription,
            hasLifetime: user.hasLifetime
          }
        };
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
            name: "pro-discount",
            priceId: "price_1SyFpZGdycZGJETWwc9zs2uV",
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
            // Map pro-discount to pro
            const status = (plan.name === "standard" || plan.name === "pro-discount") ? "pro" : plan.name;
            await db.update(schema.user)
              .set({ subscription: status })
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
        onEvent: async (event) => {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const planType = session.metadata?.planType;

            // FIX: Cancel existing descriptions if buying Lifetime to prevent double billing
            if (planType === "lifetime" && session.customer) {
              try {
                const customerId = session.customer as string;
                // List all active subscriptions for this customer
                const subs = await stripeClient.subscriptions.list({ customer: customerId, status: 'active' });
                for (const sub of subs.data) {
                  // Cancel them efficiently
                  await stripeClient.subscriptions.cancel(sub.id);
                  console.log(`[UPGRADE-FIX] Cancelled old subscription ${sub.id} because user bought Lifetime.`);
                }
              } catch (err) {
                console.error("[UPGRADE-FIX-ERROR] Failed to cancel old subscriptions:", err);
              }
            }

            if (planType === "lifetime" || planType === "pro" || planType === "standard" || planType === "pro-discount") {
              const userEmail = session.customer_details?.email;
              if (userEmail) {
                console.log(`[STRIPE-WEBHOOK-SYNC] Syncing ${planType} to user ${userEmail}`);
                const updateData: any = {
                  subscription: (planType === "standard" || planType === "pro-discount") ? "pro" : planType
                };
                if (planType === "lifetime") {
                  updateData.hasLifetime = true;
                }

                await drizzle(env.DB).update(schema.user)
                  .set(updateData)
                  .where(eq(schema.user.email, userEmail))
                  .execute();
              }
            }
          }
        },
      }),
    ],
  });
};

export type AuthServer = ReturnType<typeof authServer>;

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [deviceAuthorizationClient()],
});