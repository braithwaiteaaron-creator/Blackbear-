import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { env, hasGitHubOAuthConfig, hasGoogleOAuthConfig } from "@/lib/env";

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
    session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.subscriptionTier = "free";
      }
      return session;
    },
  },
};
