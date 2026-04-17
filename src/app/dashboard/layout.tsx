import type { ReactNode } from "react";
import { requireDashboardAccess } from "@/lib/route-guards";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  await requireDashboardAccess();
  return <>{children}</>;
}
