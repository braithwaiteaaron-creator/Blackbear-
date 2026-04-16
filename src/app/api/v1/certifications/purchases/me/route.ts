import { getServerSession } from "next-auth";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { listCertificationPurchasesForUser } from "@/lib/certification-purchase";

export async function GET() {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const purchases = await listCertificationPurchasesForUser(email);
  return setApiVersionHeader(apiSuccess({ purchases }));
}
