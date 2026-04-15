import { getServerSession } from "next-auth";
import { z } from "zod";

import { authConfig } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { createBillingCheckoutSession } from "@/lib/billing/checkout";

const requestSchema = z.object({
  planId: z.enum(["premium", "team"]),
  interval: z.enum(["month", "year"]).default("month"),
});

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  const userId = session?.user?.id;

  if (!email || !userId) {
    return apiError("AUTH_REQUIRED", "Authentication required.", 401);
  }

  const parsedBody = requestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsedBody.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid checkout request payload.",
      400,
      parsedBody.error.flatten()
    );
  }

  const checkoutResult = await createBillingCheckoutSession({
    userId,
    userEmail: email,
    userName: session.user?.name ?? null,
    planId: parsedBody.data.planId,
    interval: parsedBody.data.interval,
  });

  if ("error" in checkoutResult) {
    return apiError(
      checkoutResult.error.code,
      checkoutResult.error.message,
      checkoutResult.error.status,
      checkoutResult.error.details
    );
  }

  return apiSuccess(checkoutResult, 201);
}
