import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { POST as postV1CertificationsIssue } from "@/app/api/v1/certifications/issue/route";

export async function POST() {
  const response = await postV1CertificationsIssue();
  return setDeprecationHeaders(response, "/api/v1/certifications/issue");
}
