import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";
import { AdminCertificationControls } from "@/components/admin-certification-controls";

const USER_CARDS = [
  {
    title: "Support tools",
    body: "User profile lookup, score audit, and account recovery actions.",
  },
  {
    title: "Segment filters",
    body: "Filter by subscription, score tier, and organization affiliation.",
  },
  {
    title: "Compliance controls",
    body: "Retention and deletion workflows aligned to enterprise requirements.",
  },
];

export default function AdminUsersPage() {
  return (
    <PageShell
      title="Admin — Users"
      description="Operational controls for customer support, segmentation, and account lifecycle management."
    >
      <DashboardGrid
        title="User operations"
        description="Admin tooling for lifecycle management and support workflows."
        items={USER_CARDS}
      />
      <div className="mt-6">
        <AdminCertificationControls />
      </div>
    </PageShell>
  );
}
