import { PageShell } from "@/components/page-shell";

import { OrgMembersControls } from "@/components/org-members-controls";

export default function OrgMembersPage() {
  return (
    <PageShell
      title="Organization members"
      description="Create your organization and provision members with seat-aware controls."
    >
      <OrgMembersControls />
    </PageShell>
  );
}
