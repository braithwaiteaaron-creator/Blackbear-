import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function DashboardBadgesPage() {
  const items = [
    {
      title: "Current badge",
      body: "Displays the highest active proficiency badge and issue date.",
    },
    {
      title: "Share toolkit",
      body: "One-click actions for LinkedIn, X, and direct verification links.",
    },
    {
      title: "Badge analytics",
      body: "Tracks share volume and profile referral engagement.",
    },
  ];

  return (
    <PageShell
      title="Dashboard — Badges"
      description="Track badge history, share links, and profile visibility controls."
    >
      <DashboardGrid
        title="Badge collection"
        description="One-click sharing and verification tracking for badge engagement."
        items={items}
      />
    </PageShell>
  );
}
