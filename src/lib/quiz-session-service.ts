import type { Prisma } from "@prisma/client";

import { getBadgeAward } from "@/lib/scoring";
import { prisma } from "@/lib/prisma";
import { API_ERROR_CODES, type ApiErrorCode } from "@/lib/api";
import { mapSessionSummary } from "@/lib/quiz-persistence";
import type {
  PersistQuizSessionResult,
  PersistedQuizSessionSummary,
  QuizSessionCreatePayload,
} from "@/lib/types";

const RETAKE_COOLDOWN_SECONDS = 24 * 60 * 60;

type SaveQuizSessionParams = {
  userEmail: string;
  userName?: string | null;
  payload: QuizSessionCreatePayload;
  idempotencyKey?: string;
};

type ListSessionsParams = {
  userEmail: string;
  page: number;
  pageSize: number;
  minScore?: number;
  maxScore?: number;
  tier?: "beginner" | "intermediate" | "advanced" | "full";
};

export type SaveQuizSessionSuccess = {
  sessionId: string;
  badgeTier: PersistQuizSessionResult["badgeTier"];
  totalScore: number;
  duplicate?: boolean;
};

export type ServiceError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: unknown;
};

export type ListQuizSessionsSuccess = {
  sessions: PersistedQuizSessionSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function addIdempotencyHint(source: string, key: string): string {
  const encoded = encodeURIComponent(`idempotency:${source}:${key}`);
  if (source.length >= 256) {
    return source.slice(0, 255);
  }
  const next = `${source}|${encoded}`;
  return next.length <= 256 ? next : source.slice(0, 256);
}

function extractIdempotencyKey(trafficSource: string): string | null {
  const marker = "idempotency:";
  const tokens = trafficSource.split("|");
  for (const token of tokens) {
    const decoded = decodeURIComponent(token);
    if (decoded.startsWith(marker)) {
      return decoded.slice(marker.length);
    }
  }
  return null;
}

async function getOrCreateUser(params: {
  email: string;
  name?: string | null;
}) {
  return prisma.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name ?? "GitHub Mastery User",
    },
    create: {
      email: params.email,
      name: params.name ?? "GitHub Mastery User",
      subscriptionTier: "free",
    },
  });
}

function buildDuplicateResponse(sessionId: string, totalScore: number): SaveQuizSessionSuccess {
  return {
    sessionId,
    badgeTier: getBadgeAward(totalScore).tier,
    totalScore,
    duplicate: true,
  };
}

async function findIdempotentDuplicate(params: {
  userId: string;
  idempotencyKey: string;
}) {
  const matches = await prisma.quizSession.findFirst({
    where: {
      userId: params.userId,
      trafficSource: {
        contains: params.idempotencyKey,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
    select: {
      id: true,
      totalScore: true,
    },
  });

  return matches;
}

async function checkRetakeCooldown(userId: string, now: Date) {
  const latest = await prisma.quizSession.findFirst({
    where: { userId },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  if (!latest) {
    return { allowed: true as const };
  }

  const elapsed = Math.floor((now.getTime() - latest.completedAt.getTime()) / 1000);
  if (elapsed >= RETAKE_COOLDOWN_SECONDS) {
    return { allowed: true as const };
  }

  return {
    allowed: false as const,
    retryAfterSeconds: RETAKE_COOLDOWN_SECONDS - elapsed,
  };
}

export async function saveQuizSession(
  params: SaveQuizSessionParams
): Promise<SaveQuizSessionSuccess | { error: ServiceError }> {
  const user = await getOrCreateUser({
    email: params.userEmail,
    name: params.userName,
  });

  if (params.idempotencyKey) {
    const duplicate = await findIdempotentDuplicate({
      userId: user.id,
      idempotencyKey: params.idempotencyKey,
    });

    if (duplicate) {
      return buildDuplicateResponse(duplicate.id, duplicate.totalScore);
    }
  }

  const cooldown = await checkRetakeCooldown(user.id, new Date());
  if (!cooldown.allowed) {
    return {
      error: {
        code: API_ERROR_CODES.RETAKE_COOLDOWN_ACTIVE,
        message: "Retake cooldown active. Please try again later.",
        status: 429,
        details: { retryAfterSeconds: cooldown.retryAfterSeconds },
      },
    };
  }

  const trafficSource = params.idempotencyKey
    ? addIdempotencyHint(params.payload.trafficSource, params.idempotencyKey)
    : params.payload.trafficSource;

  const createdSession = await prisma.quizSession.create({
    data: {
      userId: user.id,
      tierCompleted: params.payload.tierCompleted,
      totalScore: params.payload.totalScore,
      beginnerScore: params.payload.beginnerScore,
      intermediateScore: params.payload.intermediateScore,
      advancedScore: params.payload.advancedScore,
      timeToComplete: params.payload.timeToComplete,
      deviceType: params.payload.deviceType,
      trafficSource,
      questionResponses: {
        create: params.payload.responses.map((response) => ({
          questionId: response.questionId,
          selectedAnswer: response.selectedAnswer,
          isCorrect: response.isCorrect,
          timeOnQuestion: response.timeOnQuestion,
        })),
      },
    },
  });

  return {
    sessionId: createdSession.id,
    badgeTier: getBadgeAward(params.payload.totalScore).tier,
    totalScore: params.payload.totalScore,
  };
}

export async function listQuizSessions(
  params: ListSessionsParams
): Promise<ListQuizSessionsSuccess | { error: ServiceError }> {
  const user = await prisma.user.findUnique({
    where: { email: params.userEmail },
    select: { id: true },
  });

  if (!user) {
    return {
      sessions: [],
      page: params.page,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 0,
    };
  }

  const where: Prisma.QuizSessionWhereInput = {
    userId: user.id,
  };

  if (typeof params.minScore === "number" || typeof params.maxScore === "number") {
    where.totalScore = {
      ...(typeof params.minScore === "number" ? { gte: params.minScore } : {}),
      ...(typeof params.maxScore === "number" ? { lte: params.maxScore } : {}),
    };
  }

  if (params.tier) {
    where.tierCompleted = params.tier;
  }

  const [total, sessions] = await Promise.all([
    prisma.quizSession.count({ where }),
    prisma.quizSession.findMany({
      where,
      orderBy: { completedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        questionResponses: {
          select: {
            questionId: true,
            isCorrect: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / params.pageSize);

  return {
    sessions: sessions.map((session) => {
      const mapped = mapSessionSummary(session);
      const idempotency = extractIdempotencyKey(session.trafficSource);
      return idempotency ? { ...mapped, idempotencyKey: idempotency } : mapped;
    }),
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages,
  };
}
