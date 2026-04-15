import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  AUTH_GITHUB_ID: z.string().min(1).optional(),
  AUTH_GITHUB_SECRET: z.string().min(1).optional(),
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
  DEFAULT_USER_ROLE: z.enum(["user", "org_admin", "admin"]).optional(),
  DEFAULT_SUBSCRIPTION_TIER: z
    .enum(["free", "premium", "team", "enterprise"])
    .optional(),
  ADMIN_EMAILS: z.string().optional(),
  ORG_ADMIN_EMAILS: z.string().optional(),
  TEAM_TIER_EMAILS: z.string().optional(),
  ENTERPRISE_TIER_EMAILS: z.string().optional(),
  JOB_WORKER_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().min(1).optional(),
  STRIPE_PRICE_PREMIUM_YEARLY: z.string().min(1).optional(),
  STRIPE_PRICE_TEAM_MONTHLY: z.string().min(1).optional(),
  STRIPE_PRICE_TEAM_YEARLY: z.string().min(1).optional(),
  STRIPE_CHECKOUT_SUCCESS_URL: z.string().url().optional(),
  STRIPE_CHECKOUT_CANCEL_URL: z.string().url().optional(),
  STRIPE_ENTERPRISE_CONTACT_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);

export function hasDatabaseConfig(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function hasGitHubOAuthConfig(): boolean {
  return Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
}

export function hasGoogleOAuthConfig(): boolean {
  return Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
}

function parseCsvEmails(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const accessEnv = {
  defaultRole: env.DEFAULT_USER_ROLE ?? "user",
  defaultSubscriptionTier: env.DEFAULT_SUBSCRIPTION_TIER ?? "free",
  adminEmails: parseCsvEmails(env.ADMIN_EMAILS),
  orgAdminEmails: parseCsvEmails(env.ORG_ADMIN_EMAILS),
  teamTierEmails: parseCsvEmails(env.TEAM_TIER_EMAILS),
  enterpriseTierEmails: parseCsvEmails(env.ENTERPRISE_TIER_EMAILS),
};

export function hasJobWorkerKey(): boolean {
  return Boolean(env.JOB_WORKER_KEY);
}

export function hasStripeConfig(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}
