import { z } from "zod";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { listAdminCertifications } from "@/lib/admin-certification-service";
import { requireAdminApiAccess } from "@/lib/billing/admin-report-auth";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(250).optional(),
});

export async function GET(request: Request) {
  const accessError = await requireAdminApiAccess();
  if (accessError) {
    return setApiVersionHeader(accessError);
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid query parameters.",
        400,
        parsed.error.flatten()
      )
    );
  }

  const certifications = await listAdminCertifications(parsed.data.limit);
  return setApiVersionHeader(apiSuccess({ certifications }));
}
