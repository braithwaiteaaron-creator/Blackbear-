import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1BillingCheckout } from "@/app/api/v1/billing/checkout/route";

export async function POST(request: Request) {
  const response = await postV1BillingCheckout(request);
  return setDeprecationHeaders(response, "/api/v1/billing/checkout");
}
