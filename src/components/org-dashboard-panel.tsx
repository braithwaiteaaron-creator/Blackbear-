"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrgDashboardResponse = {
  ok: boolean;
  data?: {
    organization: {
      id: string;
      name: string;
      domain: string;
      subscriptionType: "team" | "enterprise";
      seatCount: number;
      createdAt: string;
    };
    seatUsage: {
      used: number;
      capacity: number;
      remaining: number;
      utilizationPercent: number;
    };
    members: {
      total: number;
      active: number;
      invited: number;
      suspended: number;
      admins: number;
    };
    assessments: {
      totalAssessments: number;
      latestGeneratedAt: string | null;
      latestReportUrl: string | null;
      currentAverages: {
        overall: number | null;
        beginner: number | null;
        intermediate: number | null;
        advanced: number | null;
      };
      topKnowledgeGaps: string[];
    };
  };
  error?: {
    message?: string;
  };
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

function formatScore(value: number | null): string {
  if (value === null) {
    return "No data";
  }
  return `${value.toFixed(2)} / 15`;
}

export function OrgDashboardPanel() {
  const [payload, setPayload] = useState<OrgDashboardResponse["data"] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setState("loading");
    try {
      const response = await fetch("/api/org/dashboard", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const data = (await response.json()) as OrgDashboardResponse;
      if (!response.ok || !data.ok || !data.data) {
        throw new Error(data.error?.message ?? "Unable to load organization dashboard.");
      }
      setPayload(data.data);
      setMessage(null);
      setState("ready");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error while loading dashboard data.";
      setMessage(errorMessage);
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const seatBarWidth = useMemo(() => {
    if (!payload?.seatUsage) {
      return "0%";
    }
    const clamped = Math.max(0, Math.min(100, payload.seatUsage.utilizationPercent));
    return `${clamped.toFixed(1)}%`;
  }, [payload?.seatUsage]);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Live organization metrics</h2>
          <p className="mt-1 text-sm text-slate-600">
            Real-time membership and assessment snapshot for your team.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Refresh
        </button>
      </header>

      {message ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      {state === "loading" ? (
        <p className="text-sm text-slate-700">Loading organization dashboard...</p>
      ) : null}

      {state === "error" ? (
        <p className="text-sm text-amber-800">
          Unable to load current metrics. Confirm your organization setup and retry.
        </p>
      ) : null}

      {state === "ready" && payload ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-900">{payload.organization.name}</h3>
            <p className="mt-1 text-sm text-slate-700">
              {payload.organization.domain} • {payload.organization.subscriptionType.toUpperCase()} •
              Created {formatDate(payload.organization.createdAt)}
            </p>
          </section>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Seat utilization
              </h4>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatPercent(payload.seatUsage.utilizationPercent)}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {payload.seatUsage.used}/{payload.seatUsage.capacity} used
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: seatBarWidth }}
                  role="progressbar"
                  aria-valuenow={payload.seatUsage.utilizationPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Active members
              </h4>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {payload.members.active}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {payload.members.admins} admins •{" "}
                {Math.max(payload.members.total - payload.members.admins, 0)} members
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Pending invites
              </h4>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {payload.members.invited}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {payload.seatUsage.remaining} seats remaining
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Latest avg score
              </h4>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatScore(payload.assessments.currentAverages.overall)}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {payload.assessments.totalAssessments > 0
                  ? `${payload.assessments.totalAssessments} report snapshots`
                  : "Run an organization assessment to populate metrics."}
              </p>
            </article>
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-base font-semibold text-slate-900">Latest assessment breakdown</h4>
              {payload.assessments.latestGeneratedAt ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>Generated: {formatDate(payload.assessments.latestGeneratedAt)}</li>
                  <li>Beginner avg: {formatScore(payload.assessments.currentAverages.beginner)}</li>
                  <li>
                    Intermediate avg: {formatScore(payload.assessments.currentAverages.intermediate)}
                  </li>
                  <li>Advanced avg: {formatScore(payload.assessments.currentAverages.advanced)}</li>
                  <li>
                    Top gaps:{" "}
                    {payload.assessments.topKnowledgeGaps.length > 0
                      ? payload.assessments.topKnowledgeGaps.join(", ")
                      : "None tagged"}
                  </li>
                  <li>
                    Report URL:{" "}
                    {payload.assessments.latestReportUrl ? (
                      <a
                        href={payload.assessments.latestReportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        Open latest report
                      </a>
                    ) : (
                      "Not available"
                    )}
                  </li>
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-700">
                  No assessment records yet. Reports and trend visualization will populate here.
                </p>
              )}
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-base font-semibold text-slate-900">Membership status mix</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">Total members: {payload.members.total}</p>
                </li>
                <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">Active: {payload.members.active}</p>
                </li>
                <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">Invited: {payload.members.invited}</p>
                </li>
                <li className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">Suspended: {payload.members.suspended}</p>
                </li>
              </ul>
            </article>
          </section>
        </>
      ) : null}
    </section>
  );
}
