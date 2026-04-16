import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1CertificationsCheckout } from "@/app/api/v1/certifications/checkout/route";

export async function POST(request: Request) {
  const response = await postV1CertificationsCheckout(request);
  return setDeprecationHeaders(response, "/api/v1/certifications/checkout");
}
