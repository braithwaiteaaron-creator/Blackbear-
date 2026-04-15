import { DashboardGrid } from "@/components/dashboard-grid";

const cards = [
  {
    title: "Member directory",
    body: "Searchable roster with role, proficiency tier, and certification status for each member.",
  },
  {
    title: "Invitations",
    body: "Invite developers by email, assign team roles, and track pending invitation states.",
  },
  {
    title: "Access governance",
    body: "Manage least-privilege access to organization reports and benchmark dashboards.",
  },
];

export default function OrgMembersPage() {
  return (
    <DashboardGrid
      title="Organization members"
      description="Manage team membership, invitations, and role-based access."
      items={cards}
    />
  );
}
