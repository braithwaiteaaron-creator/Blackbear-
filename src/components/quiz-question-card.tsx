"use client";

import clsx from "clsx";
import type { OptionId, Question } from "@/lib/types";

type QuizQuestionCardProps = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption?: OptionId;
  answerSubmitted: boolean;
  onSelectOption: (option: OptionId) => void;
  onContinue: () => void;
};

export function QuizQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  answerSubmitted,
  onSelectOption,
  onContinue,
}: QuizQuestionCardProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {Math.max(0, totalQuestions - questionNumber)} remaining
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-100"
          aria-label="Tier progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {question.scenario && (
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            Scenario
          </span>
        )}
        <h1 className="text-2xl font-semibold leading-tight text-slate-900">
          {question.prompt}
        </h1>
      </header>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === question.correctOption;
          const isIncorrectSelection =
            answerSubmitted && isSelected && !isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !answerSubmitted && onSelectOption(option.id)}
              className={clsx(
                "min-h-11 w-full rounded-xl border p-4 text-left transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                {
                  "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50":
                    !answerSubmitted && !isSelected,
                  "border-blue-500 bg-blue-50 ring-2 ring-blue-200":
                    isSelected && !answerSubmitted,
                  "border-emerald-300 bg-emerald-50 text-emerald-900":
                    answerSubmitted && isCorrect,
                  "border-amber-300 bg-amber-50 text-amber-900":
                    isIncorrectSelection,
                },
              )}
              aria-pressed={isSelected}
            >
              <span className="font-medium">{option.id}) </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {answerSubmitted && (
        <section
          className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
          aria-live="polite"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Rationale
          </h2>
          <p className="mt-2 text-slate-700">{question.rationale}</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Continue
          </button>
        </section>
      )}
    </article>
  );
}
