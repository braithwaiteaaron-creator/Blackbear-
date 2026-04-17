import { PageShell } from "@/components/page-shell";

export default function CommunityPage() {
  return (
    <PageShell
      title="Community Hub"
      description="Connect with practitioners, share playbooks, and accelerate team capability."
    >
      <ul className="grid gap-3 md:grid-cols-2">
        <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          Weekly office hours with GitHub experts.
        </li>
        <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          Score-tier channels for focused peer learning.
        </li>
        <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          Repository teardown sessions and feedback swaps.
        </li>
        <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          Team challenges and badge-sharing campaigns.
        </li>
      </ul>
    </PageShell>
  );
}
