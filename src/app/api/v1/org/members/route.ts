import { getServerSession } from "next-auth";
import { z } from "zod";

import { setApiVersionHeader } from "@/app/api/v1/route-config";
import { API_ERROR_CODES, apiError, apiSuccess } from "@/lib/api";
import { authConfig } from "@/lib/auth";
import { requireOrganizationApiAccess } from "@/lib/admin-api-auth";
import {
  getOrganizationContextForUser,
  provisionOrganizationMemberForUser,
  provisionOrganizationMemberSchema,
} from "@/lib/organization-service";

const querySchema = z.object({
  status: z.enum(["invited", "active", "suspended"]).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid member query parameters.",
        400,
        parsed.error.flatten()
      )
    );
  }

  const result = await getOrganizationContextForUser({
    userEmail: email,
    userName: session.user?.name ?? null,
    userRole: session.user?.role ?? null,
    memberStatus: parsed.data.status,
    limit: parsed.data.limit,
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

  const payload = provisionOrganizationMemberSchema.safeParse(await request.json());
  if (!payload.success) {
    return setApiVersionHeader(
      apiError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid organization member payload.",
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

  const result = await provisionOrganizationMemberForUser({
    userEmail: email,
    userName: session.user?.name ?? null,
    userRole: session.user?.role ?? null,
    payload: payload.data,
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

  return setApiVersionHeader(apiSuccess(result.data, 201));
}
