import { NextResponse } from "next/server";

import { env, isCertificationRenewalSchedulerEnabled } from "@/lib/env";
import { scheduleCertificationRenewalJobs } from "@/lib/certification-renewal";

function isWorkerAuthorized(request: Request): boolean {
  const secret = env.JOB_WORKER_KEY;
  if (!secret) {
    return false;
  }
  return request.headers.get("x-job-worker-key") === secret;
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

  await request.json().catch(() => ({}));
  const report = await scheduleCertificationRenewalJobs();
  return NextResponse.json(
    {
      ok: true,
      data: {
        ...report,
        schedulerEnabled: isCertificationRenewalSchedulerEnabled(),
      },
    },
    { status: 200 }
  );
}
