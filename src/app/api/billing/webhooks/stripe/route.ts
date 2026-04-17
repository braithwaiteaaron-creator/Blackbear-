import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1StripeWebhook } from "@/app/api/v1/billing/webhooks/stripe/route";

export async function POST(request: Request) {
  const response = await postV1StripeWebhook(request);
  return setDeprecationHeaders(response, "/api/v1/billing/webhooks/stripe");
}
