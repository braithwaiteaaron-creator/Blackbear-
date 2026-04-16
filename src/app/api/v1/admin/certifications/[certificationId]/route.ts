import { z } from "zod";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { requireAdminApiAccess } from "@/lib/billing/admin-report-auth";
import { revokeCertificationById } from "@/lib/admin-certification-service";

const revokeRequestSchema = z.object({
  reason: z.string().trim().min(1).max(300).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ certificationId: string }> }
) {
  const unauthorized = await requireAdminApiAccess();
  if (unauthorized) {
    return setApiVersionHeader(unauthorized);
  }

  const params = await context.params;
  const parsed = revokeRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid revoke request payload.",
        400,
        parsed.error.flatten()
      )
    );
  }

  const result = await revokeCertificationById({
    certificationId: params.certificationId,
    reason: parsed.data.reason,
  });
  if ("error" in result) {
    return setApiVersionHeader(
      apiError(result.error.code, result.error.message, result.error.status, result.error.details)
    );
  }

  return setApiVersionHeader(
    apiSuccess(
      {
        certification: result,
      },
      200
    )
  );
}
