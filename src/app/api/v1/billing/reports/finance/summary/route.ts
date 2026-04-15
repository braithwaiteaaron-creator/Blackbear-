import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { requireAdminApiAccess } from "@/lib/billing/admin-report-auth";
import { getFinanceSummary, resolveFinanceWindow } from "@/lib/billing/reports";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAccess();
  if (unauthorized) {
    return setApiVersionHeader(unauthorized);
  }

  const url = new URL(request.url);
  const resolvedWindow = resolveFinanceWindow({
    preset: url.searchParams.get("preset"),
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  });
  if (!resolvedWindow.ok) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.VALIDATION_ERROR, resolvedWindow.error, 400)
    );
  }

  const summary = await getFinanceSummary(resolvedWindow.window);
  return setApiVersionHeader(
    apiSuccess({
      summary,
      windowPreset: resolvedWindow.preset,
    })
  );
}
