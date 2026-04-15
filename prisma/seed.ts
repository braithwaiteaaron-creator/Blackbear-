import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/github_mastery";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed.user@example.com" },
    update: {
      name: "Seed User",
      role: "org_admin",
      subscriptionTier: "enterprise",
    },
    create: {
      email: "seed.user@example.com",
      name: "Seed User",
      role: "org_admin",
      subscriptionTier: "enterprise",
      organization: "Seed Org",
    },
  });

  await prisma.quizSession.create({
    data: {
      userId: user.id,
      tierCompleted: "full",
      totalScore: 12,
      beginnerScore: 5,
      intermediateScore: 4,
      advancedScore: 3,
      timeToComplete: 412,
      deviceType: "desktop",
      trafficSource: "seed",
      questionResponses: {
        create: [
          {
            questionId: 1,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 18,
          },
          {
            questionId: 2,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 17,
          },
          {
            questionId: 3,
            selectedAnswer: "A",
            isCorrect: true,
            timeOnQuestion: 15,
          },
          {
            questionId: 4,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 24,
          },
          {
            questionId: 5,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 21,
          },
          {
            questionId: 6,
            selectedAnswer: "A",
            isCorrect: true,
            timeOnQuestion: 21,
          },
          {
            questionId: 7,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 25,
          },
          {
            questionId: 8,
            selectedAnswer: "C",
            isCorrect: true,
            timeOnQuestion: 30,
          },
          {
            questionId: 9,
            selectedAnswer: "C",
            isCorrect: true,
            timeOnQuestion: 34,
          },
          {
            questionId: 10,
            selectedAnswer: "A",
            isCorrect: false,
            timeOnQuestion: 22,
          },
          {
            questionId: 11,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 26,
          },
          {
            questionId: 12,
            selectedAnswer: "D",
            isCorrect: true,
            timeOnQuestion: 29,
          },
          {
            questionId: 13,
            selectedAnswer: "B",
            isCorrect: true,
            timeOnQuestion: 31,
          },
          {
            questionId: 14,
            selectedAnswer: "A",
            isCorrect: false,
            timeOnQuestion: 24,
          },
          {
            questionId: 15,
            selectedAnswer: "C",
            isCorrect: false,
            timeOnQuestion: 31,
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
