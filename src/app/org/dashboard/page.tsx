import { PageShell } from "@/components/page-shell";
import { OrgDashboardPanel } from "@/components/org-dashboard-panel";

export default function OrgDashboardPage() {
  return (
    <PageShell
      title="Organization Dashboard"
      description="Aggregate team proficiency and capability tracking for engineering leadership."
    >
      <OrgDashboardPanel />
    </PageShell>
  );
}
