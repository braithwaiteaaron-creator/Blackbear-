import type { BadgeTier, QuestionResponse, QuizTier, ScoreBreakdown } from "@/lib/types";

type TierFeedback = {
  excellent: string;
  solid: string;
  needsWork: string;
  startHere: string;
};

const FEEDBACK_BY_TIER: Record<QuizTier, TierFeedback> = {
  beginner: {
    excellent:
      "Strong foundational knowledge. Ready to advance to intermediate practices.",
    solid:
      "Good understanding with minor gaps worth addressing before progressing.",
    needsWork:
      "Structured review of GitHub's core documentation is recommended.",
    startHere: "Begin with GitHub's official Getting Started guide.",
  },
  intermediate: {
    excellent:
      "Proficient working knowledge. Effectively leveraging GitHub's collaborative features.",
    solid:
      "Competent with specific areas in workflow automation meriting further exploration.",
    needsWork:
      "Focused study on GitHub Actions and branch management is advised.",
    startHere: "Revisiting Tier 1 concepts before progressing is recommended.",
  },
  advanced: {
    excellent:
      "Expert-level proficiency. Fully equipped for enterprise-grade GitHub strategy.",
    solid:
      "Strong knowledge with targeted opportunities to deepen security expertise.",
    needsWork:
      "Engagement with GitHub's advanced security documentation is strongly recommended.",
    startHere:
      "Comprehensive review of intermediate and advanced features is advised.",
  },
};

export const BADGE_CONFIG: Record<
  BadgeTier,
  {
    label: string;
    emoji: string;
    scoreRange: string;
    summary: string;
    unlocks: string;
  }
> = {
  expert: {
    label: "GitHub Expert",
    emoji: "🏆",
    scoreRange: "13-15",
    summary:
      "Demonstrates mastery across all dimensions of GitHub best practices.",
    unlocks:
      "Enterprise consultation invitation and early access to advanced platform features.",
  },
  advanced: {
    label: "Advanced Practitioner",
    emoji: "🥇",
    scoreRange: "9-12",
    summary: "Strong working knowledge with targeted areas identified for growth.",
    unlocks: "Advanced feature demonstrations and relevant case studies.",
  },
  developing: {
    label: "Developing Proficiency",
    emoji: "🥈",
    scoreRange: "5-8",
    summary:
      "Foundational understanding with clear opportunities to expand skill set.",
    unlocks: "Guided platform walkthrough and curated learning resources.",
  },
  foundation: {
    label: "Foundation Builder",
    emoji: "🥉",
    scoreRange: "0-4",
    summary: "Beginning of the GitHub learning journey.",
    unlocks: "Onboarding tutorial sequence and foundational content library access.",
  },
};

export function getBadgeTier(totalScore: number): BadgeTier {
  if (totalScore >= 13) {
    return "expert";
  }
  if (totalScore >= 9) {
    return "advanced";
  }
  if (totalScore >= 5) {
    return "developing";
  }
  return "foundation";
}

export function getBadgeAward(totalScore: number) {
  const tier = getBadgeTier(totalScore);
  const config = BADGE_CONFIG[tier];
  return {
    tier,
    label: `${config.emoji} ${config.label}`,
    description: config.summary,
    unlocks: config.unlocks,
  };
}

export function getTierFeedback(tier: QuizTier, score: number): string {
  const config = FEEDBACK_BY_TIER[tier];
  if (score === 5) {
    return config.excellent;
  }
  if (score >= 3) {
    return config.solid;
  }
  if (score >= 1) {
    return config.needsWork;
  }
  return config.startHere;
}

export function buildOverallBreakdown(
  beginner: number,
  intermediate: number,
  advanced: number
): ScoreBreakdown {
  return {
    beginner,
    intermediate,
    advanced,
    total: beginner + intermediate + advanced,
  };
}

export function computeScoreBreakdown(
  responses: QuestionResponse[]
): ScoreBreakdown {
  const beginner = responses.filter(
    (response) => response.tier === "beginner" && response.isCorrect
  ).length;
  const intermediate = responses.filter(
    (response) => response.tier === "intermediate" && response.isCorrect
  ).length;
  const advanced = responses.filter(
    (response) => response.tier === "advanced" && response.isCorrect
  ).length;

  return buildOverallBreakdown(beginner, intermediate, advanced);
}

export function getCtaByBadgeTier(tier: BadgeTier): string {
  if (tier === "expert") {
    return "Book your enterprise strategy consultation and join the expert beta program.";
  }
  if (tier === "advanced") {
    return "Unlock expert certification prep and close your remaining high-impact gaps.";
  }
  if (tier === "developing") {
    return "Activate your personalized learning path and accelerate into advanced workflows.";
  }
  return "Start the onboarding tutorial and build your GitHub foundations step by step.";
}
