"use client";

import { create } from "zustand";

import { QUESTIONS } from "@/lib/quiz-content";
import { computeScoreBreakdown, getBadgeAward } from "@/lib/scoring";
import type {
  BadgeTier,
  QuestionResponse,
  OptionId,
} from "@/lib/types";

type QuizStore = {
  responses: Record<number, QuestionResponse>;
  startedAt?: number;
  completedAt?: number;
  setStartedAt: () => void;
  answerQuestion: (questionId: number, selectedOption: OptionId) => void;
  resetQuiz: () => void;
  resetAttempt: () => void;
  getAllResponses: () => QuestionResponse[];
  getQuestionResponse: (questionId: number) => QuestionResponse | undefined;
  hasTierCompletion: (tierQuestionIds: number[]) => boolean;
  getScoreBreakdown: () => import("@/lib/types").ScoreBreakdown;
  getBadgeTier: () => BadgeTier;
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  responses: {},
  setStartedAt: () => set({ startedAt: Date.now(), completedAt: undefined }),
  answerQuestion: (questionId, selectedOption) => {
    const question = QUESTIONS.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const response: QuestionResponse = {
      questionId,
      selectedOption,
      isCorrect: selectedOption === question.correctOption,
      timeOnQuestionMs: 0,
      tier: question.tier,
    };

    set((state) => ({
      responses: {
        ...state.responses,
        [questionId]: response,
      },
      completedAt: Date.now(),
    }));
  },
  resetQuiz: () => set({ responses: {}, startedAt: undefined, completedAt: undefined }),
  resetAttempt: () => set({ responses: {}, startedAt: undefined, completedAt: undefined }),
  getAllResponses: () => Object.values(get().responses),
  getQuestionResponse: (questionId) => get().responses[questionId],
  hasTierCompletion: (tierQuestionIds) =>
    tierQuestionIds.every((questionId) => Boolean(get().responses[questionId])),
  getScoreBreakdown: () => computeScoreBreakdown(Object.values(get().responses)),
  getBadgeTier: () => getBadgeAward(get().getScoreBreakdown().total).tier,
}));
