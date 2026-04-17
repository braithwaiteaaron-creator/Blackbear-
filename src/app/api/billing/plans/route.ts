import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1BillingPlans } from "@/app/api/v1/billing/plans/route";

export async function GET() {
  const response = await getV1BillingPlans();
  return setDeprecationHeaders(response, "/api/v1/billing/plans");
}
