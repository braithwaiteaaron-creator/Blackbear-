import { getServerSession } from "next-auth";

import { type AccessTokenClaims } from "@/lib/access-control";
import { authConfig } from "@/lib/auth";

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
