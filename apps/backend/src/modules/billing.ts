
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { BillingService } from "../services/billing.service";
import { verifySession, type AuthVariables } from "../middlewares/auth";

const billing = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .post(
    "/checkout",
    zValidator(
      "query",
      z.object({
        plan: z.enum(["pro", "lifetime"]).default("pro")
      })
    ),
    async (c) => {
      const session = await verifySession(c);

      if (!session || !session.user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { plan } = c.req.valid("query");
      const origin = c.req.header("origin") || "https://progy.dev";

      const billingService = new BillingService(c.env);

      try {
        const result = await billingService.createCheckoutSession(
          session.user.id,
          session.user.email,
          session.user.stripeCustomerId || null,
          (session.user as any).subscription || null,
          plan,
          origin
        );
        return c.json(result);
      } catch (e: any) {
        console.error("[BILLING-ERROR]", e);
        return c.json({ error: "Failed to create checkout session" }, 500);
      }
    }
  );

export default billing;
