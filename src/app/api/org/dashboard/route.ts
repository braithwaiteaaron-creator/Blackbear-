import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1OrgDashboard } from "@/app/api/v1/org/dashboard/route";

export async function GET() {
  const response = await getV1OrgDashboard();
  return setDeprecationHeaders(response, "/api/v1/org/dashboard");
}
