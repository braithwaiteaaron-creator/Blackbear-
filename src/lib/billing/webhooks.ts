import Stripe from "stripe";
import type { BillingSubscriptionStatus, Prisma, SubscriptionTier } from "@prisma/client";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { markCertificationPurchaseCompletedFromCheckoutSession } from "@/lib/certification-purchase";
import { env } from "@/lib/env";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/billing/stripe";
import { enqueueJob } from "@/lib/job-queue";
import { prisma } from "@/lib/prisma";

type WebhookError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

type WebhookResult =
  | {
      ok: true;
      data: {
        eventId: string;
        processed: boolean;
        duplicate: boolean;
      };
    }
  | {
      ok: false;
      error: WebhookError;
    };

function toInputJson(value: unknown): Prisma.InputJsonValue {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => toInputJson(entry)) as Prisma.InputJsonValue;
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, toInputJson(entry)])
  ) as Prisma.InputJsonValue;
}

function toSubscriptionTier(
  tier: SubscriptionTier
): "free" | "premium" | "team" | "enterprise" {
  return tier;
}

function statusFromStripe(status: string): BillingSubscriptionStatus {
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return status;
    default:
      return "incomplete";
  }
}

const ACTIVE_SUBSCRIPTION_STATUSES: BillingSubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
];

const SUBSCRIPTION_TIER_PRIORITY: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  team: 2,
  enterprise: 3,
};

function inferTierFromPlanCode(planCode: string): SubscriptionTier {
  const normalized = planCode.toLowerCase();
  const premiumPriceIds = [env.STRIPE_PRICE_PREMIUM_MONTHLY, env.STRIPE_PRICE_PREMIUM_YEARLY].filter(
    (value): value is string => Boolean(value)
  );
  const teamPriceIds = [env.STRIPE_PRICE_TEAM_MONTHLY, env.STRIPE_PRICE_TEAM_YEARLY].filter(
    (value): value is string => Boolean(value)
  );
  const enterprisePriceIds = [env.STRIPE_PRICE_ENTERPRISE_MONTHLY].filter(
    (value): value is string => Boolean(value)
  );

  if (teamPriceIds.includes(planCode) || normalized.includes("team")) {
    return "team";
  }
  if (enterprisePriceIds.includes(planCode) || normalized.includes("enterprise")) {
    return "enterprise";
  }
  if (premiumPriceIds.includes(planCode) || normalized.includes("premium")) {
    return "premium";
  }
  return "free";
}

async function syncUserSubscriptionTier(userId: string): Promise<void> {
  const activeSubscriptions = await prisma.billingSubscription.findMany({
    where: {
      userId,
      status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
    },
    select: {
      planCode: true,
    },
  });

  const nextTier = activeSubscriptions.reduce<SubscriptionTier>((currentTier, subscription) => {
    const candidateTier = inferTierFromPlanCode(subscription.planCode);
    return SUBSCRIPTION_TIER_PRIORITY[candidateTier] > SUBSCRIPTION_TIER_PRIORITY[currentTier]
      ? candidateTier
      : currentTier;
  }, "free");

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: toSubscriptionTier(nextTier),
    },
  });
}

async function resolveUserForSubscription(params: {
  subscription: Stripe.Subscription;
  customerId: string;
}) {
  const metadataUserId = params.subscription.metadata?.userId;
  if (metadataUserId) {
    const userById = await prisma.user.findUnique({
      where: { id: metadataUserId },
      select: { id: true },
    });
    if (userById) {
      return userById;
    }
  }

  const metadataEmail = params.subscription.metadata?.userEmail;
  if (metadataEmail) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: metadataEmail },
      select: { id: true },
    });
    if (userByEmail) {
      return userByEmail;
    }
  }

  const existingBySubscription = await prisma.billingSubscription.findUnique({
    where: { providerSubscriptionId: params.subscription.id },
    select: { userId: true },
  });
  if (existingBySubscription) {
    return { id: existingBySubscription.userId };
  }

  const existingByCustomer = await prisma.billingSubscription.findFirst({
    where: {
      provider: "stripe",
      providerCustomerId: params.customerId,
    },
    orderBy: { updatedAt: "desc" },
    select: { userId: true },
  });
  if (existingByCustomer) {
    return { id: existingByCustomer.userId };
  }

  const customerObject = params.subscription.customer;
  const embeddedEmail =
    typeof customerObject === "object" && customerObject && "email" in customerObject
      ? customerObject.email
      : null;
  if (embeddedEmail) {
    const userByEmbeddedEmail = await prisma.user.findUnique({
      where: { email: embeddedEmail },
      select: { id: true },
    });
    if (userByEmbeddedEmail) {
      return userByEmbeddedEmail;
    }
  }

  const stripe = getStripeClient();
  const stripeCustomer = await stripe.customers.retrieve(params.customerId);
  const customerEmail =
    typeof stripeCustomer === "object" && !("deleted" in stripeCustomer)
      ? stripeCustomer.email
      : null;
  if (!customerEmail) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: customerEmail },
    select: { id: true },
  });
}

function getSubscriptionPeriods(subscription: Stripe.Subscription) {
  const withPeriods = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const fallbackUnixSeconds = subscription.created ?? Math.floor(Date.now() / 1000);

  return {
    currentPeriodStart: new Date((withPeriods.current_period_start ?? fallbackUnixSeconds) * 1000),
    currentPeriodEnd: new Date((withPeriods.current_period_end ?? fallbackUnixSeconds) * 1000),
  };
}

async function processSubscriptionObject(subscription: Stripe.Subscription): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;
  if (!customerId) {
    return;
  }

  const user = await resolveUserForSubscription({
    subscription,
    customerId,
  });
  if (!user) {
    return;
  }

  const planCode = subscription.items.data[0]?.price?.id ?? "unknown";
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriods(subscription);
  const normalizedStatus = statusFromStripe(subscription.status);

  await prisma.billingSubscription.upsert({
    where: {
      providerSubscriptionId: subscription.id,
    },
    update: {
      status: normalizedStatus,
      planCode,
      providerCustomerId: customerId,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: toInputJson(subscription.metadata ?? {}),
    },
    create: {
      userId: user.id,
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: subscription.id,
      status: normalizedStatus,
      planCode,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: toInputJson(subscription.metadata ?? {}),
    },
  });

  await syncUserSubscriptionTier(user.id);
}

async function processSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  await processSubscriptionObject(subscription);
}

async function processInvoiceEvent(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
  };
  const subscriptionId =
    typeof invoiceWithSubscription.subscription === "string"
      ? invoiceWithSubscription.subscription
      : invoiceWithSubscription.subscription?.id ?? null;
  if (!subscriptionId) {
    return;
  }

  const existingSubscription = await prisma.billingSubscription.findUnique({
    where: { providerSubscriptionId: subscriptionId },
    select: { userId: true, planCode: true },
  });
  if (!existingSubscription) {
    return;
  }

  if (event.type === "invoice.payment_failed") {
    await enqueueJob({
      jobType: "billing_dunning_notice",
      idempotencyKey: `billing-dunning:${invoice.id}`,
      payload: {
        userId: existingSubscription.userId,
        subscriptionId,
        invoiceId: invoice.id,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        attemptCount: invoice.attempt_count,
        nextPaymentAttempt: invoice.next_payment_attempt,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        customerEmail: invoice.customer_email,
      },
    });
  }
}

export async function verifyAndHandleStripeWebhook(request: Request): Promise<WebhookResult> {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Stripe webhook secret is not configured.",
        status: 500,
      },
    };
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Missing Stripe webhook signature.",
        status: 400,
      },
    };
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    const toleranceValue = env.STRIPE_WEBHOOK_TOLERANCE_SECONDS ?? 300;
    const tolerance = Number.isFinite(toleranceValue) && toleranceValue > 0 ? toleranceValue : 300;
    event = getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret, tolerance);
  } catch (error) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Invalid Stripe webhook signature.",
        status: 400,
        details: error instanceof Error ? error.message : "Unknown signature verification error",
      },
    };
  }

  const existing = await prisma.billingWebhookEvent.findUnique({
    where: { providerEventId: event.id },
    select: { id: true, processedAt: true },
  });
  if (existing) {
    return {
      ok: true,
      data: {
        eventId: event.id,
        processed: Boolean(existing.processedAt),
        duplicate: true,
      },
    };
  }

  await prisma.billingWebhookEvent.create({
    data: {
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      payload: toInputJson(event),
    },
  });

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await processSubscriptionEvent(event);
    }
    if (event.type === "invoice.payment_failed" || event.type === "invoice.payment_succeeded") {
      await processInvoiceEvent(event);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription") {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        if (subscriptionId) {
          const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
          await processSubscriptionObject(subscription);
        }
      }
      if (session.mode === "payment") {
        await markCertificationPurchaseCompletedFromCheckoutSession(session);
      }
    }

    await prisma.billingWebhookEvent.update({
      where: { providerEventId: event.id },
      data: {
        processedAt: new Date(),
        status: "processed",
        errorMessage: null,
        processingAttempts: { increment: 1 },
      },
    });

    return {
      ok: true,
      data: {
        eventId: event.id,
        processed: true,
        duplicate: false,
      },
    };
  } catch (error) {
    await prisma.billingWebhookEvent.update({
      where: { providerEventId: event.id },
      data: {
        status: "failed",
        processingAttempts: { increment: 1 },
        errorMessage:
          error instanceof Error ? error.message : "Unknown billing webhook processing error",
      },
    });

    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Webhook processing failed.",
        status: 500,
      },
    };
  }
}
