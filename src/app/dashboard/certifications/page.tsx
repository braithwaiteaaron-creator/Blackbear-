import { DashboardGrid } from "@/components/dashboard-grid";

export default function DashboardCertificationsPage() {
  return (
    <DashboardGrid
      title="Certification Status"
      description="Track active certifications, renewal windows, and downloadable credentials."
      items={[
        {
          title: "Foundation Certification",
          body: "$29 one-time with annual renewal options.",
        },
        {
          title: "Professional Certification",
          body: "Verified practitioner designation with enhanced trust signals.",
        },
        {
          title: "Expert Certification",
          body: "Directory listing and enterprise consultation invitation readiness.",
        },
      ]}
    />
  );
}
