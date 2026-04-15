export type QuizTier = "beginner" | "intermediate" | "advanced";

export type OptionId = "A" | "B" | "C" | "D";
export type DeviceType = "mobile" | "tablet" | "desktop";
export type TierCompleted = "beginner" | "intermediate" | "advanced" | "full";

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

export type QuizSessionCreatePayload = {
  tierCompleted: TierCompleted;
  totalScore: number;
  beginnerScore: number;
  intermediateScore: number;
  advancedScore: number;
  timeToComplete: number;
  deviceType: DeviceType;
  trafficSource: string;
  responses: Array<{
    questionId: number;
    selectedAnswer: OptionId;
    isCorrect: boolean;
    timeOnQuestion: number;
  }>;
};

export type PersistedQuizSession = {
  id: string;
  completedAt: string;
  tierCompleted: TierCompleted;
  totalScore: number;
  beginnerScore: number;
  intermediateScore: number;
  advancedScore: number;
  timeToComplete: number;
  deviceType: DeviceType;
  trafficSource: string;
  responses: Array<{
    id: string;
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
    timeOnQuestion: number;
    createdAt: string;
  }>;
};

export type PersistedQuizSessionSummary = {
  id: string;
  totalScore: number;
  beginnerScore: number;
  intermediateScore: number;
  advancedScore: number;
  completedAt: string;
  badge: string;
};

export type PersistQuizSessionResult = {
  sessionId: string;
  badgeTier: BadgeTier;
  totalScore: number;
};

export type ScoreBreakdown = {
  beginner: number;
  intermediate: number;
  advanced: number;
  total: number;
};

export type BadgeTier = "foundation" | "developing" | "advanced" | "expert";
export type AppRole = "user" | "org_admin" | "admin";
export type AccessRole = AppRole;
export type SubscriptionTier = "free" | "premium" | "team" | "enterprise";

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
