import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type QueueJobType = "quiz_session_created" | "billing_dunning_notice";

type QueueJobPayload = Record<string, unknown>;

function payloadToJson(payload: QueueJobPayload): Prisma.InputJsonValue {
  return payload as unknown as Prisma.InputJsonValue;
}

export async function enqueueJob(params: {
  jobType: QueueJobType;
  payload: QueueJobPayload;
  idempotencyKey?: string;
}) {
  if (!params.idempotencyKey) {
    return prisma.jobQueue.create({
      data: {
        jobType: params.jobType,
        status: "pending",
        payload: payloadToJson(params.payload),
      },
      select: { id: true },
    });
  }

  const existing = await prisma.jobQueue.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.jobQueue.create({
    data: {
      jobType: params.jobType,
      status: "pending",
      payload: payloadToJson(params.payload),
      idempotencyKey: params.idempotencyKey,
    },
    select: { id: true },
  });
}

export async function processPendingJobs(limit: number) {
  const jobs = await prisma.jobQueue.findMany({
    where: {
      status: "pending",
      availableAt: { lte: new Date() },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });

  let processed = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          status: "processing",
          attempts: { increment: 1 },
        },
      });

      if (job.jobType === "quiz_session_created") {
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: "completed",
            lastError: null,
          },
        });
        processed += 1;
      } else if (job.jobType === "billing_dunning_notice") {
        // Placeholder dunning execution. Future step wires email provider + retry cadence.
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: "completed",
            lastError: null,
          },
        });
        processed += 1;
      } else {
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: "failed",
            lastError: `Unsupported job type: ${job.jobType}`,
          },
        });
        failed += 1;
      }
    } catch (error) {
      failed += 1;
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          status: job.attempts + 1 >= job.maxAttempts ? "failed" : "pending",
          lastError: error instanceof Error ? error.message : "Unknown queue processing error",
          availableAt:
            job.attempts + 1 >= job.maxAttempts
              ? job.availableAt
              : new Date(Date.now() + 60_000),
        },
      });
    }
  }

  return {
    scanned: jobs.length,
    processed,
    failed,
  };
}
