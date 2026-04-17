import type {
  CertificationRiskEventType,
  CertificationRiskSeverity,
  CertificationTier,
  Prisma,
} from "@prisma/client";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type AbuseError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

type AbuseCheckResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: AbuseError;
    };

type AbuseContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
  source: "checkout" | "issuance" | "verification";
};

const MAX_PENDING_PURCHASES_PER_TIER = 3;
const RECENT_PURCHASE_WINDOW_MINUTES = 20;
const MAX_CHECKOUTS_WITHOUT_ASSESSMENT = 3;

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

export async function logCertificationRiskEvent(input: {
  userId?: string | null;
  certificationId?: string | null;
  eventType: CertificationRiskEventType;
  severity: CertificationRiskSeverity;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await prisma.certificationRiskEvent.create({
    data: {
      userId: input.userId ?? null,
      certificationId: input.certificationId ?? null,
      eventType: input.eventType,
      severity: input.severity,
      details: toInputJson(input.details),
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function enforceCertificationCheckoutAbuseRules(input: {
  userId: string;
  requestedTier: CertificationTier;
  latestScore: number | null;
  context: AbuseContext;
}): Promise<AbuseCheckResult> {
  const expectedTierFromScore =
    input.latestScore === null
      ? null
      : input.latestScore >= 13
        ? "expert"
        : input.latestScore >= 9
          ? "advanced"
          : input.latestScore >= 5
            ? "developing"
            : "foundation";

  if (input.latestScore === null) {
    const recentWithoutAssessmentCount = await prisma.certificationRiskEvent.count({
      where: {
        userId: input.userId,
        eventType: "checkout_without_assessment",
        detectedAt: {
          gte: new Date(Date.now() - RECENT_PURCHASE_WINDOW_MINUTES * 60 * 1000),
        },
      },
    });

    await logCertificationRiskEvent({
      userId: input.userId,
      eventType: "checkout_without_assessment",
      severity: recentWithoutAssessmentCount + 1 >= MAX_CHECKOUTS_WITHOUT_ASSESSMENT ? "high" : "medium",
      details: {
        source: input.context.source,
        requestedTier: input.requestedTier,
        latestScore: input.latestScore,
      },
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    });

    if (recentWithoutAssessmentCount + 1 >= MAX_CHECKOUTS_WITHOUT_ASSESSMENT) {
      return {
        ok: false,
        error: {
          code: API_ERROR_CODES.FORBIDDEN,
          message:
            "Repeated certification checkout attempts without a completed assessment were blocked.",
          status: 403,
        },
      };
    }
  }

  if (expectedTierFromScore && expectedTierFromScore !== input.requestedTier) {
    await logCertificationRiskEvent({
      userId: input.userId,
      eventType: "checkout_tier_mismatch",
      severity: "medium",
      details: {
        source: input.context.source,
        requestedTier: input.requestedTier,
        expectedTierFromScore,
        latestScore: input.latestScore,
      },
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    });
  }

  const pendingCount = await prisma.certificationPurchase.count({
    where: {
      userId: input.userId,
      certificationTier: input.requestedTier,
      status: "pending",
      createdAt: {
        gte: new Date(Date.now() - RECENT_PURCHASE_WINDOW_MINUTES * 60 * 1000),
      },
    },
  });
  if (pendingCount >= MAX_PENDING_PURCHASES_PER_TIER) {
    await logCertificationRiskEvent({
      userId: input.userId,
      eventType: "checkout_pending_flood",
      severity: "high",
      details: {
        source: input.context.source,
        pendingCount,
        requestedTier: input.requestedTier,
      },
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    });
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.RATE_LIMITED,
        message: "Too many in-progress certification checkout attempts. Try again shortly.",
        status: 429,
      },
    };
  }

  return { ok: true };
}

export async function enforceCertificationIssuanceAbuseRules(input: {
  userId: string;
  purchaseTier: CertificationTier;
  latestScore: number | null;
  context: AbuseContext;
}): Promise<AbuseCheckResult> {
  const expectedTier =
    input.latestScore === null
      ? null
      : input.latestScore >= 13
        ? "expert"
        : input.latestScore >= 9
          ? "advanced"
          : input.latestScore >= 5
            ? "developing"
            : "foundation";
  if (input.latestScore === null) {
    await logCertificationRiskEvent({
      userId: input.userId,
      eventType: "issuance_without_assessment",
      severity: "high",
      details: {
        source: input.context.source,
        purchaseTier: input.purchaseTier,
      },
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    });
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message: "Certification issuance requires a completed assessment.",
        status: 403,
      },
    };
  }
  if (expectedTier && expectedTier !== input.purchaseTier) {
    await logCertificationRiskEvent({
      userId: input.userId,
      eventType: "issuance_tier_mismatch",
      severity: "high",
      details: {
        source: input.context.source,
        purchaseTier: input.purchaseTier,
        expectedTier,
        latestScore: input.latestScore,
      },
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    });
    return {
      ok: false,
      error: {
        code: API_ERROR_CODES.FORBIDDEN,
        message:
          "Issued tier does not match latest assessed proficiency. Complete a new checkout for your current tier.",
        status: 403,
      },
    };
  }
  return { ok: true };
}

export async function markRevokedCredentialVerificationAttempt(input: {
  userId?: string | null;
  certificationId?: string | null;
  verificationCode: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await logCertificationRiskEvent({
    userId: input.userId ?? null,
    certificationId: input.certificationId ?? null,
    eventType: "revoked_credential_verification",
    severity: "medium",
    details: {
      verificationCode: input.verificationCode,
      source: "verification",
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export async function listCertificationRiskEvents(params?: {
  limit?: number;
  unresolvedOnly?: boolean;
}) {
  const limit = Math.min(Math.max(params?.limit ?? 100, 1), 250);
  const events = await prisma.certificationRiskEvent.findMany({
    where: params?.unresolvedOnly ? { resolvedAt: null } : undefined,
    orderBy: { detectedAt: "desc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      certificationId: true,
      eventType: true,
      severity: true,
      details: true,
      ipAddress: true,
      userAgent: true,
      detectedAt: true,
      resolvedAt: true,
      resolutionNote: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return events.map((event) => ({
    id: event.id,
    userId: event.userId,
    userEmail: event.user?.email ?? null,
    userName: event.user?.name ?? null,
    certificationId: event.certificationId,
    eventType: event.eventType,
    severity: event.severity,
    details: event.details,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    detectedAt: event.detectedAt.toISOString(),
    resolvedAt: event.resolvedAt?.toISOString() ?? null,
    resolutionNote: event.resolutionNote,
  }));
}

export async function resolveCertificationRiskEvent(input: {
  eventId: string;
  resolutionNote: string;
}) {
  const note = input.resolutionNote.trim();
  if (!note) {
    throw new Error("Resolution note is required.");
  }
  return prisma.certificationRiskEvent.update({
    where: { id: input.eventId },
    data: {
      resolvedAt: new Date(),
      resolutionNote: note,
    },
    select: {
      id: true,
      resolvedAt: true,
      resolutionNote: true,
    },
  });
}
