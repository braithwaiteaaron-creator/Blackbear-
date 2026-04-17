import { PageShell } from "@/components/page-shell";
import { InfoGrid } from "@/components/info-grid";
import Link from "next/link";
import {
  CERTIFICATION_TERMS_PATH,
  CERTIFICATION_TERMS_VERSION,
} from "@/lib/certification-terms";

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
      description="Monetize verified proficiency with stack-ranked certification tiers and generated PDF credentials."
    >
      <InfoGrid
        title="Certification Catalog"
        subtitle="Tiered credentials designed for individual and team monetization."
        items={certificationOffers}
      />
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Certificate generation pipeline</h2>
        <p className="mt-2 text-sm text-slate-700">
          Signed-in learners can issue downloadable PDF certifications from their latest quiz
          score in the dashboard.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Checkout uses Stripe one-time payments per certification tier.</li>
          <li>Eligibility derives from your most recent persisted quiz session.</li>
          <li>Issuance is gated by completed certification purchases for the derived tier.</li>
          <li>
            Checkout requires acceptance of certification terms version{" "}
            {CERTIFICATION_TERMS_VERSION} (see{" "}
            <Link
              href={CERTIFICATION_TERMS_PATH}
              className="font-semibold text-blue-700 hover:underline"
            >
              certification terms
            </Link>
            ).
          </li>
          <li>Issued certificates include tier, score, dates, and a verification code.</li>
          <li>Generated PDFs are stored under a stable certificate URL for download.</li>
        </ul>
      </section>
    </PageShell>
  );
}
