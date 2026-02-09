import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createMutatorStore } from './query-client';


interface CheckoutParams {
  plan: 'lifetime' | 'pro';
  token: string;
}

interface CheckoutResponse {
  url: string;
}

export const $checkoutMutation = createMutatorStore<CheckoutParams, CheckoutResponse>(
  async ({ data }) => {
    const { plan, token } = data;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.progy.dev"}/billing/checkout?plan=${plan}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) {
      throw new Error('Failed to start checkout');
    }

    return res.json();
  }
);
