import type { DefaultSession } from "next-auth";
import type { UserRole, UserSubscriptionTier } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      subscriptionTier: UserSubscriptionTier;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscriptionTier?: UserSubscriptionTier;
    role?: UserRole;
  }
}
