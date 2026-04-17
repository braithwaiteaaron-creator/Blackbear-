import { PageShell } from "@/components/page-shell";

export default function OrganizationReportsPage() {
  return (
    <PageShell
      title="Organization Reports"
      description="Generate, review, and export capability gap reports aligned to team proficiency outcomes."
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Report generator</h2>
        <p className="mt-2 text-sm text-slate-700">
          Quarterly intelligence reports and benchmarking exports will be generated
          from aggregated quiz and response data, including top knowledge gaps.
        </p>
      </section>
    </PageShell>
  );
}
