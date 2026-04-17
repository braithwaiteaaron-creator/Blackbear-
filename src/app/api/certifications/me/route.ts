import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1CertificationsMe, POST as postV1CertificationsMe } from "@/app/api/v1/certifications/me/route";

export async function GET() {
  const response = await getV1CertificationsMe();
  return setDeprecationHeaders(response, "/api/v1/certifications/me");
}

export async function POST() {
  const response = await postV1CertificationsMe(new Request("http://localhost/api/certifications/me"));
  return setDeprecationHeaders(response, "/api/v1/certifications/me");
}
