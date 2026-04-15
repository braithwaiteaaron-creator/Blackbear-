import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1FinanceSummary } from "@/app/api/v1/billing/reports/finance/summary/route";

export async function GET(request: Request) {
  const response = await getV1FinanceSummary(request);
  return setDeprecationHeaders(response, "/api/v1/billing/reports/finance/summary");
}
