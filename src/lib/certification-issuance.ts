import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CertificationTier } from "@prisma/client";

import { type ApiErrorCode } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import type { CredentialProviderSync, UserCertification } from "@/lib/types";
import { syncIssuedCredential } from "@/lib/credential-provider";

type IssuanceError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

export type IssuanceResult = {
  certification: UserCertification;
  created: boolean;
  sourceSessionId: string | null;
  providerSync: CredentialProviderSync | null;
};

function toUserCertification(input: {
  id: string;
  certificationTier: CertificationTier;
  badgeUrl: string;
  credlyBadgeId: string;
  issuedAt: Date;
  expiresAt: Date | null;
}): UserCertification {
  const now = Date.now();
  return {
    id: input.id,
    tier: input.certificationTier,
    issuedAt: input.issuedAt.toISOString(),
    expiresAt: input.expiresAt?.toISOString() ?? null,
    certificateUrl: input.badgeUrl,
    verificationCode: input.credlyBadgeId,
    isActive: input.expiresAt ? input.expiresAt.getTime() > now : true,
  };
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
  const xrefHeader = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
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

async function writeCertificatePdf(input: {
  verificationCode: string;
  fullName: string;
  tier: CertificationTier;
  score: number | null;
  issuedAt: Date;
  expiresAt: Date;
}): Promise<string> {
  const pdf = buildSimplePdf([
    "GitHub Mastery Ecosystem",
    "Certificate of Proficiency",
    `Awarded to: ${input.fullName}`,
    `Tier: ${input.tier}`,
    `Assessment score: ${input.score === null ? "N/A" : `${input.score}/15`}`,
    `Issued: ${input.issuedAt.toISOString().slice(0, 10)}`,
    `Expires: ${input.expiresAt.toISOString().slice(0, 10)} (${input.verificationCode})`,
  ]);

  const fileName = `${input.verificationCode.toLowerCase()}.pdf`;
  const targetDir = path.join(process.cwd(), "public", "certificates");
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, fileName), pdf);
  return `/certificates/${fileName}`;
}

export async function issueCertificationFromTier(input: {
  userId: string;
  userEmail: string;
  userName?: string | null;
  certificationTier: CertificationTier;
  sourceSessionId: string | null;
  sourceScore: number | null;
}): Promise<IssuanceResult | { error: IssuanceError }> {
  const existingActive = await prisma.certification.findFirst({
    where: {
      userId: input.userId,
      certificationTier: input.certificationTier,
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
      sourceSessionId: input.sourceSessionId,
      providerSync: null,
    };
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 365);
  const verificationCode = buildVerificationCode(input.certificationTier);
  const fullName =
    (input.userName?.trim() || input.userEmail.split("@")[0] || "Learner").slice(0, 120);
  const certificateUrl = await writeCertificatePdf({
    verificationCode,
    fullName,
    tier: input.certificationTier,
    score: input.sourceScore,
    issuedAt,
    expiresAt,
  });

  const created = await prisma.certification.create({
    data: {
      userId: input.userId,
      certificationTier: input.certificationTier,
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

  const providerSyncResult = await syncIssuedCredential({
    verificationCode,
    tier: input.certificationTier,
    holderName: fullName,
    issuedAt,
    expiresAt,
    certificateUrl,
  });
  const providerSync = providerSyncResult.ok
    ? providerSyncResult.data
    : {
        provider: "mock" as const,
        status: "failed" as const,
        syncedAt: new Date().toISOString(),
        externalCredentialId: null,
        externalUrl: null,
        message: providerSyncResult.error.message,
      };

  return {
    certification: toUserCertification(created),
    created: true,
    sourceSessionId: input.sourceSessionId,
    providerSync,
  };
}
