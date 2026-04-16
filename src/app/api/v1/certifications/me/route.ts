import { getServerSession } from "next-auth";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { listCertificationsForUser } from "@/lib/certification-service";
import {
  issueCertificationFromCompletedPurchase,
} from "@/lib/certification-purchase";

export async function GET() {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const result = await listCertificationsForUser(email);
  if ("error" in result) {
    return setApiVersionHeader(
      apiError(result.error.code, result.error.message, result.error.status, result.error.details)
    );
  }

  return setApiVersionHeader(apiSuccess({ certifications: result }));
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const purchaseIssuanceResult = await issueCertificationFromCompletedPurchase({
    userEmail: email,
    userName: session.user?.name,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });
  if (purchaseIssuanceResult.ok) {
    return setApiVersionHeader(
      apiSuccess(
        {
          certification: purchaseIssuanceResult.data.certification,
          sourceSessionId: purchaseIssuanceResult.data.sourceSessionId,
        },
        purchaseIssuanceResult.data.created ? 201 : 200,
        {
          created: purchaseIssuanceResult.data.created,
          purchaseId: purchaseIssuanceResult.data.purchaseId,
          providerSync: purchaseIssuanceResult.data.providerSync,
          verificationUrl: `/api/v1/certifications/verify/${purchaseIssuanceResult.data.certification.verificationCode}`,
        }
      )
    );
  }

  return setApiVersionHeader(
    apiError(
      purchaseIssuanceResult.error.code,
      purchaseIssuanceResult.error.message,
      purchaseIssuanceResult.error.status,
      purchaseIssuanceResult.error.details
    )
  );
}
