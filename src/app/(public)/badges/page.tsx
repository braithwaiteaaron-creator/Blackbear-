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
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Credential verification endpoint</h2>
        <p className="mt-2 text-sm text-slate-700">
          Issued certifications expose public credential metadata at:
        </p>
        <code className="mt-3 block rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100">
          /api/v1/certifications/verify/&lt;verificationCode&gt;
        </code>
        <p className="mt-3 text-sm text-slate-700">
          This endpoint returns issuer, tier, status, issued/expiry dates, and certificate artifact
          URL for independent verification workflows.
        </p>
      </section>
    </PageShell>
  );
}
