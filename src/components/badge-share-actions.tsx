"use client";

import { useMemo, useState } from "react";

import { buildBadgeChannelShareUrl, buildBadgeShareTargetUrl } from "@/lib/badge-share";
import type { BadgeTier } from "@/lib/types";

type BadgeShareActionsProps = {
  badgeTier: BadgeTier;
  sessionId?: string | null;
  source: "results" | "dashboard";
};

export function BadgeShareActions({ badgeTier, sessionId, source }: BadgeShareActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const targetUrl = useMemo(
    () =>
      buildBadgeShareTargetUrl({
        badgeTier,
        sessionId,
        source,
      }),
    [badgeTier, sessionId, source]
  );

  async function handleCopyLink() {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyState("failed");
      return;
    }
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={buildBadgeChannelShareUrl("linkedin", { badgeTier, sessionId, source })}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Share on LinkedIn
      </a>
      <a
        href={buildBadgeChannelShareUrl("x", { badgeTier, sessionId, source })}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Share on X
      </a>
      <button
        type="button"
        onClick={handleCopyLink}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        {copyState === "copied" ? "Copied!" : "Copy referral link"}
      </button>
      {copyState === "failed" ? (
        <p className="w-full text-xs text-amber-700">
          Could not copy automatically. Use this URL: {targetUrl}
        </p>
      ) : null}
    </div>
  );
}
