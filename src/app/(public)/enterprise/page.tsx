import { InfoGrid } from "@/components/info-grid";
import { PageShell } from "@/components/page-shell";
import Link from "next/link";

export default function EnterprisePage() {
  return (
    <PageShell
      title="Enterprise GitHub capability diagnostics"
      description="Aggregate team proficiency, identify gaps, and accelerate delivery outcomes."
    >
      <InfoGrid
        title="Enterprise capabilities"
        subtitle="Diagnostics, governance, and reporting for scaled engineering organizations."
        items={[
          {
            title: "Org-level insights",
            description:
              "Track beginner/intermediate/advanced averages and prioritize top knowledge gaps.",
          },
          {
            title: "Governance controls",
            description:
              "Support SSO, environment approvals, and protected branch policy recommendations.",
          },
          {
            title: "Quarterly reporting",
            description:
              "Generate capability trend reports and export stakeholder-ready performance summaries.",
          },
        ]}
      />
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Identity and access roadmap</h2>
        <p className="mt-2 text-sm text-slate-700">
          Enterprise SSO onboarding is planned using SAML 2.0 with IdP-initiated and SP-initiated
          login support, attribute mapping controls, and audited certificate rotation.
        </p>
        <p className="mt-2 text-sm text-slate-700">
          The implementation blueprint is published in{" "}
          <Link
            href="/docs/sso-saml-implementation-plan.md"
            className="font-semibold text-blue-700 hover:underline"
          >
            docs/sso-saml-implementation-plan.md
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
