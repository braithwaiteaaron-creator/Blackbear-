import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1BillingPortal } from "@/app/api/v1/billing/portal/route";

export async function POST() {
  const response = await postV1BillingPortal();
  return setDeprecationHeaders(response, "/api/v1/billing/portal");
}
