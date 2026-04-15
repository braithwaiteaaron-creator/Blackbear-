import { PageShell } from "@/components/page-shell";
import { getFinanceSummary } from "@/lib/billing/reports";

export const dynamic = "force-dynamic";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminReportsPage() {
  const summary = await getFinanceSummary();
  const annualRunRate = summary.recurringRevenue.annualRunRateCents;
  const monthlyRevenue = summary.recurringRevenue.monthlyCents;

  return (
    <PageShell
      title="Admin - Reports"
      description="Finance reporting for subscription health, recurring revenue trends, and CSV exports."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Active subscriptions
          </h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.subscriptions.active}</p>
          <p className="mt-1 text-sm text-slate-600">
            {summary.subscriptions.trialing} trialing, {summary.subscriptions.pastDue} past due
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Monthly recurring revenue
          </h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatUsd(monthlyRevenue)}</p>
          <p className="mt-1 text-sm text-slate-600">Estimated from active + past due subscriptions</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Annual run rate
          </h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatUsd(annualRunRate)}</p>
          <p className="mt-1 text-sm text-slate-600">MRR multiplied by 12 (USD)</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Active customers
          </h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.customers.active}</p>
          <p className="mt-1 text-sm text-slate-600">{summary.customers.total} total customers</p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Finance exports</h2>
        <p className="mt-2 text-sm text-slate-700">
          Download normalized subscription-level exports for finance and data intelligence workflows.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/api/v1/billing/reports/finance/export?preset=all"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Export all subscriptions (CSV)
          </a>
          <a
            href="/api/v1/billing/reports/finance/export?preset=last_30_days"
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Export last 30 days (CSV)
          </a>
          <a
            href="/api/v1/billing/reports/finance/export?preset=quarter_to_date"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Export quarter-to-date (CSV)
          </a>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Plan mix</h2>
        <p className="mt-2 text-xs text-slate-500">
          Snapshot generated at {new Date(summary.generatedAt).toLocaleString()}
        </p>
        {summary.planBreakdown.length === 0 ? (
          <p className="mt-3 text-sm text-slate-700">
            No billing subscriptions available for the selected reporting window.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Plan</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700">Subscriptions</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700">Active</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700">Estimated MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {summary.planBreakdown.map((item) => (
                  <tr key={item.planId}>
                    <td className="px-3 py-2 capitalize text-slate-800">{item.planId}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{item.subscriptions}</td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {item.activeSubscriptions}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {formatUsd(item.monthlyRevenueCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
