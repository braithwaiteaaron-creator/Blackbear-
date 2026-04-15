import { getServerSession } from "next-auth";
import { z } from "zod";

import { authConfig } from "@/lib/auth";
import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { env } from "@/lib/env";
import { getBillingPlan } from "@/lib/billing/plans";
import { getStripeClient, hasStripeSecretKey } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";

const checkoutRequestSchema = z.object({
  planId: z.enum(["premium", "team"]),
  interval: z.enum(["month", "year"]).default("month"),
});

type CheckoutError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

export type CheckoutResult =
  | {
      ok: true;
      data: {
        checkoutUrl: string;
        sessionId: string;
      };
    }
  | {
      ok: false;
      error: CheckoutError;
    };

function resolvePlanPriceId(params: {
  planId: "premium" | "team";
  interval: "month" | "year";
}) {
  if (params.planId === "premium") {
    return params.interval === "year"
      ? env.STRIPE_PRICE_PREMIUM_YEARLY ?? null
      : env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null;
  }

  return params.interval === "year"
    ? env.STRIPE_PRICE_TEAM_YEARLY ?? null
    : env.STRIPE_PRICE_TEAM_MONTHLY ?? null;
}

export async function createBillingCheckoutSession(request: Request): Promise<CheckoutResult> {
  const payload = checkoutRequestSchema.safeParse(await request.json());
  if (!payload.success) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Invalid checkout payload.",
        status: 400,
        details: payload.error.flatten(),
      },
    };
  }

  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.AUTH_REQUIRED,
        message: "Authentication required.",
        status: 401,
      },
    };
  }

  if (!hasStripeSecretKey()) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Billing provider is not configured.",
        status: 500,
      },
    };
  }

  const plan = getBillingPlan(payload.data.planId);
  const priceId = resolvePlanPriceId({
    planId: payload.data.planId,
    interval: payload.data.interval,
  });

  if (!plan || plan.billing.mode !== "subscription" || !priceId) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Selected plan and interval are not available for checkout.",
        status: 400,
      },
    };
  }

  const appUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "User account not found.",
        status: 404,
      },
    };
  }

  const stripe = getStripeClient();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      userEmail: user.email,
      requestedPlanId: plan.id,
      requestedInterval: payload.data.interval,
    },
  });

  if (!checkout.url) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Unable to create checkout session URL.",
        status: 500,
      },
    };
  }

  return {
    ok: true,
    data: {
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
    },
  };
}
