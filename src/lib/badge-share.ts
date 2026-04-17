import type { BadgeTier } from "@/lib/types";

type ShareContext = "results" | "dashboard";
type ShareChannel = "linkedin" | "x" | "copy";

type BadgeShareInput = {
  badgeTier: BadgeTier;
  sessionId?: string | null;
  source: ShareContext;
};

function trimToToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
}

function makeReferralCode(input: BadgeShareInput): string {
  const badge = trimToToken(input.badgeTier);
  const source = trimToToken(input.source);
  const session = trimToToken(input.sessionId ?? "anon");
  return `badge-${badge}-${source}-${session}`;
}

function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export function buildBadgeShareTargetUrl(input: BadgeShareInput): string {
  const url = new URL("/badges", getBaseUrl());
  url.searchParams.set("badge", input.badgeTier);
  url.searchParams.set("utm_source", "badge_share");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "badge_attribution");
  url.searchParams.set("utm_content", input.source);
  url.searchParams.set("ref", makeReferralCode(input));
  if (input.sessionId) {
    url.searchParams.set("session", trimToToken(input.sessionId));
  }
  return url.toString();
}

export function buildBadgeShareMessage(input: BadgeShareInput): string {
  const label =
    input.badgeTier === "expert"
      ? "GitHub Expert"
      : input.badgeTier === "advanced"
        ? "Advanced Practitioner"
        : input.badgeTier === "developing"
          ? "Developing Proficiency"
          : "Foundation Builder";
  return `I just earned the ${label} badge on GitHub Mastery Ecosystem. Validate my credential and try the assessment:`;
}

export function buildBadgeChannelShareUrl(
  channel: Exclude<ShareChannel, "copy">,
  input: BadgeShareInput
): string {
  const target = buildBadgeShareTargetUrl(input);
  const message = buildBadgeShareMessage(input);
  if (channel === "linkedin") {
    const url = new URL("https://www.linkedin.com/sharing/share-offsite/");
    url.searchParams.set("url", target);
    return url.toString();
  }
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", `${message} ${target}`);
  return url.toString();
}
