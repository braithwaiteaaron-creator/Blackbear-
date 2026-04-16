import type { CertificationTier, Prisma } from "@prisma/client";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { issueCertificationFromTier } from "@/lib/certification-issuance";
import { prisma } from "@/lib/prisma";
import type { CredentialProviderSync, UserCertification } from "@/lib/types";

type AdminCertificationError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

export type AdminCertificationRecord = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  tier: CertificationTier;
  issuedAt: string;
  expiresAt: string | null;
  verificationCode: string;
  certificateUrl: string;
  status: "active" | "revoked" | "expired";
};

export type AdminReissueResult = {
  certification: UserCertification;
  sourceSessionId: string | null;
  providerSync: CredentialProviderSync | null;
};

type ReissueInput = {
  targetUserEmail: string;
  certificationTier: CertificationTier;
  reason?: string;
};

type RevokeInput = {
  certificationId: string;
  reason?: string;
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

function mapStatus(input: { expiresAt: Date | null; revokedAt: Date | null }): "active" | "revoked" | "expired" {
  if (input.revokedAt) {
    return "revoked";
  }
  if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
    return "expired";
  }
  return "active";
}

export async function listAdminCertifications(limit = 100): Promise<AdminCertificationRecord[]> {
  const certifications = await prisma.certification.findMany({
    orderBy: { issuedAt: "desc" },
    take: Math.max(1, Math.min(limit, 250)),
    select: {
      id: true,
      userId: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return certifications.map((certification) => ({
    id: certification.id,
    userId: certification.userId,
    userEmail: certification.user.email,
    userName: certification.user.name,
    tier: certification.certificationTier,
    issuedAt: certification.issuedAt.toISOString(),
    expiresAt: certification.expiresAt?.toISOString() ?? null,
    verificationCode: certification.credlyBadgeId,
    certificateUrl: certification.badgeUrl,
    status: mapStatus({
      expiresAt: certification.expiresAt,
      revokedAt: certification.revokedAt,
    }),
  }));
}

export async function revokeCertificationById(
  input: RevokeInput
): Promise<AdminCertificationRecord | { error: AdminCertificationError }> {
  const certification = await prisma.certification.findUnique({
    where: { id: input.certificationId },
    select: {
      id: true,
      userId: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      metadata: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
  if (!certification) {
    return {
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "Certification not found.",
        status: 404,
      },
    };
  }

  const now = new Date();
  const updated = await prisma.certification.update({
    where: { id: input.certificationId },
    data: {
      revokedAt: now,
      expiresAt: certification.expiresAt && certification.expiresAt < now ? certification.expiresAt : now,
      revocationReason: input.reason?.trim() || "Revoked by admin",
      metadata: toInputJson({
        ...(certification.metadata && typeof certification.metadata === "object"
          ? certification.metadata
          : {}),
        adminActions: [
          {
            type: "revoked",
            at: now.toISOString(),
            reason: input.reason?.trim() || "Revoked by admin",
          },
        ],
      }),
    },
    select: {
      id: true,
      userId: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    userEmail: updated.user.email,
    userName: updated.user.name,
    tier: updated.certificationTier,
    issuedAt: updated.issuedAt.toISOString(),
    expiresAt: updated.expiresAt?.toISOString() ?? null,
    verificationCode: updated.credlyBadgeId,
    certificateUrl: updated.badgeUrl,
    status: mapStatus({
      expiresAt: updated.expiresAt,
      revokedAt: updated.revokedAt,
    }),
  };
}

export async function reissueCertificationForUser(
  input: ReissueInput
): Promise<AdminReissueResult | { error: AdminCertificationError }> {
  const targetUserEmail = input.targetUserEmail.trim().toLowerCase();
  if (!targetUserEmail) {
    return {
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Target user email is required.",
        status: 400,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: targetUserEmail },
    select: {
      id: true,
      email: true,
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
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "Target user not found.",
        status: 404,
      },
    };
  }

  const now = new Date();
  await prisma.certification.updateMany({
    where: {
      userId: user.id,
      certificationTier: input.certificationTier,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    data: {
      revokedAt: now,
      expiresAt: now,
      revocationReason: input.reason?.trim() || "Superseded by admin reissue",
      metadata: toInputJson({
        action: "reissued",
        replacedBy: "admin",
        reason: input.reason?.trim() || "Superseded by admin reissue",
        occurredAt: now.toISOString(),
      }),
    },
  });

  const sourceSession = user.quizSessions[0] ?? null;
  const issued = await issueCertificationFromTier({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    certificationTier: input.certificationTier,
    sourceSessionId: sourceSession?.id ?? null,
    sourceScore: sourceSession?.totalScore ?? null,
  });
  if ("error" in issued) {
    return {
      error: issued.error,
    };
  }

  return {
    certification: issued.certification,
    sourceSessionId: issued.sourceSessionId,
    providerSync: issued.providerSync,
  };
}
