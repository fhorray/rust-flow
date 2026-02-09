
import { Hono } from "hono";
import { authServer } from "../auth";
import Stripe from "stripe";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { verifySession } from "../auth-utils";

const billing = new Hono<{
  Bindings: CloudflareBindings;
}>();

billing.post("/checkout", async (c) => {
  const session = await verifySession(c);

  if (!session || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const plan = c.req.query("plan") || "pro";

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover" as any,
    httpClient: Stripe.createFetchHttpClient()
  });

  // Ensure redirect goes back to the frontend dashboard
  const origin = c.req.header("origin") || "https://progy.dev";
  const redirectBase = origin.includes("localhost") ? origin : "https://progy.dev";

  let priceId = c.env.STRIPE_PRICE_ID_PRO;
  let mode: Stripe.Checkout.SessionCreateParams.Mode = "subscription";

  // DISCOUNT LOGIC: If buying Pro but already Lifetime, use Coupon
  // Ideally, this coupon makes the price $8/mo instead of $20/mo (if Pro is $20)
  const discounts = [];
  if (plan === "pro" && session.user.subscription === "lifetime") {
    // priceId remains standard Pro price
    discounts.push({
      coupon: "S2Q7Vcxw",
    });
  }

  if (plan === "lifetime") {
    priceId = c.env.STRIPE_PRICE_ID_LIFETIME;
    mode = "payment";
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.stripeCustomerId ? undefined : session.user.email,
    customer: session.user.stripeCustomerId || undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: mode,
    discounts: discounts.length > 0 ? discounts : undefined,
    success_url: `${redirectBase}/dashboard?payment_success=true`,
    cancel_url: `${redirectBase}/dashboard`,
    metadata: {
      userId: session.user.id,
      planType: plan,
    },
  });

  return c.json({ url: checkoutSession.url });
});

export default billing;
