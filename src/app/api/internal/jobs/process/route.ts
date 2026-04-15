import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { processPendingJobs } from "@/lib/job-queue";

const bodySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
});

function isWorkerAuthorized(request: Request): boolean {
  const secret = env.JOB_WORKER_KEY;
  if (!secret) {
    return false;
  }
  const header = request.headers.get("x-job-worker-key");
  return header === secret;
}

export async function POST(request: Request) {
  if (!isWorkerAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Forbidden.",
        },
      },
      { status: 403 }
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid process request.",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const report = await processPendingJobs(parsed.data.limit ?? 25);
  return NextResponse.json(
    {
      ok: true,
      data: report,
    },
    { status: 200 }
  );
}
