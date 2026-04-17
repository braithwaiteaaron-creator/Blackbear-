import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

export default function AdminContentPage() {
  return (
    <PageShell
      title="Admin — Content"
      description="Manage quiz banks, rationale updates, and scheduled content quality reviews."
    >
      <DashboardGrid
        title="Content operations"
        description="Editorial workflows for question quality, rationale consistency, and quarterly updates."
        items={[
          {
            title: "Question bank management",
            body:
              "Track versioned edits across beginner, intermediate, and advanced tiers.",
          },
          {
            title: "Rationale quality checks",
            body:
              "Review clarity, factual consistency, and readability before publishing.",
          },
          {
            title: "Release workflow",
            body:
              "Stage and promote approved content changes through admin governance controls.",
          },
        ]}
      />
    </PageShell>
  );
}
