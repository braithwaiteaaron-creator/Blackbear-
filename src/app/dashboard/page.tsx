import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function DashboardPage() {
  return (
    <PageShell
      title="Personal Dashboard"
      description="Track quiz attempts, badge status, and personalized next-step recommendations."
    >
      <DashboardGrid
        title="Dashboard Snapshot"
        description="A scaffolded personal analytics area for authenticated learners."
        items={[
          {
            title: "Current proficiency tier",
            body:
              "Advanced Practitioner (sample view). Complete another attempt to refresh your projection.",
          },
          {
            title: "Latest score",
            body:
              "11/15 with strongest performance in Beginner and Intermediate workflows.",
          },
          {
            title: "Action item",
            body:
              "Focus this week on GitHub Environments and org-level governance controls.",
          },
        ]}
      />
    </PageShell>
  );
}
