"use client";

import { useMemo, useState } from "react";

import { BadgeShareActions } from "@/components/badge-share-actions";
import { SavedSessionsList } from "@/components/saved-sessions-list";
import type { BadgeTier, PersistedQuizSessionSummary } from "@/lib/types";

export function DashboardBadgeSharePanel() {
  const [latestSession, setLatestSession] = useState<PersistedQuizSessionSummary | null>(null);

  const badgeTier = useMemo<BadgeTier>(() => {
    if (!latestSession) {
      return "foundation" as const;
    }
    return latestSession.badge;
  }, [latestSession]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Share toolkit</h2>
        <p className="mt-1 text-sm text-slate-600">
          Share your latest badge with attribution links for referral-aware growth tracking.
        </p>
      </header>

      <BadgeShareActions
        badgeTier={badgeTier}
        sessionId={latestSession?.id ?? null}
        source="dashboard"
      />

      <SavedSessionsList
        onLoaded={(sessions) => setLatestSession(sessions[0] ?? null)}
        fallbackItems={[
          {
            title: "No session yet",
            body:
              "Complete a quiz attempt to unlock personalized share links with badge and session attribution.",
          },
        ]}
      />
    </section>
  );
}
