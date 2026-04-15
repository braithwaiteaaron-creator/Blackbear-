import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { env, hasGitHubOAuthConfig, hasGoogleOAuthConfig } from "@/lib/env";
import { ACCESS_DEFAULTS } from "@/lib/access-control";
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
      if (!token.role) {
        token.role = ACCESS_DEFAULTS.role as AppRole;
      }
      if (!token.subscriptionTier) {
        token.subscriptionTier = ACCESS_DEFAULTS.subscriptionTier as SubscriptionTier;
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
