import { withAuth } from "next-auth/middleware";

import {
  canAccessAdminRoute,
  canAccessDashboardRoute,
  canAccessOrganizationRoute,
  type AccessClaims,
} from "@/lib/access-control";

function toClaims(token: Record<string, unknown>): AccessClaims {
  return {
    role:
      token.role === "user" || token.role === "org_admin" || token.role === "admin"
        ? token.role
        : undefined,
    subscriptionTier:
      token.subscriptionTier === "free" ||
      token.subscriptionTier === "premium" ||
      token.subscriptionTier === "team" ||
      token.subscriptionTier === "enterprise"
        ? token.subscriptionTier
        : undefined,
  };
}

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/org") && !pathname.startsWith("/admin")) {
          return true;
        }

        if (!token) {
          return false;
        }

        const claims = toClaims(token as Record<string, unknown>);

        if (pathname.startsWith("/admin")) {
          return canAccessAdminRoute(claims);
        }
        if (pathname.startsWith("/org")) {
          return canAccessOrganizationRoute(claims);
        }
        if (pathname.startsWith("/dashboard")) {
          return canAccessDashboardRoute(claims);
        }

        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/org/:path*", "/admin/:path*"],
};
