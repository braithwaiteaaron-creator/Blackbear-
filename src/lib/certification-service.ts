import type { CertificationTier } from "@prisma/client";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { markRevokedCredentialVerificationAttempt } from "@/lib/certification-risk";
import { prisma } from "@/lib/prisma";
import type {
  CertificationVerificationRecord,
  UserCertification,
} from "@/lib/types";

type ServiceError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

const VERIFICATION_CODE_PATTERN = /^CERT-[A-Z]+-[A-Z0-9]+-[A-Z0-9]+$/;

function toPublicName(name: string | null | undefined, email: string): string {
  const normalizedName = name?.trim();
  if (normalizedName) {
    return normalizedName.slice(0, 120);
  }
  const localPart = email.split("@")[0] ?? "learner";
  if (localPart.length <= 2) {
    return `${localPart}***`;
  }
  return `${localPart.slice(0, 2)}***`;
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

function normalizeVerificationCode(value: string): string {
  return value.trim().toUpperCase();
}

export async function listCertificationsForUser(
  userEmail: string
): Promise<UserCertification[] | { error: ServiceError }> {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      certifications: {
        orderBy: { issuedAt: "desc" },
        select: {
          id: true,
          certificationTier: true,
          badgeUrl: true,
          credlyBadgeId: true,
          issuedAt: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!user) {
    return [];
  }

  return user.certifications.map(toUserCertification);
}

export async function getCertificationVerificationRecord(input: {
  verificationCode: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<CertificationVerificationRecord | { error: ServiceError }> {
  const normalizedCode = normalizeVerificationCode(input.verificationCode);
  if (!normalizedCode || !VERIFICATION_CODE_PATTERN.test(normalizedCode)) {
    return {
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: "Invalid verification code format.",
        status: 400,
      },
    };
  }

  const certification = await prisma.certification.findFirst({
    where: { credlyBadgeId: normalizedCode },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  if (!certification) {
    return {
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "Credential not found for verification code.",
        status: 404,
      },
    };
  }

  const now = Date.now();
  const isRevoked = Boolean(certification.revokedAt);
  const isActive =
    !isRevoked && (certification.expiresAt ? certification.expiresAt.getTime() > now : true);
  if (isRevoked) {
    await markRevokedCredentialVerificationAttempt({
      userId: certification.user.id,
      certificationId: certification.id,
      verificationCode: certification.credlyBadgeId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return {
    verificationCode: certification.credlyBadgeId,
    credentialId: certification.id,
    tier: certification.certificationTier,
    status: isRevoked ? "revoked" : isActive ? "active" : "expired",
    issuedAt: certification.issuedAt.toISOString(),
    expiresAt: certification.expiresAt?.toISOString() ?? null,
    holder: {
      name: toPublicName(certification.user.name, certification.user.email),
    },
    issuer: {
      name: "GitHub Mastery Ecosystem",
      url: appUrl,
    },
    artifact: {
      certificateUrl: certification.badgeUrl,
    },
  };
}
