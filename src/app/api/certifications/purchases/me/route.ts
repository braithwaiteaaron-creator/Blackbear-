import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1CertPurchasesMe } from "@/app/api/v1/certifications/purchases/me/route";

export async function GET() {
  const response = await getV1CertPurchasesMe();
  return setDeprecationHeaders(response, "/api/v1/certifications/purchases/me");
}
