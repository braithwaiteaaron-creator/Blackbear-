import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";
import { CertificationsPanel } from "@/components/certifications-panel";

export default function DashboardCertificationsPage() {
  return (
    <PageShell
      title="Dashboard — Certifications"
      description="Issue, track, and download your generated certification credentials."
    >
      <DashboardGrid
        title="Certification status"
        description="Program tiers and operational readiness for issued credentials."
        items={[
          {
            title: "Foundation Certification",
            body: "$29 one-time with annual renewal options.",
          },
          {
            title: "Professional Certification",
            body: "Verified practitioner designation with enhanced trust signals.",
          },
          {
            title: "Expert Certification",
            body: "Directory listing and enterprise consultation invitation readiness.",
          },
        ]}
      />
      <div className="mt-6">
        <CertificationsPanel />
      </div>
    </PageShell>
  );
}
