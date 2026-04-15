import { PageShell } from "@/components/page-shell";
import { InfoGrid } from "@/components/info-grid";

const certificationOffers = [
  {
    title: "Foundation Certification",
    description:
      "$29 one-time, $19 annual renewal. Includes digital badge, LinkedIn credential, and PDF certificate.",
  },
  {
    title: "Professional Certification",
    description:
      "$79 one-time, $49 annual renewal. Includes practitioner designation and expanded proof-of-skill assets.",
  },
  {
    title: "Expert Certification",
    description:
      "$149 one-time, $99 annual renewal. Includes expert directory listing and enterprise consultation badge.",
  },
  {
    title: "Enterprise Team Bundle",
    description:
      "$999 up to 10 team members, $89/additional seat. Includes team certification report and recognition assets.",
  },
];

export default function CertificationsPage() {
  return (
    <PageShell
      title="Certification Programs"
      description="Monetize verified proficiency with stack-ranked certification tiers."
    >
      <InfoGrid
        title="Certification Catalog"
        subtitle="Tiered credentials designed for individual and team monetization."
        items={certificationOffers}
      />
    </PageShell>
  );
}
