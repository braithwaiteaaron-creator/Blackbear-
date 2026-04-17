import { DashboardGrid } from "@/components/dashboard-grid";
import { PageShell } from "@/components/page-shell";

const ASSESSMENT_OPERATIONS = [
  {
    title: "Participant targeting",
    body:
      "Segment by function, tenure, and role for benchmark-quality analysis.",
  },
  {
    title: "Completion tracking",
    body:
      "Monitor completion ratios and identify blocked participant cohorts.",
  },
  {
    title: "Assessment policy",
    body:
      "Apply integrity controls, retake windows, and compliance guardrails.",
  },
];

export default function OrganizationAssessmentsPage() {
  return (
    <PageShell
      title="Organization Assessments"
      description="Administer team diagnostics, participant enrollment, and score governance."
    >
      <DashboardGrid
        title="Assessment operations"
        description="Configure participant strategy, policy controls, and completion monitoring."
        items={ASSESSMENT_OPERATIONS}
      />
    </PageShell>
  );
}
