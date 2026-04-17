import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { env, hasGitHubOAuthConfig, hasGoogleOAuthConfig } from "@/lib/env";
import { ACCESS_DEFAULTS, resolveClaimsForEmail } from "@/lib/access-control";
import type { AppRole, SubscriptionTier } from "@/lib/types";

const providers: NextAuthOptions["providers"] = [];

if (hasGitHubOAuthConfig()) {
  providers.push(
    GithubProvider({
      clientId: env.AUTH_GITHUB_ID!,
      clientSecret: env.AUTH_GITHUB_SECRET!,
    })
  );
}

if (hasGoogleOAuthConfig()) {
  providers.push(
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID!,
      clientSecret: env.AUTH_GOOGLE_SECRET!,
    })
  );
}

export const authConfig: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token }) {
      const email =
        typeof token.email === "string" && token.email.length > 0 ? token.email : undefined;
      const resolvedClaims = resolveClaimsForEmail({
        email,
        defaultRole: env.DEFAULT_USER_ROLE ?? ACCESS_DEFAULTS.role,
        defaultSubscriptionTier:
          env.DEFAULT_SUBSCRIPTION_TIER ?? ACCESS_DEFAULTS.subscriptionTier,
        adminEmailsCsv: env.ADMIN_EMAILS,
        orgAdminEmailsCsv: env.ORG_ADMIN_EMAILS,
        enterpriseEmailsCsv: env.ENTERPRISE_TIER_EMAILS,
        teamEmailsCsv: env.TEAM_TIER_EMAILS,
      });
      if (!token.role) {
        token.role = resolvedClaims.role as AppRole;
      }
      if (!token.subscriptionTier) {
        token.subscriptionTier = resolvedClaims.subscriptionTier as SubscriptionTier;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.subscriptionTier =
          (token.subscriptionTier as SubscriptionTier | undefined) ??
          ACCESS_DEFAULTS.subscriptionTier;
        session.user.role = (token.role as AppRole | undefined) ?? ACCESS_DEFAULTS.role;
      }
      return session;
    },
  },
};
