import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { QUIZ_METADATA } from "@/lib/quiz-content";

export default function LandingPage() {
  return (
    <PageShell
      title="GitHub Mastery Ecosystem"
      description="The definitive GitHub proficiency assessment and learning ecosystem. Start free, earn your badge, and level up with confidence."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Assessment Snapshot</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            <li>Title: {QUIZ_METADATA.title}</li>
            <li>Estimated time: {QUIZ_METADATA.estimatedTime}</li>
            <li>Total questions: {QUIZ_METADATA.totalQuestions}</li>
            <li>Three tiers: Beginner, Intermediate, Advanced</li>
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Start Free</h2>
          <p className="mt-2 text-sm text-slate-700">
            Begin with the free Beginner tier and get immediate rationale feedback for every question.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/quiz"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start Quiz
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-400"
            >
              View Pricing
            </Link>
          </div>
        </article>
      </section>
    </PageShell>
  );
}
