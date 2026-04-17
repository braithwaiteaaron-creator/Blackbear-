import { PageShell } from "@/components/page-shell";
import { DashboardBadgeSharePanel } from "@/components/dashboard-badge-share-panel";

export default function DashboardBadgesPage() {
  return (
    <PageShell
      title="Dashboard — Badges"
      description="Track badge history, share links, and profile visibility controls."
    >
      <DashboardBadgeSharePanel />
    </PageShell>
  );
}
