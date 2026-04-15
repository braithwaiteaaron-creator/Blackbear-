import type {
  DeviceType,
  PersistQuizSessionResult,
  PersistedQuizSessionSummary,
  QuestionResponse,
  QuizSessionCreatePayload,
  TierCompleted,
  QuizTier,
  ScoreBreakdown,
} from "@/lib/types";
import { getBadgeTier } from "@/lib/scoring";

function computeTierCompleted(responseCount: number): TierCompleted {
  if (responseCount >= 15) {
    return "full";
  }
  if (responseCount >= 10) {
    return "advanced";
  }
  if (responseCount >= 5) {
    return "intermediate";
  }
  return "beginner";
}

export function buildQuizSessionPayload(input: {
  responses: QuestionResponse[];
  breakdown: ScoreBreakdown;
  startedAt?: number;
  completedAt: number;
  deviceType: DeviceType;
  trafficSource: string;
}): QuizSessionCreatePayload {
  const startedAt = input.startedAt ?? input.completedAt;
  const elapsedMs = Math.max(0, input.completedAt - startedAt);

  return {
    tierCompleted: computeTierCompleted(input.responses.length),
    totalScore: input.breakdown.total,
    beginnerScore: input.breakdown.beginner,
    intermediateScore: input.breakdown.intermediate,
    advancedScore: input.breakdown.advanced,
    timeToComplete: Math.round(elapsedMs / 1000),
    deviceType: input.deviceType,
    trafficSource: input.trafficSource,
    responses: input.responses.map((response) => ({
      questionId: response.questionId,
      selectedAnswer: response.selectedOption,
      isCorrect: response.isCorrect,
      timeOnQuestion: Math.round(response.timeOnQuestionMs / 1000),
    })),
  };
}

export async function persistQuizSession(
  payload: QuizSessionCreatePayload
): Promise<PersistQuizSessionResult> {
  const response = await fetch("/api/quiz-sessions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not persist quiz session.");
  }

  return (await response.json()) as PersistQuizSessionResult;
}

const TIER_BY_QUESTION_ID: Record<number, QuizTier> = {
  1: "beginner",
  2: "beginner",
  3: "beginner",
  4: "beginner",
  5: "beginner",
  6: "intermediate",
  7: "intermediate",
  8: "intermediate",
  9: "intermediate",
  10: "intermediate",
  11: "advanced",
  12: "advanced",
  13: "advanced",
  14: "advanced",
  15: "advanced",
};

function summarizeBreakdown(
  responses: Array<{ questionId: number; isCorrect: boolean }>
): ScoreBreakdown {
  const beginner = responses.filter(
    (response) =>
      TIER_BY_QUESTION_ID[response.questionId] === "beginner" && response.isCorrect
  ).length;
  const intermediate = responses.filter(
    (response) =>
      TIER_BY_QUESTION_ID[response.questionId] === "intermediate" && response.isCorrect
  ).length;
  const advanced = responses.filter(
    (response) =>
      TIER_BY_QUESTION_ID[response.questionId] === "advanced" && response.isCorrect
  ).length;

  return {
    beginner,
    intermediate,
    advanced,
    total: beginner + intermediate + advanced,
  };
}

export function mapSessionSummary(session: {
  id: string;
  completedAt: Date;
  questionResponses: Array<{ questionId: number; isCorrect: boolean }>;
}): PersistedQuizSessionSummary {
  const breakdown = summarizeBreakdown(session.questionResponses);

  return {
    id: session.id,
    totalScore: breakdown.total,
    beginnerScore: breakdown.beginner,
    intermediateScore: breakdown.intermediate,
    advancedScore: breakdown.advanced,
    completedAt: session.completedAt.toISOString(),
    badge: getBadgeTier(breakdown.total),
  };
}
