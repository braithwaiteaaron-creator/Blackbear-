import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CertificationTier } from "@prisma/client";

import { randomUUID } from "node:crypto";

import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getBadgeTier } from "@/lib/scoring";
import type {
  BadgeTier,
  CertificationVerificationRecord,
  UserCertification,
} from "@/lib/types";

type ServiceError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

type CertificateIssueResult = {
  certification: UserCertification;
  created: boolean;
  sourceSessionId: string;
};

const CERTIFICATE_VALIDITY_DAYS = 365;
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

function toCertificationTier(badgeTier: BadgeTier): CertificationTier {
  return badgeTier;
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

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function escapePdfText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replace(/[^\x20-\x7E]/g, "");
}

function buildSimplePdf(lines: string[]): Buffer {
  const contentLines = [
    "BT",
    "/F1 24 Tf",
    "72 730 Td",
    `(${escapePdfText(lines[0] ?? "")}) Tj`,
    "/F1 18 Tf",
    "0 -38 Td",
    `(${escapePdfText(lines[1] ?? "")}) Tj`,
    "/F1 14 Tf",
    "0 -44 Td",
    `(${escapePdfText(lines[2] ?? "")}) Tj`,
    "0 -24 Td",
    `(${escapePdfText(lines[3] ?? "")}) Tj`,
    "0 -24 Td",
    `(${escapePdfText(lines[4] ?? "")}) Tj`,
    "0 -24 Td",
    `(${escapePdfText(lines[5] ?? "")}) Tj`,
    "0 -24 Td",
    `(${escapePdfText(lines[6] ?? "")}) Tj`,
    "ET",
  ];
  const stream = contentLines.join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  const parts: Buffer[] = [Buffer.from("%PDF-1.4\n", "utf8")];
  const offsets: number[] = [0];
  let currentOffset = parts[0].length;

  for (const objectText of objects) {
    offsets.push(currentOffset);
    const objectBuffer = Buffer.from(objectText, "utf8");
    parts.push(objectBuffer);
    currentOffset += objectBuffer.length;
  }

  const xrefOffset = currentOffset;
  const xrefHeader = [`xref`, `0 ${objects.length + 1}`, "0000000000 65535 f "];
  const xrefEntries = offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `);
  const trailer = [
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ];
  parts.push(Buffer.from([...xrefHeader, ...xrefEntries, ...trailer].join("\n"), "utf8"));

  return Buffer.concat(parts);
}

function buildVerificationCode(tier: CertificationTier): string {
  const random = randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  return `CERT-${tier.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function normalizeVerificationCode(value: string): string {
  return value.trim().toUpperCase();
}

async function writeCertificatePdf(input: {
  verificationCode: string;
  fullName: string;
  tier: CertificationTier;
  score: number;
  issuedAt: Date;
  expiresAt: Date;
}): Promise<string> {
  const pdf = buildSimplePdf([
    "GitHub Mastery Ecosystem",
    "Certificate of Proficiency",
    `Awarded to: ${input.fullName}`,
    `Tier: ${input.tier}`,
    `Assessment score: ${input.score}/15`,
    `Issued: ${input.issuedAt.toISOString().slice(0, 10)}`,
    `Expires: ${input.expiresAt.toISOString().slice(0, 10)} (${input.verificationCode})`,
  ]);

  const fileName = `${input.verificationCode.toLowerCase()}.pdf`;
  const targetDir = path.join(process.cwd(), "public", "certificates");
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, fileName), pdf);
  return `/certificates/${fileName}`;
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

export async function issueCertificationForLatestSession(input: {
  userEmail: string;
  userName?: string | null;
}): Promise<CertificateIssueResult | { error: ServiceError }> {
  const user = await prisma.user.findUnique({
    where: { email: input.userEmail },
    select: {
      id: true,
      name: true,
      quizSessions: {
        orderBy: { completedAt: "desc" },
        take: 1,
        select: {
          id: true,
          totalScore: true,
        },
      },
    },
  });

  if (!user) {
    return {
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "User profile not found.",
        status: 404,
      },
    };
  }

  const latestSession = user.quizSessions[0];
  if (!latestSession) {
    return {
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "No completed quiz session found for certification issuance.",
        status: 404,
      },
    };
  }

  const certificationTier = toCertificationTier(getBadgeTier(latestSession.totalScore));
  const existingActive = await prisma.certification.findFirst({
    where: {
      userId: user.id,
      certificationTier,
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
      certification: toUserCertification(existingActive),
      created: false,
      sourceSessionId: latestSession.id,
    };
  }

  const issuedAt = new Date();
  const expiresAt = addDays(issuedAt, CERTIFICATE_VALIDITY_DAYS);
  const verificationCode = buildVerificationCode(certificationTier);
  const fullName =
    (input.userName?.trim() || user.name?.trim() || input.userEmail.split("@")[0] || "Learner")
      .slice(0, 120);
  const certificateUrl = await writeCertificatePdf({
    verificationCode,
    fullName,
    tier: certificationTier,
    score: latestSession.totalScore,
    issuedAt,
    expiresAt,
  });

  const created = await prisma.certification.create({
    data: {
      userId: user.id,
      certificationTier,
      badgeUrl: certificateUrl,
      credlyBadgeId: verificationCode,
      issuedAt,
      expiresAt,
    },
    select: {
      id: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
    },
  });

  return {
    certification: toUserCertification(created),
    created: true,
    sourceSessionId: latestSession.id,
  };
}

export async function getCertificationVerificationRecord(input: {
  verificationCode: string;
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

  const certification = await prisma.certification.findUnique({
    where: { credlyBadgeId: normalizedCode },
    select: {
      id: true,
      certificationTier: true,
      badgeUrl: true,
      credlyBadgeId: true,
      issuedAt: true,
      expiresAt: true,
      user: {
        select: {
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
  const isActive = certification.expiresAt ? certification.expiresAt.getTime() > now : true;
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return {
    verificationCode: certification.credlyBadgeId,
    credentialId: certification.id,
    tier: certification.certificationTier,
    status: isActive ? "active" : "expired",
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
