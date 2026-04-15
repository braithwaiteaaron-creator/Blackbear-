import { getServerSession } from "next-auth";
import { z } from "zod";

import { authConfig } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api";
import { saveQuizSession } from "@/lib/quiz-session-service";
import type { QuizSessionCreatePayload } from "@/lib/types";

const requestSchema = z.object({
  tierCompleted: z.enum(["beginner", "intermediate", "advanced", "full"]),
  totalScore: z.number().int().min(0).max(15),
  beginnerScore: z.number().int().min(0).max(5),
  intermediateScore: z.number().int().min(0).max(5),
  advancedScore: z.number().int().min(0).max(5),
  timeToComplete: z.number().int().min(0),
  deviceType: z.enum(["mobile", "tablet", "desktop"]),
  trafficSource: z.string().min(1).max(256),
  responses: z.array(
    z.object({
      questionId: z.number().int().min(1).max(15),
      selectedAnswer: z.enum(["A", "B", "C", "D"]),
      isCorrect: z.boolean(),
      timeOnQuestion: z.number().int().min(0),
    })
  ),
});

export async function postQuizSessionsHandler(request: Request) {
  const parsedBody = requestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid request payload.",
      400,
      parsedBody.error.flatten()
    );
  }

  const payload = parsedBody.data as QuizSessionCreatePayload;
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  const idempotencyKey = request.headers.get("x-idempotency-key");

  if (!email) {
    return apiError("AUTH_REQUIRED", "Authentication required.", 401);
  }

  const result = await saveQuizSession({
    userEmail: email,
    userName: session?.user?.name ?? "GitHub Mastery User",
    payload,
    idempotencyKey: idempotencyKey ?? undefined,
  });

  if ("error" in result) {
    return apiError(
      result.error.code,
      result.error.message,
      result.error.status,
      result.error.details
    );
  }

  const duplicate = Boolean(result.duplicate);
  return apiSuccess(
    {
      sessionId: result.sessionId,
      badgeTier: result.badgeTier,
      totalScore: result.totalScore,
    },
    duplicate ? 200 : 201,
    { duplicate }
  );
}
