import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBadgeAward } from "@/lib/scoring";
import type { PersistQuizSessionResult, QuizSessionCreatePayload } from "@/lib/types";

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

export async function POST(request: Request) {
  const parsedBody = requestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const payload = parsedBody.data as QuizSessionCreatePayload;
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: session?.user?.name ?? "GitHub Mastery User",
    },
    create: {
      email,
      name: session?.user?.name ?? "GitHub Mastery User",
      subscriptionTier: "free",
    },
  });

  const createdSession = await prisma.quizSession.create({
    data: {
      userId: user.id,
      tierCompleted: payload.tierCompleted,
      totalScore: payload.totalScore,
      beginnerScore: payload.beginnerScore,
      intermediateScore: payload.intermediateScore,
      advancedScore: payload.advancedScore,
      timeToComplete: payload.timeToComplete,
      deviceType: payload.deviceType,
      trafficSource: payload.trafficSource,
      questionResponses: {
        create: payload.responses.map((response) => ({
          questionId: response.questionId,
          selectedAnswer: response.selectedAnswer,
          isCorrect: response.isCorrect,
          timeOnQuestion: response.timeOnQuestion,
        })),
      },
    },
  });

  const badgeAward = getBadgeAward(payload.totalScore);
  const result: PersistQuizSessionResult = {
    sessionId: createdSession.id,
    badgeTier: badgeAward.tier,
    totalScore: payload.totalScore,
  };

  return NextResponse.json(result, { status: 201 });
}
