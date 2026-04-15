import { InfoGrid } from "@/components/info-grid";
import { PageShell } from "@/components/page-shell";

const BADGES = [
  {
    title: "GitHub Expert",
    description:
      "Score 13-15 points. Demonstrates expert-level proficiency with enterprise-ready strategy and governance.",
  },
  {
    title: "Advanced Practitioner",
    description:
      "Score 9-12 points. Strong practical knowledge with targeted opportunities to deepen expertise.",
  },
  {
    title: "Developing Proficiency",
    description:
      "Score 5-8 points. Solid foundations and a guided path into intermediate and advanced capabilities.",
  },
  {
    title: "Foundation Builder",
    description:
      "Score 0-4 points. A clear starting point with curated learning resources and onboarding support.",
  },
];

export default function BadgesPage() {
  return (
    <PageShell
      title="Badge Showcase and Verification"
      description="Explore all badge tiers and how score ranges map to recognition."
    >
      <InfoGrid
        title="Badge Framework"
        subtitle="Badges map to total score across all 15 questions."
        items={BADGES}
      />
    </PageShell>
  );
}
