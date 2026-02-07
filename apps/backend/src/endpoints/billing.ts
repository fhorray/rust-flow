
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

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover" as any, // Cast to any to avoid TS mismatch if the types are slightly off, but the error suggested this string.
  });

  const origin = c.req.header("origin") || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: c.env.STRIPE_PRICE_ID_STANDARD,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing/cancel`,
    metadata: {
      userId: session.user.id,
      planType: "standard",
    },
  });

  return c.json({ url: checkoutSession.url });
});

export default billing;
