import Link from "next/link";

import { PageShell } from "@/components/page-shell";

type TopicPageProps = {
  params: Promise<{
    "topic-slug": string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const resolvedParams = await params;
  const topicSlug = resolvedParams["topic-slug"];
  const topicName = topicSlug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

  return (
    <PageShell
      title={topicName}
      description="Detailed topic page generated from the platform content routing structure."
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-slate-700">
          This topic route is ready for long-form educational modules, embedded code examples, and downloadable resources.
        </p>
      </div>
      <Link href="/learn" className="inline-flex text-sm font-semibold text-blue-600">
        Back to learn library
      </Link>
    </PageShell>
  );
}
