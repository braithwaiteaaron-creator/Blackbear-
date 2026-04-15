import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1FinanceExport } from "@/app/api/v1/billing/reports/finance/export/route";

export async function GET(request: Request) {
  const response = await getV1FinanceExport(request);
  return setDeprecationHeaders(response, "/api/v1/billing/reports/finance/export");
}
