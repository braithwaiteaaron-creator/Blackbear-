import Stripe from "stripe";

import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function hasStripeSecretKey(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string | null {
  return env.STRIPE_WEBHOOK_SECRET ?? null;
}
