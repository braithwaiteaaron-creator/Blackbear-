"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useQuizStore } from "@/lib/store";
import { getBadgeAward, getTierFeedback } from "@/lib/scoring";
import { detectDeviceType } from "@/lib/device";
import { buildQuizSessionPayload, persistQuizSession } from "@/lib/quiz-persistence";
import type { PersistQuizSessionResult } from "@/lib/types";

export function ResultsSummary() {
  const responses = useQuizStore((state) => state.getAllResponses());
  const startedAt = useQuizStore((state) => state.startedAt);
  const breakdown = useQuizStore((state) => state.getScoreBreakdown());
  const reset = useQuizStore((state) => state.resetQuiz);
  const badge = getBadgeAward(breakdown.total);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [persistedResult, setPersistedResult] =
    useState<PersistQuizSessionResult | null>(null);
  useEffect(() => {
    if (!responses.length || saveState === "saved" || saveState === "saving") {
      return;
    }

    const payload = buildQuizSessionPayload({
      responses,
      breakdown,
      startedAt,
      completedAt: Date.now(),
      deviceType: detectDeviceType(),
      trafficSource: "direct",
    });

    const persist = async () => {
      setSaveState("saving");
      const data = (await persistQuizSession(payload)) as PersistQuizSessionResult;
      setPersistedResult(data);
      setSaveState("saved");
    };

    void persist();
  }, [responses, breakdown, startedAt, saveState]);

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Assessment Result
        </p>
        <h2 className="text-3xl font-bold text-slate-900">{breakdown.total}/15</h2>
        <p className="text-slate-600">{badge.description}</p>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-3">
        {(["beginner", "intermediate", "advanced"] as const).map((tier) => {
          const value = breakdown[tier];
          const feedback = getTierFeedback(tier, value);
          return (
            <article key={tier} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{tier}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{value}/5</p>
              <p className="mt-2 text-sm text-slate-600">{feedback}</p>
            </article>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-900 p-5 text-slate-100">
        <p className="text-sm uppercase tracking-wide text-blue-200">Badge Awarded</p>
        <p className="mt-1 text-2xl font-semibold">{badge.label}</p>
        <p className="mt-2 text-sm text-slate-300">
          Share on LinkedIn, X, or copy your public badge link.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {saveState === "saving" ? "Saving your assessment..." : null}
          {saveState === "saved" && persistedResult
            ? `Saved as session ${persistedResult.sessionId.slice(0, 8)}.`
            : null}
          {saveState === "error"
            ? "Could not save this attempt. You can still review your score."
            : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          View premium options
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Reset quiz state
        </button>
      </div>
    </section>
  );
}
