
import { Hono } from "hono";
import { authServer } from "../auth";
import Stripe from "stripe";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

const billing = new Hono<{ Bindings: CloudflareBindings }>();

billing.post("/checkout/standard", async (c) => {
  const auth = authServer(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover",
    httpClient: Stripe.createFetchHttpClient()
  });

  // Ensure redirect goes back to the frontend dashboard
  const origin = c.req.header("origin") || "https://progy-web.francy.workers.dev";
  const redirectBase = origin.includes("localhost") ? origin : "https://progy-web.francy.workers.dev";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: c.env.STRIPE_PRICE_ID_PRO,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${redirectBase}/dashboard`,
    cancel_url: `${redirectBase}/dashboard`,
    metadata: {
      userId: session.user.id,
      planType: "standard",
    },
  });

  return c.json({ url: checkoutSession.url });
});

billing.post("/checkout/pro", async (c) => {
  const auth = authServer(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover" as any,
    httpClient: Stripe.createFetchHttpClient()
  });

  // Ensure redirect goes back to the frontend dashboard
  const origin = c.req.header("origin") || "https://progy-web.francy.workers.dev";
  const redirectBase = origin.includes("localhost") ? origin : "https://progy-web.francy.workers.dev";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: c.env.STRIPE_PRICE_ID_PRO,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${redirectBase}/dashboard`,
    cancel_url: `${redirectBase}/dashboard`,
    metadata: {
      userId: session.user.id,
      planType: "pro",
    },
  });

  return c.json({ url: checkoutSession.url });
});

export default billing;
