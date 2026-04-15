import { NextResponse } from "next/server";

import { verifyAndHandleStripeWebhook } from "@/lib/billing/webhooks";

export async function POST(request: Request) {
  const result = await verifyAndHandleStripeWebhook(request);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
        },
      },
      { status: result.error.status }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: result.data,
    },
    { status: 200 }
  );
}
