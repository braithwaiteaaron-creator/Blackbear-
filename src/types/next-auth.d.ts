import type { DefaultSession } from "next-auth";
import type { AppRole, SubscriptionTier } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      subscriptionTier: SubscriptionTier;
      role: AppRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscriptionTier?: SubscriptionTier;
    role?: AppRole;
  }
}
