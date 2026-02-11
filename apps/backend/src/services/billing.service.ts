import Stripe from "stripe";

export class BillingService {
  constructor(private env: CloudflareBindings) { }

  async createCheckoutSession(userId: string, userEmail: string, stripeCustomerId: string | null, subscription: string | null, plan: string, origin: string) {
    const stripe = new Stripe(this.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-01-27.acacia" as any,
      httpClient: Stripe.createFetchHttpClient()
    });

    const redirectBase = origin.includes("localhost") ? origin : "https://progy.dev";

    let priceId = (plan === "lifetime" ? this.env.STRIPE_PRICE_ID_LIFETIME : this.env.STRIPE_PRICE_ID_PRO) as string;
    let mode: Stripe.Checkout.SessionCreateParams.Mode = plan === "lifetime" ? "payment" : "subscription";

    const discounts = [];
    if (plan === "pro" && subscription === "lifetime") {
      discounts.push({
        coupon: "S2Q7Vcxw",
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: stripeCustomerId ? undefined : userEmail,
      customer: stripeCustomerId || undefined,
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
        userId: userId,
        planType: plan,
      },
    });

    return { url: checkoutSession.url };
  }
}
