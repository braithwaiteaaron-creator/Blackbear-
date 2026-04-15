import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function DashboardResultsPage() {
  return (
    <PageShell
      title="Historical Results"
      description="Track score trends, retake attempts, and benchmark improvements over time."
    >
      <DashboardGrid
        items={[
          {
            title: "Attempt history",
            body: "Timeline view of every completed assessment attempt and score.",
          },
          {
            title: "Tier deltas",
            body: "Compare beginner/intermediate/advanced performance between attempts.",
          },
          {
            title: "Retake eligibility",
            body: "24-hour cooldown tracking to maintain assessment integrity.",
          },
        ]}
      />
    </PageShell>
  );
}
