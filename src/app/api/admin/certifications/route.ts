import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import {
  GET as getV1AdminCertifications,
  POST as postV1AdminCertifications,
} from "@/app/api/v1/admin/certifications/route";

export async function GET(request: Request) {
  const response = await getV1AdminCertifications(request);
  return setDeprecationHeaders(response, "/api/v1/admin/certifications");
}

export async function POST(request: Request) {
  const response = await postV1AdminCertifications(request);
  return setDeprecationHeaders(response, "/api/v1/admin/certifications");
}
