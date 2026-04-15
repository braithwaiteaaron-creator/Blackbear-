import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authConfig } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { listQuizSessions } from "@/lib/quiz-session-service";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  minScore: z.coerce.number().int().min(0).max(15).optional(),
  maxScore: z.coerce.number().int().min(0).max(15).optional(),
  tierCompleted: z.enum(["beginner", "intermediate", "advanced", "full"]).optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;

  if (!email) {
    return apiError("AUTH_REQUIRED", "Authentication required.", 401);
  }

  const parsedQuery = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsedQuery.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid query parameters.",
      400,
      parsedQuery.error.flatten()
    );
  }

  const page = parsedQuery.data.page ?? 1;
  const pageSize = parsedQuery.data.pageSize ?? 25;

  const result = await listQuizSessions({
    userEmail: email,
    page,
    pageSize,
    minScore: parsedQuery.data.minScore,
    maxScore: parsedQuery.data.maxScore,
    tier: parsedQuery.data.tierCompleted,
  });

  return apiSuccess(result);
}
