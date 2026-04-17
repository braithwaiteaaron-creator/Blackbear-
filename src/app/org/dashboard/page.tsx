import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function OrgDashboardPage() {
  const teamSnapshot = [
    { title: "Total participants", body: "142" },
    { title: "Average score", body: "9.8 / 15" },
    { title: "Top gap", body: "Advanced security controls" },
    { title: "Subscription", body: "Enterprise" },
  ];

  return (
    <PageShell
      title="Organization Dashboard"
      description="Aggregate team proficiency and capability tracking for engineering leadership."
    >
      <DashboardGrid
        title="Team proficiency snapshot"
        description="Current aggregate distribution and top capability gaps."
        items={teamSnapshot}
      />
    </PageShell>
  );
}
