import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { QUIZ_METADATA } from "@/lib/quiz-content";

const TIERS = [
  {
    title: "Beginner",
    href: "/quiz/beginner",
    summary: "5 foundational questions. Free and immediately available.",
  },
  {
    title: "Intermediate",
    href: "/quiz/intermediate",
    summary:
      "5 workflow and automation questions. Intended for authenticated users.",
  },
  {
    title: "Advanced",
    href: "/quiz/advanced",
    summary:
      "5 enterprise-grade security and integration scenarios for expert proficiency.",
  },
];

export default function QuizIndexPage() {
  return (
    <PageShell
      title={QUIZ_METADATA.title}
      description={`Estimated time: ${QUIZ_METADATA.estimatedTime}`}
    >
      <div className="space-y-4">
        {TIERS.map((tier) => (
          <article
            key={tier.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">{tier.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{tier.summary}</p>
            <Link
              className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              href={tier.href}
            >
              Start {tier.title} Tier
            </Link>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
