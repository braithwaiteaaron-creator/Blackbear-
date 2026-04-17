import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import {
  canAccessAdmin,
  canAccessDashboard,
  canAccessOrganization,
  type AccessTokenClaims,
} from "@/lib/access-control";

async function buildClaims(): Promise<AccessTokenClaims | null> {
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

export async function requireDashboardAccess() {
  const claims = await buildClaims();
  if (!claims) {
    redirect("/");
  }
  if (!canAccessDashboard(claims)) {
    redirect("/unauthorized");
  }
}

export async function requireOrganizationAccess() {
  const claims = await buildClaims();
  if (!claims) {
    redirect("/");
  }
  if (!canAccessOrganization(claims)) {
    redirect("/unauthorized");
  }
}

export async function requireAdminAccess() {
  const claims = await buildClaims();
  if (!claims) {
    redirect("/");
  }
  if (!canAccessAdmin(claims)) {
    redirect("/unauthorized");
  }
}
