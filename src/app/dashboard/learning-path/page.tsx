import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function DashboardLearningPathPage() {
  return (
    <PageShell
      title="Personalized Learning Path"
      description="Recommendations generated from quiz misses, confidence profile, and role trajectory."
    >
      <DashboardGrid
        title="Recommended next modules"
        description="Model-generated sequence of content tailored to each user profile."
        items={[
          {
            title: "Branch strategy and rebase confidence",
            body: "Focuses on linear history hygiene and conflict management drills.",
          },
          {
            title: "Actions automation fundamentals",
            body: "Progressive workflow design from simple CI checks to multi-environment deployments.",
          },
          {
            title: "GitHub advanced security",
            body: "Dependabot, code scanning, and secret scanning implementation patterns.",
          },
        ]}
      />
    </PageShell>
  );
}
