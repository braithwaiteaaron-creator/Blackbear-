import { getAdminSessionClaims } from "@/lib/admin-api-auth";
import { API_ERROR_CODES, apiError } from "@/lib/api";
import { canAccessAdmin, type AccessTokenClaims } from "@/lib/access-control";

export async function requireAdminApiAccess() {
  const auth = await getAdminSessionClaims();
  if (!auth) {
    return apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401);
  }
  const claims: AccessTokenClaims = auth;
  if (!canAccessAdmin(claims)) {
    return apiError(API_ERROR_CODES.FORBIDDEN, "Admin role required.", 403);
  }

  return null;
}
