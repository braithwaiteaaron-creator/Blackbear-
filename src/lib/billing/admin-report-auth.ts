import { getServerSession } from "next-auth";

import { API_ERROR_CODES, apiError } from "@/lib/api";
import { canAccessAdmin, type AccessTokenClaims } from "@/lib/access-control";
import { authConfig } from "@/lib/auth";

export async function requireAdminApiAccess() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401);
  }

  const claims: AccessTokenClaims = {
    role: session.user.role,
    subscriptionTier: session.user.subscriptionTier,
    isAuthenticated: true,
  };
  if (!canAccessAdmin(claims)) {
    return apiError(API_ERROR_CODES.FORBIDDEN, "Admin role required.", 403);
  }

  return null;
}
