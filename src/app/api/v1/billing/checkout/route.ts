import { apiError, apiSuccess } from "@/lib/api";
import { createPremiumCheckoutSession } from "@/lib/billing/checkout";

export async function POST(request: Request) {
  const checkoutResult = await createPremiumCheckoutSession(request);
  if (!checkoutResult.ok) {
    return apiError(
      checkoutResult.error.code,
      checkoutResult.error.message,
      checkoutResult.error.status,
      checkoutResult.error.details
    );
  }

  return apiSuccess(checkoutResult.data, 201);
}
