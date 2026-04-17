import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import {
  GET as getV1AdminCertificationRiskEvents,
} from "@/app/api/v1/admin/certifications/risk-events/route";

export async function GET(request: Request) {
  const response = await getV1AdminCertificationRiskEvents(request);
  return setDeprecationHeaders(response, "/api/v1/admin/certifications/risk-events");
}
