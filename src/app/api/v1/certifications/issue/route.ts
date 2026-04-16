import { getServerSession } from "next-auth";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { issueCertificationFromCompletedPurchase } from "@/lib/certification-purchase";

export async function POST() {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const result = await issueCertificationFromCompletedPurchase({
    userEmail: email,
    userName: session.user?.name,
  });
  if (!result.ok) {
    return setApiVersionHeader(
      apiError(result.error.code, result.error.message, result.error.status, result.error.details)
    );
  }

  return setApiVersionHeader(
    apiSuccess(
      {
        certification: result.data.certification,
        sourceSessionId: result.data.sourceSessionId,
      },
      result.data.created ? 201 : 200,
      {
        created: result.data.created,
        purchaseId: result.data.purchaseId,
        verificationUrl: `/api/v1/certifications/verify/${result.data.certification.verificationCode}`,
      }
    )
  );
}
