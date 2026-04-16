import { getServerSession } from "next-auth";
import type { CertificationTier, Prisma } from "@prisma/client";
import Stripe from "stripe";
import { z } from "zod";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { getStripeClient, hasStripeSecretKey } from "@/lib/billing/stripe";
import { issueCertificationFromTier } from "@/lib/certification-issuance";
import {
  CERTIFICATION_TERMS_PATH,
  CERTIFICATION_TERMS_VERSION,
} from "@/lib/certification-terms";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  enforceCertificationCheckoutAbuseRules,
  enforceCertificationIssuanceAbuseRules,
} from "@/lib/certification-risk";
import type { UserCertification } from "@/lib/types";

const purchaseCheckoutSchema = z.object({
  certificationTier: z.enum(["foundation", "developing", "advanced", "expert"]).optional(),
  acceptCertificationTerms: z.literal(true),
  certificationTermsVersion: z.string().min(1),
});

const CERTIFICATION_PRICE_CENTS: Record<CertificationTier, number> = {
  foundation: 2900,
  developing: 7900,
  advanced: 7900,
  expert: 14900,
};

export const CERTIFICATION_PURCHASE_DEFAULT_TIER: CertificationTier = "advanced";

export function resolveCertificationTierForPurchaseFlow(
  value: string | null | undefined
): CertificationTier {
  return value === "foundation" ||
    value === "developing" ||
    value === "advanced" ||
    value === "expert"
    ? value
    : CERTIFICATION_PURCHASE_DEFAULT_TIER;
}

export function getPriceForCertificationTier(
  tier: CertificationTier
): number | null {
  if (tier === "foundation") {
    return CERTIFICATION_PRICE_CENTS.foundation;
  }
  if (tier === "developing") {
    return CERTIFICATION_PRICE_CENTS.developing;
  }
  if (tier === "advanced") {
    return CERTIFICATION_PRICE_CENTS.advanced;
  }
  return CERTIFICATION_PRICE_CENTS.expert;
}

function toUserCertification(input: {
  id: string;
  certificationTier: CertificationTier;
  badgeUrl: string;
  credlyBadgeId: string;
  issuedAt: Date;
  expiresAt: Date | null;
}): UserCertification {
  const now = Date.now();
  const expiresAtIso = input.expiresAt ? input.expiresAt.toISOString() : null;
  const isActive = input.expiresAt ? input.expiresAt.getTime() > now : true;
  return {
    id: input.id,
    tier: input.certificationTier,
    issuedAt: input.issuedAt.toISOString(),
    expiresAt: expiresAtIso,
    certificateUrl: input.badgeUrl,
    verificationCode: input.credlyBadgeId,
    isActive,
  };
}

type PurchaseError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

type PurchaseResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: PurchaseError;
    };

export type CertificationPurchaseCheckoutResult = PurchaseResult<{
  checkoutUrl: string;
  sessionId: string;
}>;

export type CertificationPurchaseSnapshot = {
  id: string;
  certificationTier: CertificationTier;
  status: "pending" | "completed" | "failed" | "canceled";
  amountCents: number;
  currency: string;
  completedAt: string | null;
};

export type PurchaseProviderSync = {
  provider: "mock" | "credly" | "badgr";
  status: "synced" | "skipped" | "failed";
  syncedAt: string;
  externalCredentialId: string | null;
  externalUrl: string | null;
  message: string;
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

function isCertificationTier(value: string): value is CertificationTier {
  return (
    value === "foundation" ||
    value === "developing" ||
    value === "advanced" ||
    value === "expert"
  );
}

function toStripeTierLabel(tier: CertificationTier): string {
  if (tier === "foundation") {
    return "Foundation";
  }
  if (tier === "developing") {
    return "Professional";
  }
  if (tier === "advanced") {
    return "Professional";
  }
  return "Expert";
}

export async function createCertificationCheckoutSession(
  request: Request
): Promise<CertificationPurchaseCheckoutResult> {
  const payload = purchaseCheckoutSchema.safeParse(await request.json());
  if (!payload.success) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Invalid certification checkout payload.",
        status: 400,
        details: payload.error.flatten(),
      },
    };
  }
  if (payload.data.certificationTermsVersion !== CERTIFICATION_TERMS_VERSION) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Certification terms must be accepted using the current terms version.",
        status: 400,
        details: {
          expectedVersion: CERTIFICATION_TERMS_VERSION,
          acceptedVersion: payload.data.certificationTermsVersion,
          termsPath: CERTIFICATION_TERMS_PATH,
        },
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

  const certificationTier = payload.data.certificationTier ?? CERTIFICATION_PURCHASE_DEFAULT_TIER;
  const amountCents = getPriceForCertificationTier(certificationTier);
  if (amountCents === null) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Selected certification tier is not configured for checkout.",
        status: 400,
      },
    };
  }
  const appUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
  const latestSession = await prisma.quizSession.findFirst({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    select: { totalScore: true },
  });
  const abuseCheck = await enforceCertificationCheckoutAbuseRules({
    userId: user.id,
    requestedTier: certificationTier,
    latestScore: latestSession?.totalScore ?? null,
    context: {
      source: "checkout",
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    },
  });
  if (!abuseCheck.ok) {
    return {
      ok: false,
      error: abuseCheck.error,
    };
  }
  const stripe = getStripeClient();
  const certificationTermsAcceptedAt = new Date().toISOString();

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/dashboard/certifications?checkout=success`,
    cancel_url: `${appUrl}/certifications?checkout=cancelled`,
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `GitHub Mastery ${toStripeTierLabel(certificationTier)} Certification`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      purchaseType: "certification",
      userId: user.id,
      userEmail: user.email,
      certificationTier,
      amountCents: String(amountCents),
      certificationTermsVersion: CERTIFICATION_TERMS_VERSION,
      certificationTermsAcceptedAt,
    },
  });

  if (!checkout.url) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: "Unable to create certification checkout URL.",
        status: 500,
      },
    };
  }

  await prisma.certificationPurchase.upsert({
    where: { providerCheckoutId: checkout.id },
    update: {
      metadata: toInputJson(checkout.metadata),
    },
    create: {
      userId: user.id,
      certificationTier,
      provider: "stripe",
      providerCheckoutId: checkout.id,
      providerPaymentIntent:
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      providerCustomerId:
        typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id ?? null,
      amountCents,
      currency: "usd",
      status: "pending",
      metadata: toInputJson(checkout.metadata),
    },
  });

  return {
    ok: true,
    data: {
      checkoutUrl: checkout.url,
      sessionId: checkout.id,
    },
  };
}

export async function markCertificationPurchaseCompletedFromCheckoutSession(
  checkoutSession: Stripe.Checkout.Session
): Promise<void> {
  const metadata = checkoutSession.metadata ?? {};
  if (metadata.purchaseType !== "certification") {
    return;
  }

  const userId = metadata.userId ?? null;
  const certificationTierRaw =
    typeof metadata.certificationTier === "string" ? metadata.certificationTier : null;
  if (!userId || !certificationTierRaw || !isCertificationTier(certificationTierRaw)) {
    return;
  }
  const certificationTier = certificationTierRaw;

  const amountTotal = typeof checkoutSession.amount_total === "number" ? checkoutSession.amount_total : 0;
  await prisma.certificationPurchase.upsert({
    where: { providerCheckoutId: checkoutSession.id },
    update: {
      status: "completed",
      completedAt: new Date(),
      providerPaymentIntent:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id ?? null,
      providerCustomerId:
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id ?? null,
      amountCents: amountTotal > 0 ? amountTotal : CERTIFICATION_PRICE_CENTS[certificationTier],
      currency: checkoutSession.currency ?? "usd",
      metadata: toInputJson(metadata),
    },
    create: {
      userId,
      certificationTier,
      provider: "stripe",
      providerCheckoutId: checkoutSession.id,
      providerPaymentIntent:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id ?? null,
      providerCustomerId:
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id ?? null,
      amountCents: amountTotal > 0 ? amountTotal : CERTIFICATION_PRICE_CENTS[certificationTier],
      currency: checkoutSession.currency ?? "usd",
      status: "completed",
      completedAt: new Date(),
      metadata: toInputJson(metadata),
    },
  });

  const pendingPurchases = await prisma.certificationPurchase.findMany({
    where: {
      provider: "stripe",
      userId,
      certificationTier,
      status: "pending",
      providerCheckoutId: {
        not: checkoutSession.id,
      },
    },
    select: { id: true },
  });
  if (pendingPurchases.length > 0) {
    await prisma.certificationPurchase.updateMany({
      where: {
        id: {
          in: pendingPurchases.map((purchase) => purchase.id),
        },
      },
      data: {
        status: "canceled",
      },
    });
  }
}

export async function getCompletedCertificationPurchaseForUserTier(input: {
  userId: string;
  certificationTier: CertificationTier;
}): Promise<{ id: string; completedAt: Date } | null> {
  const purchase = await prisma.certificationPurchase.findFirst({
    where: {
      userId: input.userId,
      certificationTier: input.certificationTier,
      status: "completed",
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      completedAt: true,
    },
  });
  if (!purchase?.completedAt) {
    return null;
  }
  return {
    id: purchase.id,
    completedAt: purchase.completedAt,
  };
}

export async function listCertificationPurchasesForUser(
  userEmail: string
): Promise<CertificationPurchaseSnapshot[]> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  if (!user) {
    return [];
  }

  const purchases = await prisma.certificationPurchase.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      certificationTier: true,
      status: true,
      amountCents: true,
      currency: true,
      completedAt: true,
    },
  });

  return purchases.map((purchase) => ({
    id: purchase.id,
    certificationTier: purchase.certificationTier,
    status: purchase.status,
    amountCents: purchase.amountCents,
    currency: purchase.currency,
    completedAt: purchase.completedAt?.toISOString() ?? null,
  }));
}

export function getCertificationTierFromScore(totalScore: number): CertificationTier {
  if (totalScore >= 13) {
    return "expert";
  }
  if (totalScore >= 9) {
    return "advanced";
  }
  if (totalScore >= 5) {
    return "developing";
  }
  return "foundation";
}

export async function getLatestEligibleCertificationPurchaseForUser(input: {
  userId: string;
}): Promise<{
  id: string;
  certificationTier: CertificationTier;
  completedAt: Date;
} | null> {
  const purchase = await prisma.certificationPurchase.findFirst({
    where: {
      userId: input.userId,
      status: "completed",
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    select: {
      id: true,
      certificationTier: true,
      completedAt: true,
    },
  });
  if (!purchase?.completedAt) {
    return null;
  }
  return {
    id: purchase.id,
    certificationTier: purchase.certificationTier,
    completedAt: purchase.completedAt,
  };
}

export async function issueCertificationFromCompletedPurchase(input: {
  userEmail: string;
  userName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<
  | {
      ok: true;
      data: {
        certification: UserCertification;
        created: boolean;
        purchaseId: string;
        sourceSessionId: string | null;
        providerSync: PurchaseProviderSync | null;
      };
    }
  | {
      ok: false;
      error: {
        code: ApiErrorCode;
        message: string;
        status: number;
        details?: unknown;
      };
    }
> {
  const user = await prisma.user.findUnique({
    where: { email: input.userEmail },
    select: {
      id: true,
      name: true,
      quizSessions: {
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { id: true, totalScore: true },
      },
    },
  });
  if (!user) {
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "User profile not found.",
        status: 404,
      },
    };
  }

  const purchase = await getLatestEligibleCertificationPurchaseForUser({ userId: user.id });
  if (!purchase) {
    const latestSession = user.quizSessions[0] ?? null;
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.PAYMENT_REQUIRED,
        message: "Certification purchase required before issuance.",
        status: 402,
        details: {
          requiredCertificationTier: getCertificationTierFromScore(latestSession?.totalScore ?? 9),
          latestScore: latestSession?.totalScore ?? null,
        },
      },
    };
  }

  const latestSession = user.quizSessions[0] ?? null;
  const issuanceAbuseCheck = await enforceCertificationIssuanceAbuseRules({
    userId: user.id,
    purchaseTier: purchase.certificationTier,
    latestScore: latestSession?.totalScore ?? null,
    context: {
      source: "issuance",
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
  if (!issuanceAbuseCheck.ok) {
    return {
      ok: false,
      error: issuanceAbuseCheck.error,
    };
  }

  const existingActive = await prisma.certification.findFirst({
    where: {
      userId: user.id,
      certificationTier: purchase.certificationTier,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
    },
  });
  if (existingActive) {
    return {
      ok: true,
      data: {
        certification: toUserCertification(existingActive),
        created: false,
        purchaseId: purchase.id,
        sourceSessionId: latestSession?.id ?? null,
        providerSync: null,
      },
    };
  }

  const issuance = await issueCertificationFromTier({
    userId: user.id,
    userEmail: input.userEmail,
    userName: input.userName ?? user.name,
    certificationTier: purchase.certificationTier,
    sourceSessionId: latestSession?.id ?? null,
    sourceScore: latestSession?.totalScore ?? null,
  });
  if ("error" in issuance) {
    return {
      ok: false,
      error: issuance.error,
    };
  }

  return {
    ok: true,
    data: {
      certification: issuance.certification,
      created: issuance.created,
      purchaseId: purchase.id,
      sourceSessionId: issuance.sourceSessionId,
      providerSync: issuance.providerSync,
    },
  };
}

export function toCheckoutTierForScore(totalScore: number): CertificationTier {
  if (totalScore >= 13) {
    return "expert";
  }
  if (totalScore >= 9) {
    return "advanced";
  }
  if (totalScore >= 5) {
    return "developing";
  }
  return "foundation";
}
