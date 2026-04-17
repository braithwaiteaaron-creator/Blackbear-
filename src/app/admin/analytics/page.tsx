import { PageShell } from "@/components/page-shell";
import { DashboardGrid } from "@/components/dashboard-grid";

export default function AdminAnalyticsPage() {
  return (
    <PageShell
      title="Admin Analytics"
      description="Platform-wide KPI dashboard aligned to weekly, monthly, and quarterly tracking."
    >
      <DashboardGrid
        title="KPI Cadence"
        description="Operational analytics scoped by review cadence."
        items={[
          {
            title: "Weekly KPIs",
            body:
              "Quiz start rate, tier completion rate, badge share rate, and nurture open rates.",
          },
          {
            title: "Monthly KPIs",
            body:
              "MRR, CAC by channel, ARPU, certification conversion, and enterprise pipeline value.",
          },
          {
            title: "Quarterly KPIs",
            body:
              "ARR trajectory, renewal rates, sponsorship revenue, data product revenue, and market position.",
          },
        ]}
      />
    </PageShell>
  );
}
