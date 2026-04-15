import { PageShell } from "@/components/page-shell";

export default function AdminReportsPage() {
  return (
    <PageShell
      title="Admin - Reports"
      description="Generate and export data intelligence products, quarterly trend reports, and custom segmentation outputs."
    >
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Intelligence report tooling
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Quarterly proficiency trend report builder.</li>
          <li>Benchmarking API usage and export summary.</li>
          <li>Custom audience segmentation report requests.</li>
        </ul>
      </section>
    </PageShell>
  );
}
