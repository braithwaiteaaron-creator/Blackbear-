import { getServerSession } from "next-auth";
import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { requireOrganizationApiAccess } from "@/lib/admin-api-auth";
import {
  createOrganizationSchema,
  createOrganizationWithMembers,
  getOrganizationContextForUser,
} from "@/lib/organization-service";

export async function GET() {
  const accessError = await requireOrganizationApiAccess();
  if (accessError) {
    return setApiVersionHeader(accessError);
  }

  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const result = await getOrganizationContextForUser({
    userEmail: email,
    userName: session.user?.name ?? null,
    userRole: session.user?.role ?? null,
  });
  if (!result.ok) {
    return setApiVersionHeader(
      apiError(
        result.error.code,
        result.error.message,
        result.error.status,
        result.error.details
      )
    );
  }

  return setApiVersionHeader(apiSuccess(result.data));
}

export async function POST(request: Request) {
  const accessError = await requireOrganizationApiAccess();
  if (accessError) {
    return setApiVersionHeader(accessError);
  }

  const payload = createOrganizationSchema.safeParse(await request.json());
  if (!payload.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid organization creation payload.",
        400,
        payload.error.flatten()
      )
    );
  }

  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) {
    return setApiVersionHeader(
      apiError(API_ERROR_CODES.AUTH_REQUIRED, "Authentication required.", 401)
    );
  }

  const sessionTier =
    session.user?.subscriptionTier === "team" || session.user?.subscriptionTier === "enterprise"
      ? session.user.subscriptionTier
      : null;
  const created = await createOrganizationWithMembers({
    userEmail: email,
    userName: session.user?.name ?? null,
    userRole: session.user?.role ?? null,
    userSubscriptionTier: sessionTier,
    payload: payload.data,
  });
  if (!created.ok) {
    return setApiVersionHeader(
      apiError(
        created.error.code,
        created.error.message,
        created.error.status,
        created.error.details
      )
    );
  }

  return setApiVersionHeader(apiSuccess(created.data, 201));
}
