import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { GET as getV1CertVerify } from "@/app/api/v1/certifications/verify/[verificationCode]/route";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ verificationCode: string }>;
  }
) {
  const response = await getV1CertVerify(request, context);
  return setDeprecationHeaders(response, "/api/v1/certifications/verify/{verificationCode}");
}
