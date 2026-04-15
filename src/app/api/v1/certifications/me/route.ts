import { getServerSession } from "next-auth";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import {
  issueCertificationForLatestSession,
  listCertificationsForUser,
} from "@/lib/certification-service";

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

export async function POST() {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const issued = await issueCertificationForLatestSession({
    userEmail: email,
    userName: session.user?.name,
  });
  if ("error" in issued) {
    return setApiVersionHeader(
      apiError(
        issued.error.code,
        issued.error.message,
        issued.error.status,
        issued.error.details
      )
    );
  }

  return setApiVersionHeader(
    apiSuccess(
      {
        certification: issued.certification,
        sourceSessionId: issued.sourceSessionId,
      },
      issued.created ? 201 : 200,
      { created: issued.created }
    )
  );
}
