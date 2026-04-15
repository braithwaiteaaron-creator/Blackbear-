import { InfoGrid } from "@/components/info-grid";
import { PageShell } from "@/components/page-shell";

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
    </PageShell>
  );
}
