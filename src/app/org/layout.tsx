import type { ReactNode } from "react";
import { requireOrganizationAccess } from "@/lib/route-guards";

type OrgLayoutProps = {
  children: ReactNode;
};

export default async function OrgLayout({ children }: OrgLayoutProps) {
  await requireOrganizationAccess();
  return <>{children}</>;
}
