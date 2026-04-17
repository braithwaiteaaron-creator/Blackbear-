import { apiSuccess } from "@/lib/api";
import { getPublicBillingPlans } from "@/lib/billing";

export async function GET() {
  return apiSuccess({ plans: getPublicBillingPlans(), provider: "stripe" }, 200);
}
