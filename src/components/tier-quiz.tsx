"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QuizQuestionCard } from "@/components/quiz-question-card";
import { QUESTIONS_BY_TIER } from "@/lib/quiz-content";
import { useQuizStore } from "@/lib/store";
import type { OptionId, QuizTier } from "@/lib/types";

const NEXT_STEP: Record<QuizTier, string> = {
  beginner: "/quiz/intermediate",
  intermediate: "/quiz/advanced",
  advanced: "/results",
};

type TierQuizProps = {
  tier: QuizTier;
  requiresAccount?: boolean;
};

export function TierQuiz({ tier, requiresAccount = false }: TierQuizProps) {
  const router = useRouter();
  const questions = useMemo(() => QUESTIONS_BY_TIER[tier], [tier]);
  const responses = useQuizStore((state) => state.responses);
  const answerQuestion = useQuizStore((state) => state.answerQuestion);

  const answeredCount = questions.filter((question) => responses[question.id]).length;
  const nextQuestion = questions.find((question) => !responses[question.id]);
  const isTierComplete = answeredCount === questions.length;
  const currentQuestionIndex = nextQuestion
    ? questions.findIndex((item) => item.id === nextQuestion.id)
    : questions.length - 1;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const handleSelect = (questionId: number, option: OptionId) => {
    answerQuestion(questionId, option);
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          {tier} tier
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          GitHub Mastery Assessment
        </h1>
        {requiresAccount ? (
          <p className="mt-3 text-sm text-slate-600">
            This tier is account-gated in production. In this build, it is open for
            product demonstration.
          </p>
        ) : null}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              Question {Math.max(1, currentQuestionIndex + 1)} of {questions.length}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div
            className="h-2 rounded-full bg-slate-200"
            aria-label="Tier progress bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Estimated remaining time: {Math.max(1, 4 - answeredCount)} minutes.
          </p>
        </div>
      </header>

      {!isTierComplete && nextQuestion ? (
        <QuizQuestionCard
          key={nextQuestion.id}
          question={nextQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          selectedOption={responses[nextQuestion.id]?.selectedOption}
          answerSubmitted={Boolean(responses[nextQuestion.id])}
          onSelectOption={(option) => handleSelect(nextQuestion.id, option)}
          onContinue={() => {
            const upcomingQuestion = questions.find(
              (question) => !responses[question.id] && question.id !== nextQuestion.id
            );
            if (!upcomingQuestion) {
              return;
            }
            router.refresh();
          }}
        />
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-emerald-900">Tier complete!</h2>
          <p className="mt-2 text-sm text-emerald-800">
            Great work. Continue to the next tier or view your full results.
          </p>
          <button
            type="button"
            onClick={() => router.push(NEXT_STEP[tier])}
            className="mt-4 min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            {tier === "advanced" ? "View results" : "Continue"}
          </button>
        </div>
      )}
    </section>
  );
}
