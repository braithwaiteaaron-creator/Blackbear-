export type QuizTier = "beginner" | "intermediate" | "advanced";

export type OptionId = "A" | "B" | "C" | "D";

export type QuestionOption = {
  id: OptionId;
  text: string;
};

export type QuizQuestion = {
  id: number;
  tier: QuizTier;
  prompt: string;
  scenario?: string;
  isScenario?: boolean;
  options: QuestionOption[];
  correctOption: OptionId;
  correctOptionId?: OptionId;
  rationale: string;
};

export type Question = QuizQuestion;

export type QuestionResponse = {
  questionId: number;
  selectedOption: OptionId;
  isCorrect: boolean;
  timeOnQuestionMs: number;
  tier: QuizTier;
};

export type ScoreBreakdown = {
  beginner: number;
  intermediate: number;
  advanced: number;
  total: number;
};

export type BadgeTier = "foundation" | "developing" | "advanced" | "expert";

export type TierFeedbackBand = {
  min: number;
  max: number;
  message: string;
};

export type BadgeRule = {
  tier: BadgeTier;
  minScore: number;
  maxScore: number;
  title: string;
  summary: string;
  unlocks: string[];
};
