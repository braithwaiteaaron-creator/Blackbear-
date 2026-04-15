import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function AdminOrganizationsPage() {
  const items = [
    {
      title: "Organization Directory",
      body: "112 enterprise tenants across active contracts.",
    },
    {
      title: "Seats Allocated",
      body: "7,420 licensed seats with 84% active utilization.",
    },
    {
      title: "Renewal Risk",
      body: "9 accounts flagged for proactive success intervention.",
    },
  ];

  return (
    <PageShell
      title="Admin • Organizations"
      description="Manage enterprise tenants, contract metadata, seat allocations, and support escalations."
    >
      <DashboardGrid
        title="Organization Portfolio"
        description="Tenant health and scale metrics."
        items={items}
      />
    </PageShell>
  );
}
