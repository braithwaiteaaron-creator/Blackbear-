import type { AppRole, SubscriptionTier } from "@/lib/types";

export type AccessClaims = {
  role?: AppRole | null;
  subscriptionTier?: SubscriptionTier | null;
  isAuthenticated?: boolean;
};

export type AccessTokenClaims = AccessClaims;

export type AccessArea = "dashboard" | "org" | "admin";

export type AccessDecision = {
  allowed: boolean;
  reason?: string;
};

export const ACCESS_DEFAULTS = {
  role: "user" as AppRole,
  subscriptionTier: "free" as SubscriptionTier,
};

export function normalizeRole(value: string | null | undefined): AppRole {
  if (value === "admin" || value === "org_admin" || value === "user") {
    return value;
  }
  return ACCESS_DEFAULTS.role;
}

export function normalizeSubscriptionTier(
  value: string | null | undefined
): SubscriptionTier {
  if (
    value === "free" ||
    value === "premium" ||
    value === "team" ||
    value === "enterprise"
  ) {
    return value;
  }
  return ACCESS_DEFAULTS.subscriptionTier;
}

function parseCsv(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveClaimsForEmail(input: {
  email?: string | null;
  defaultRole: AppRole;
  defaultSubscriptionTier: SubscriptionTier;
  adminEmailsCsv?: string | null;
  orgAdminEmailsCsv?: string | null;
  enterpriseEmailsCsv?: string | null;
  teamEmailsCsv?: string | null;
}): { role: AppRole; subscriptionTier: SubscriptionTier } {
  const email = (input.email ?? "").trim().toLowerCase();
  let role = input.defaultRole;
  let subscriptionTier = input.defaultSubscriptionTier;

  if (!email) {
    return { role, subscriptionTier };
  }

  const adminEmails = parseCsv(input.adminEmailsCsv);
  const orgAdminEmails = parseCsv(input.orgAdminEmailsCsv);
  const enterpriseEmails = parseCsv(input.enterpriseEmailsCsv);
  const teamEmails = parseCsv(input.teamEmailsCsv);

  if (teamEmails.includes(email)) {
    subscriptionTier = "team";
  }
  if (enterpriseEmails.includes(email)) {
    subscriptionTier = "enterprise";
  }

  if (orgAdminEmails.includes(email)) {
    role = "org_admin";
  }
  if (adminEmails.includes(email)) {
    role = "admin";
  }

  return { role, subscriptionTier };
}

export function canAccessArea(input: {
  area: AccessArea;
  role?: AppRole | null;
  subscriptionTier?: SubscriptionTier | null;
}): AccessDecision {
  const role = input.role ?? ACCESS_DEFAULTS.role;
  const subscriptionTier = input.subscriptionTier ?? "free";

  if (input.area === "dashboard") {
    return { allowed: true };
  }

  if (input.area === "org") {
    const roleAllowed = role === "org_admin" || role === "admin";
    const tierAllowed = subscriptionTier === "team" || subscriptionTier === "enterprise";
    if (!roleAllowed) {
      return { allowed: false, reason: "organization-role-required" };
    }
    if (!tierAllowed) {
      return { allowed: false, reason: "team-or-enterprise-required" };
    }
    return { allowed: true };
  }

  const adminAllowed = role === "admin";
  if (!adminAllowed) {
    return { allowed: false, reason: "admin-role-required" };
  }
  return { allowed: true };
}

export function canAccessDashboard(claims: AccessTokenClaims): boolean {
  return Boolean(claims);
}

export function canAccessOrganization(claims: AccessTokenClaims): boolean {
  return canAccessArea({
    area: "org",
    role: claims.role ?? ACCESS_DEFAULTS.role,
    subscriptionTier: claims.subscriptionTier ?? ACCESS_DEFAULTS.subscriptionTier,
  }).allowed;
}

export function canAccessAdmin(claims: AccessTokenClaims): boolean {
  return canAccessArea({
    area: "admin",
    role: claims.role ?? ACCESS_DEFAULTS.role,
    subscriptionTier: claims.subscriptionTier ?? ACCESS_DEFAULTS.subscriptionTier,
  }).allowed;
}

export function canAccessDashboardRoute(claims: AccessClaims): boolean {
  return canAccessDashboard(claims);
}

export function canAccessOrganizationRoute(claims: AccessClaims): boolean {
  return canAccessOrganization(claims);
}

export function canAccessAdminRoute(claims: AccessClaims): boolean {
  return canAccessAdmin(claims);
}

