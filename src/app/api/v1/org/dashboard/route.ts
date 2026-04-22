import { getServerSession } from "next-auth";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { requireOrganizationApiAccess } from "@/lib/admin-api-auth";
import { getOrganizationDashboardMetrics } from "@/lib/org-dashboard-service";

export async function GET() {
  const accessError = await requireOrganizationApiAccess();
  if (accessError) {
    return setApiVersionHeader(accessError);
  }

  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const sessionTier =
    session.user?.subscriptionTier === "team" || session.user?.subscriptionTier === "enterprise"
      ? session.user.subscriptionTier
      : null;
  const metrics = await getOrganizationDashboardMetrics({
    userEmail: email,
    userName: session.user?.name ?? null,
    userRole: session.user?.role ?? null,
    userSubscriptionTier: sessionTier,
  });
  if (!metrics.ok) {
    return setApiVersionHeader(
      apiError(
        metrics.error.code,
        metrics.error.message,
        metrics.error.status,
        metrics.error.details
      )
    );
  }

  return setApiVersionHeader(apiSuccess(metrics.data));
}
