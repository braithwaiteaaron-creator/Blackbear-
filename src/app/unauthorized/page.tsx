import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export default function UnauthorizedPage() {
  return (
    <PageShell
      title="Access Restricted"
      description="Your account is signed in, but does not currently have permission to view this area."
    >
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">Permission required</h2>
        <p className="mt-2 text-sm text-amber-900">
          If you believe this is incorrect, contact your administrator to request the
          correct role or subscription tier.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Return home
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            View plans
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
