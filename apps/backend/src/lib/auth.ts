import { betterAuth } from "better-auth";
import { logger } from "./logger";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, or } from "drizzle-orm";
import * as schema from "../db/schema";
import { deviceAuthorization } from "better-auth/plugins/device-authorization";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

export const authServer = (env: CloudflareBindings) => {
  const stripeClient = new Stripe(env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover",
    httpClient: Stripe.createFetchHttpClient()
  });

  if (!env.BETTER_AUTH_SECRET) {
    logger.error("AUTH-SECRET-MISSING", "BETTER_AUTH_SECRET is not defined in environment variables!");
  }

  return betterAuth({
    basePath: "/auth",

    database: drizzleAdapter(drizzle(env.DB), {
      provider: "sqlite",
      usePlural: true,
      schema: {
        users: schema.users,
        sessions: schema.sessions,
        accounts: schema.accounts,
        verifications: schema.verifications,
        subscriptions: schema.subscription,
        deviceCodes: schema.devices,
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
        username: {
          type: "string",
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL || "https://api.progy.dev",
    trustedOrigins: [
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
    trustHost: true,
    callbacks: {
      session: async ({ session, user }: any) => {
        const db = drizzle(env.DB);

        // 1. Check for any active "pro" or "pro-discount" subscription in the subscription table
        // We query the DB specifically for active records to ensure the session is always accurate
        // @ts-ignore
        const activeSub = await db.select().from(schema.subscription).where(
          and(
            eq(schema.subscription.referenceId, user.id),
            or(
              eq(schema.subscription.plan, "pro"),
              eq(schema.subscription.plan, "pro-discount")
            )
          )
        ).get();

        const isActuallyPro = activeSub && (activeSub.status === "active" || activeSub.status === "trialing");
        const currentSubscription = isActuallyPro ? "pro" : (user.subscription || "free");
        const hasLifetime = !!user.hasLifetime || user.subscription === "lifetime";

        logger.info("SESSION-SYNC", "User session sync", {
          email: user.email,
          subscription: currentSubscription,
          hasLifetime,
          hasStripeCustomer: !!user.stripeCustomerId
        });

        return {
          ...session,
          user: {
            ...user, // Preserve all database fields (id, email, stripeCustomerId, etc.)
            ...session.user, // Keep session-specific stuff
            subscription: currentSubscription,
            hasLifetime: hasLifetime
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
            logger.info("STRIPE-HOOK", "Subscription complete", {
              referenceId: subscription.referenceId,
              plan: plan.name
            });
            const db = drizzle(env.DB);
            // Map pro-discount to pro
            const status = (plan.name === "standard" || plan.name === "pro-discount" || plan.name === "pro") ? "pro" : plan.name;
            await db.update(schema.users)
              .set({ subscription: status })
              .where(eq(schema.users.id, subscription.referenceId))
              .execute();
          },
          onSubscriptionDeleted: async ({ subscription }) => {
            logger.info("STRIPE-HOOK", "Subscription deleted", {
              referenceId: subscription.referenceId
            });
            const db = drizzle(env.DB);
            await db.update(schema.users)
              .set({ subscription: "free" })
              .where(eq(schema.users.id, subscription.referenceId))
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
                await Promise.all(subs.data.map(async (sub) => {
                  // Cancel them efficiently
                  await stripeClient.subscriptions.cancel(sub.id);
                  console.log(`[UPGRADE-FIX] Cancelled old subscription ${sub.id} because user bought Lifetime.`);
                  logger.info("UPGRADE-FIX", "Cancelled old subscription", {
                    subscriptionId: sub.id,
                    reason: "User bought Lifetime"
                  });
                }));
              } catch (err) {
                logger.error("UPGRADE-FIX-ERROR", "Failed to cancel old subscriptions", err);
              }
            }

            if (planType === "lifetime" || planType === "pro" || planType === "standard") {
              const userEmail = session.customer_details?.email;
              const userId = session.metadata?.userId;
              const customerId = session.customer as string;

              if (userId || userEmail) {
                logger.info("STRIPE-WEBHOOK-SYNC", "Syncing plan to user", {
                  planType,
                  userId,
                  userEmail
                });
                const updateData: any = {
                  subscription: planType === "standard" ? "pro" : planType,
                  stripeCustomerId: customerId
                };
                if (planType === "lifetime") {
                  updateData.hasLifetime = true;
                }

                const db = drizzle(env.DB);
                if (userId) {
                  await db.update(schema.users)
                    .set(updateData)
                    .where(eq(schema.users.id, userId))
                    .execute();
                } else if (userEmail) {
                  await db.update(schema.users)
                    .set(updateData)
                    .where(eq(schema.users.email, userEmail))
                    .execute();
                }
              }
            }
          }
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const emailPrefix = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');
            const randomDigits = Math.floor(10000 + Math.random() * 90000);
            const username = `${emailPrefix}${randomDigits}`;

            logger.info("AUTH-HOOK", "Generating username for user", {
              email: user.email,
              username
            });

            return {
              data: {
                ...user,
                username,
              },
            };
          },
        },
      },
    },
  });
};

export type AuthServer = ReturnType<typeof authServer>;

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [deviceAuthorizationClient()],
});