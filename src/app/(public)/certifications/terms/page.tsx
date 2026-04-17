import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import {
  CERTIFICATION_TERMS_EFFECTIVE_DATE,
  CERTIFICATION_TERMS_VERSION,
} from "@/lib/certification-terms";

const termsSections = [
  {
    title: "1. Eligibility and account requirements",
    body: "Certification purchases require an authenticated account with accurate profile and payment information. You are responsible for maintaining account security and for all actions taken from your account.",
  },
  {
    title: "2. Assessment integrity and issuance criteria",
    body: "Certifications are issued only from platform-recorded quiz activity and completed certification purchases. We may deny or delay issuance when abuse controls detect suspicious behavior, tier mismatches, or missing assessment context.",
  },
  {
    title: "3. Pricing, payment, and renewals",
    body: "Certification purchases are one-time transactions for the selected tier. Renewal pricing and expiry windows may apply by program tier. Except where required by law, certification fees are non-refundable once payment is successfully processed.",
  },
  {
    title: "4. Credential usage, verification, and revocation",
    body: "Issued credentials remain the property of GitHub Mastery Ecosystem and are licensed to you for truthful professional use. Credentials may be revoked or reissued for fraud, policy violations, administrative correction, or security reasons.",
  },
  {
    title: "5. Data processing and audit trail",
    body: "To operate the certification program, we retain purchase, issuance, verification, and risk telemetry records (including IP address and user-agent metadata where available). This data supports fraud prevention, compliance, and operational audits.",
  },
  {
    title: "6. Program changes",
    body: "We may update certification content, scoring rules, provider integrations, and legal terms over time. Material updates are versioned, and new purchases require acceptance of the current terms version at checkout.",
  },
];

export default function CertificationTermsPage() {
  return (
    <PageShell
      title="Certification Program Terms"
      description="Legal terms governing certification purchases, issuance, verification, and credential lifecycle controls."
    >
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Terms version:</span>{" "}
          {CERTIFICATION_TERMS_VERSION}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Effective date:</span>{" "}
          {CERTIFICATION_TERMS_EFFECTIVE_DATE}
        </p>
        <p className="text-sm text-slate-700">
          By purchasing a certification, you agree to these terms and acknowledge that issuance
          and verification operations are subject to platform abuse controls and administrative
          review.
        </p>
        <div className="space-y-3">
          {termsSections.map((section) => (
            <article
              key={section.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-700">{section.body}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Questions about these terms can be routed through the admin support channel. For current
          certification options, visit{" "}
          <Link href="/certifications" className="font-semibold text-blue-700 hover:underline">
            Certification Programs
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
