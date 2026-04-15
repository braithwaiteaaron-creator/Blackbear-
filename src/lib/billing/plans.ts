import { env } from "@/lib/env";
import type { BillingInterval, BillingPlan, BillingPlanId, SubscriptionTier } from "@/lib/types";

type BillingPlanConfig = {
  id: BillingPlanId;
  name: string;
  subscriptionTier: SubscriptionTier;
  description: string;
  seatsIncluded: number | "unlimited";
  prices: Array<{
    amount: number | null;
    currency: "usd";
    interval: BillingInterval;
    display: string;
    priceIdEnvKey?: keyof typeof env;
  }>;
  billing: {
    productName: string;
    mode: "subscription" | "contact_sales";
  };
};

const BILLING_PLAN_CONFIG: BillingPlanConfig[] = [
  {
    id: "free",
    name: "Free",
    subscriptionTier: "free",
    description: "Beginner quiz and foundational library access.",
    seatsIncluded: 1,
    prices: [
      {
        amount: 0,
        currency: "usd",
        interval: "month",
        display: "$0",
      },
    ],
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
    prices: [
      {
        amount: 1900,
        currency: "usd",
        interval: "month",
        display: "$19/mo",
        priceIdEnvKey: "STRIPE_PRICE_PREMIUM_MONTHLY",
      },
      {
        amount: 14900,
        currency: "usd",
        interval: "year",
        display: "$149/yr",
        priceIdEnvKey: "STRIPE_PRICE_PREMIUM_YEARLY",
      },
    ],
    billing: {
      productName: "GitHub Mastery Premium",
      mode: "subscription",
    },
  },
  {
    id: "team",
    name: "Team",
    subscriptionTier: "team",
    description: "Premium for up to 25 members with team dashboards and reporting.",
    seatsIncluded: 25,
    prices: [
      {
        amount: 19900,
        currency: "usd",
        interval: "month",
        display: "$199/mo",
        priceIdEnvKey: "STRIPE_PRICE_TEAM_MONTHLY",
      },
      {
        amount: 179900,
        currency: "usd",
        interval: "year",
        display: "$1,799/yr",
        priceIdEnvKey: "STRIPE_PRICE_TEAM_YEARLY",
      },
    ],
    billing: {
      productName: "GitHub Mastery Team",
      mode: "subscription",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subscriptionTier: "enterprise",
    description: "Custom contract with unlimited seats and advanced controls.",
    seatsIncluded: "unlimited",
    prices: [
      {
        amount: null,
        currency: "usd",
        interval: "custom",
        display: "Custom",
      },
    ],
    billing: {
      productName: "GitHub Mastery Enterprise",
      mode: "contact_sales",
    },
  },
];

function materializePlan(config: BillingPlanConfig): BillingPlan {
  const defaultPrice = config.prices[0];
  return {
    id: config.id,
    name: config.name,
    subscriptionTier: config.subscriptionTier,
    description: config.description,
    seatsIncluded: config.seatsIncluded,
    price: {
      amount: defaultPrice.amount,
      currency: defaultPrice.currency,
      interval: defaultPrice.interval,
      display: defaultPrice.display,
    },
    billing: {
      provider: "stripe",
      productName: config.billing.productName,
      mode: config.billing.mode,
      priceId: defaultPrice.priceIdEnvKey ? env[defaultPrice.priceIdEnvKey] ?? null : null,
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

export function getPlanPrice(
  planId: BillingPlanId,
  interval: Extract<BillingInterval, "month" | "year">
): { amount: number | null; currency: "usd"; interval: BillingInterval; display: string; priceId: string | null } | null {
  const config = BILLING_PLAN_CONFIG.find((plan) => plan.id === planId);
  if (!config) {
    return null;
  }

  const matched = config.prices.find((price) => price.interval === interval);
  if (!matched) {
    return null;
  }

  return {
    amount: matched.amount,
    currency: matched.currency,
    interval: matched.interval,
    display: matched.display,
    priceId: matched.priceIdEnvKey ? env[matched.priceIdEnvKey] ?? null : null,
  };
}
