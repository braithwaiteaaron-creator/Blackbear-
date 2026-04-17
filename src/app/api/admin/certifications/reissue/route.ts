import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1AdminCertificationsReissue } from "@/app/api/v1/admin/certifications/reissue/route";

export async function POST(request: Request) {
  const response = await postV1AdminCertificationsReissue(request);
  return setDeprecationHeaders(response, "/api/v1/admin/certifications/reissue");
}
