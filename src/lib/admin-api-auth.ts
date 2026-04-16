import { getServerSession } from "next-auth";

import { canAccessOrganization, type AccessTokenClaims } from "@/lib/access-control";
import { authConfig } from "@/lib/auth";
import { API_ERROR_CODES, apiError } from "@/lib/api";

export async function getAdminSessionClaims(): Promise<AccessTokenClaims | null> {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return null;
  }

  return {
    role: session.user.role,
    subscriptionTier: session.user.subscriptionTier,
    isAuthenticated: true,
  };
}

export async function requireOrganizationApiAccess() {
  const claims = await getAdminSessionClaims();
  if (!claims) {
    return apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401);
  }
  if (!canAccessOrganization(claims)) {
    return apiError(
      API_ERROR_CODES.FORBIDDEN,
      "Organization admin or admin access required with team/enterprise subscription.",
      403
    );
  }
  return null;
}
