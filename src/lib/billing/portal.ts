import { getServerSession } from "next-auth";

import { authConfig } from "@/lib/auth";
import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { env } from "@/lib/env";
import { getStripeClient, hasStripeSecretKey } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";

type BillingPortalError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

export type BillingPortalResult =
  | {
      ok: true;
      data: {
        portalUrl: string;
      };
    }
  | {
      ok: false;
      error: BillingPortalError;
    };

export async function createBillingPortalSession(): Promise<BillingPortalResult> {
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

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
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

  const latestSubscription = await prisma.billingSubscription.findFirst({
    where: {
      userId: user.id,
      provider: "stripe",
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      providerCustomerId: true,
    },
  });

  if (!latestSubscription?.providerCustomerId) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "No Stripe customer found for this account.",
        status: 404,
      },
    };
  }

  const appBaseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
  const returnUrl = env.STRIPE_BILLING_PORTAL_RETURN_URL ?? `${appBaseUrl}/dashboard`;

  const stripe = getStripeClient();
  const portal = await stripe.billingPortal.sessions.create({
    customer: latestSubscription.providerCustomerId,
    return_url: returnUrl,
  });

  return {
    ok: true,
    data: {
      portalUrl: portal.url,
    },
  };
}
