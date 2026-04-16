import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1CertificationsIssue } from "@/app/api/v1/certifications/issue/route";

export async function POST(request: Request) {
  const response = await postV1CertificationsIssue(request);
  return setDeprecationHeaders(response, "/api/v1/certifications/issue");
}
