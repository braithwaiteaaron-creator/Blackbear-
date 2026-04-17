import { apiError, apiSuccess } from "@/lib/api";
import { createBillingPortalSession } from "@/lib/billing";

export async function POST() {
  const portalResult = await createBillingPortalSession();
  if (!portalResult.ok) {
    return apiError(
      portalResult.error.code,
      portalResult.error.message,
      portalResult.error.status,
      portalResult.error.details
    );
  }

  return apiSuccess(portalResult.data, 200);
}
