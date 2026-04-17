import type { ReactNode } from "react";

import { requireAdminAccess } from "@/lib/route-guards";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdminAccess();

  return <>{children}</>;
}
