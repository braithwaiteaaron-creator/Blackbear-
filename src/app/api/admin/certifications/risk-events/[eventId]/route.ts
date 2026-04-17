import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { PATCH as patchV1AdminCertificationRiskEventById } from "@/app/api/v1/admin/certifications/risk-events/[eventId]/route";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const response = await patchV1AdminCertificationRiskEventById(request, context);
  return setDeprecationHeaders(response, "/api/v1/admin/certifications/risk-events/{eventId}");
}
