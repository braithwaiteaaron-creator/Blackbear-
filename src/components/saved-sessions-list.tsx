"use client";

import { useEffect, useState } from "react";
import type { PersistedQuizSession } from "@/lib/types";

type SavedSessionsListProps = {
  fallbackItems?: Array<{ title: string; body: string }>;
};

export function SavedSessionsList({ fallbackItems = [] }: SavedSessionsListProps) {
  const [sessions, setSessions] = useState<PersistedQuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await fetch("/api/quiz-sessions/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load quiz sessions.");
        }

        const payload = (await response.json()) as { sessions: PersistedQuizSession[] };

        if (!ignore) {
          setSessions(payload.sessions ?? []);
          setError(null);
        }
      } catch (unknownError) {
        if (!ignore) {
          const message =
            unknownError instanceof Error
              ? unknownError.message
              : "Unexpected error while loading sessions.";
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        Loading saved attempts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {error}
        </div>
        {fallbackItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fallbackItems.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{item.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        No saved quiz attempts yet. Complete the quiz and your results will appear here.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sessions.map((session) => (
        <article
          key={session.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-base font-semibold text-slate-900">
            {session.totalScore}/15
          </h3>
          <p className="mt-2 text-sm text-slate-700">
            Beginner: {session.beginnerScore}/5 • Intermediate: {session.intermediateScore}
            /5 • Advanced: {session.advancedScore}/5
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Completed {new Date(session.completedAt).toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
}
