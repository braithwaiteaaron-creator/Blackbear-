import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";
import { SavedSessionsList } from "@/components/saved-sessions-list";

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
      <div className="mt-6">
        <SavedSessionsList />
      </div>
    </PageShell>
  );
}
