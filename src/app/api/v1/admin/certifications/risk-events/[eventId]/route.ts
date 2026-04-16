import { z } from "zod";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { resolveCertificationRiskEvent } from "@/lib/certification-risk";
import { requireAdminApiAccess } from "@/lib/billing/admin-report-auth";

const resolvePayloadSchema = z.object({
  resolutionNote: z.string().trim().min(3).max(500),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  const accessError = await requireAdminApiAccess();
  if (accessError) {
    return setApiVersionHeader(accessError);
  }

  const params = await context.params;
  const payload = resolvePayloadSchema.safeParse(await request.json().catch(() => ({})));
  if (!payload.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid risk event resolution payload.",
        400,
        payload.error.flatten()
      )
    );
  }

  try {
    const updated = await resolveCertificationRiskEvent({
      eventId: params.eventId,
      resolutionNote: payload.data.resolutionNote,
    });
    return setApiVersionHeader(
      apiSuccess({
        riskEvent: {
          id: updated.id,
          resolvedAt: updated.resolvedAt?.toISOString() ?? null,
          resolutionNote: updated.resolutionNote,
        },
      })
    );
  } catch {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.NOT_FOUND, "Risk event not found for resolution.", 404)
    );
  }
}
