import { apiError, apiSuccess } from "@/lib/api";
import { createCertificationCheckoutSession } from "@/lib/certification-purchase";

export async function POST(request: Request) {
  const checkoutResult = await createCertificationCheckoutSession(request);
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
