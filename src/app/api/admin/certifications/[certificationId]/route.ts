import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { PATCH as patchV1AdminCertificationById } from "@/app/api/v1/admin/certifications/[certificationId]/route";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ certificationId: string }> }
) {
  const response = await patchV1AdminCertificationById(request, context);
  return setDeprecationHeaders(response, "/api/v1/admin/certifications/{certificationId}");
}
