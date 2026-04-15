import { PageShell } from "@/components/page-shell";

const TOPICS = [
  {
    slug: "branching-strategy",
    title: "Branching strategy that scales with team size",
    summary:
      "Learn how trunk-based flow and feature branches balance speed, quality, and stability.",
  },
  {
    slug: "pull-request-quality",
    title: "Pull request quality checklist",
    summary:
      "A practical review rubric for faster reviews and fewer regressions.",
  },
  {
    slug: "actions-foundations",
    title: "GitHub Actions foundations",
    summary:
      "Build reliable CI pipelines with clear jobs, caching, and deployment gates.",
  },
  {
    slug: "security-scanning",
    title: "Shift-left repository security",
    summary:
      "Use Dependabot, code scanning, and secret scanning to reduce risk early.",
  },
];

export default function LearnLibraryPage() {
  return (
    <PageShell
      title="Free learning library"
      description="Structured GitHub guides mapped to quiz skill gaps."
    >
      <div className="grid gap-4">
        {TOPICS.map((topic) => (
          <a
            className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-500 hover:shadow-sm"
            href={`/learn/${topic.slug}`}
            key={topic.slug}
          >
            <h2 className="text-xl font-semibold text-slate-900">{topic.title}</h2>
            <p className="mt-2 text-slate-600">{topic.summary}</p>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
