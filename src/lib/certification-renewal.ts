import { env, isCertificationRenewalSchedulerEnabled } from "@/lib/env";
import { enqueueJob } from "@/lib/job-queue";
import { prisma } from "@/lib/prisma";

export type RenewalScheduleResult = {
  scanned: number;
  enqueued: number;
  skipped: number;
  disabled: boolean;
  lookaheadDays: number;
};

function getLookaheadDays(): number {
  return env.CERTIFICATION_RENEWAL_LOOKAHEAD_DAYS ?? 30;
}

function getScheduledByValue(): string {
  return env.CERTIFICATION_RENEWAL_SCHEDULED_BY ?? "system-renewal-scheduler";
}

function buildWindow(now: Date, lookaheadDays: number): { start: Date; end: Date } {
  const start = now;
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + lookaheadDays);
  return { start, end };
}

export async function scheduleCertificationRenewalJobs(
  now = new Date()
): Promise<RenewalScheduleResult> {
  const lookaheadDays = getLookaheadDays();
  if (!isCertificationRenewalSchedulerEnabled()) {
    return {
      scanned: 0,
      enqueued: 0,
      skipped: 0,
      disabled: true,
      lookaheadDays,
    };
  }

  const { start, end } = buildWindow(now, lookaheadDays);
  const expiringCertifications = await prisma.certification.findMany({
    where: {
      expiresAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      expiresAt: "asc",
    },
    select: {
      id: true,
      userId: true,
      certificationTier: true,
      expiresAt: true,
    },
  });

  let enqueued = 0;
  let skipped = 0;
  const scheduledBy = getScheduledByValue();

  for (const certification of expiringCertifications) {
    if (!certification.expiresAt) {
      skipped += 1;
      continue;
    }

    const idempotencyKey = `cert-renewal:${certification.id}:${certification.expiresAt.toISOString().slice(0, 10)}`;
    const existing = await prisma.jobQueue.findUnique({
      where: { idempotencyKey },
      select: { id: true },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await enqueueJob({
      jobType: "certification_renewal_notice",
      idempotencyKey,
      payload: {
        certificationId: certification.id,
        userId: certification.userId,
        certificationTier: certification.certificationTier,
        expiresAt: certification.expiresAt.toISOString(),
        scheduledBy,
      },
    });
    enqueued += 1;
  }

  return {
    scanned: expiringCertifications.length,
    enqueued,
    skipped,
    disabled: false,
    lookaheadDays,
  };
}
