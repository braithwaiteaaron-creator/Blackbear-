import { z } from "zod";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { reissueCertificationForUser } from "@/lib/admin-certification-service";
import { requireAdminApiAccess } from "@/lib/billing/admin-report-auth";

const reissueSchema = z.object({
  targetUserEmail: z.string().email(),
  certificationTier: z.enum(["foundation", "developing", "advanced", "expert"]),
  reason: z.string().trim().max(300).optional(),
});

export async function POST(request: Request) {
  const accessError = await requireAdminApiAccess();
  if (accessError) {
    return setApiVersionHeader(accessError);
  }

  const payload = reissueSchema.safeParse(await request.json());
  if (!payload.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid reissue payload.",
        400,
        payload.error.flatten()
      )
    );
  }

  const result = await reissueCertificationForUser(payload.data);
  if ("error" in result) {
    return setApiVersionHeader(
      apiError(result.error.code, result.error.message, result.error.status, result.error.details)
    );
  }

  return setApiVersionHeader(
    apiSuccess(
      {
        certification: result.certification,
        sourceSessionId: result.sourceSessionId,
      },
      201,
      {
        providerSync: result.providerSync,
      }
    )
  );
}
