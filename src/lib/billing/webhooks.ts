import Stripe from "stripe";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { env } from "@/lib/env";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/billing/stripe";
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

function toInputJson(
  value: unknown
): Record<string, unknown> | Array<unknown> | string | number | boolean | null {
  if (value === undefined) {
    return null;
  }
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => toInputJson(entry));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, toInputJson(entry)])
  );
}

function statusFromStripe(status: string): string {
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

async function processSubscriptionEvent(event: Stripe.Event): Promise<void> {
  const object = event.data.object as Stripe.Subscription;
  const customerId =
    typeof object.customer === "string" ? object.customer : object.customer?.id ?? null;
  if (!customerId) {
    return;
  }

  const email = object.metadata?.userEmail;
  const user =
    email && email.length > 0
      ? await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        })
      : null;

  if (!user) {
    return;
  }

  const planCode = object.items.data[0]?.price?.id ?? "unknown";
  const subscription = await getStripeClient().subscriptions.retrieve(object.id);
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  await prisma.billingSubscription.upsert({
    where: {
      providerSubscriptionId: object.id,
    },
    update: {
      status: statusFromStripe(object.status) as
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired",
      planCode,
      providerCustomerId: customerId,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: object.cancel_at_period_end,
      metadata: toInputJson(object.metadata),
    },
    create: {
      userId: user.id,
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: object.id,
      status: statusFromStripe(object.status) as
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired",
      planCode,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: object.cancel_at_period_end,
      metadata: toInputJson(object.metadata),
    },
  });
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
    const toleranceValue = Number.parseInt(env.STRIPE_WEBHOOK_TOLERANCE_SECONDS ?? "300", 10);
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
      payload: toInputJson(event) as Record<string, unknown>,
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
