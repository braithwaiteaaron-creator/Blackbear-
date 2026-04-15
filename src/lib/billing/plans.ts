import { env } from "@/lib/env";
import type { BillingInterval, BillingPlan, BillingPlanId, SubscriptionTier } from "@/lib/types";

type BillingPlanConfig = {
  id: BillingPlanId;
  name: string;
  subscriptionTier: SubscriptionTier;
  description: string;
  seatsIncluded: number | "unlimited";
  price: {
    amount: number | null;
    currency: "usd";
    interval: BillingInterval;
    display: string;
  };
  billing: {
    productName: string;
    mode: "subscription" | "contact_sales";
    priceIdEnvKey?: keyof typeof env;
  };
};

const BILLING_PLAN_CONFIG: BillingPlanConfig[] = [
  {
    id: "free",
    name: "Free",
    subscriptionTier: "free",
    description: "Beginner quiz and foundational library access.",
    seatsIncluded: 1,
    price: {
      amount: 0,
      currency: "usd",
      interval: "month",
      display: "$0",
    },
    billing: {
      productName: "GitHub Mastery Free",
      mode: "subscription",
    },
  },
  {
    id: "premium",
    name: "Premium",
    subscriptionTier: "premium",
    description: "Full assessment, analytics, badges, and complete library.",
    seatsIncluded: 1,
    price: {
      amount: 1900,
      currency: "usd",
      interval: "month",
      display: "$19/mo",
    },
    billing: {
      productName: "GitHub Mastery Premium",
      mode: "subscription",
      priceIdEnvKey: "STRIPE_PRICE_PREMIUM_MONTHLY",
    },
  },
  {
    id: "team",
    name: "Team",
    subscriptionTier: "team",
    description: "Premium for up to 25 members with team dashboards and reporting.",
    seatsIncluded: 25,
    price: {
      amount: 19900,
      currency: "usd",
      interval: "month",
      display: "$199/mo",
    },
    billing: {
      productName: "GitHub Mastery Team",
      mode: "subscription",
      priceIdEnvKey: "STRIPE_PRICE_TEAM_MONTHLY",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subscriptionTier: "enterprise",
    description: "Custom contract with unlimited seats and advanced controls.",
    seatsIncluded: "unlimited",
    price: {
      amount: null,
      currency: "usd",
      interval: "custom",
      display: "Custom",
    },
    billing: {
      productName: "GitHub Mastery Enterprise",
      mode: "contact_sales",
    },
  },
];

function materializePlan(config: BillingPlanConfig): BillingPlan {
  return {
    id: config.id,
    name: config.name,
    subscriptionTier: config.subscriptionTier,
    description: config.description,
    seatsIncluded: config.seatsIncluded,
    price: config.price,
    billing: {
      provider: "stripe",
      productName: config.billing.productName,
      mode: config.billing.mode,
      priceId: config.billing.priceIdEnvKey ? env[config.billing.priceIdEnvKey] ?? null : null,
    },
  };
}

export function getBillingPlans(): BillingPlan[] {
  return BILLING_PLAN_CONFIG.map(materializePlan);
}

export function getBillingPlan(planId: BillingPlanId): BillingPlan | undefined {
  return getBillingPlans().find((plan) => plan.id === planId);
}

export function getPublicBillingPlans(): BillingPlan[] {
  return getBillingPlans().map((plan) => ({
    ...plan,
    billing: {
      ...plan.billing,
      // Public APIs should never disclose internal provider identifiers.
      priceId: null,
    },
  }));
}
