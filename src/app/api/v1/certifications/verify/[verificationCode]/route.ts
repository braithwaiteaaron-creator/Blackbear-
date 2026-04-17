import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { apiError, apiSuccess } from "@/lib/api";
import { getCertificationVerificationRecord } from "@/lib/certification-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ verificationCode: string }> }
) {
  const params = await context.params;
  const result = await getCertificationVerificationRecord({
    verificationCode: params.verificationCode,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });
  if ("error" in result) {
    return setApiVersionHeader(
      apiError(result.error.code, result.error.message, result.error.status, result.error.details)
    );
  }

  return setApiVersionHeader(apiSuccess({ credential: result }));
}
