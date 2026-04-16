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

  const organization = await prisma.organization.upsert({
    where: { domain: "seed.example.com" },
    update: {
      name: "Seed Org",
      subscriptionType: "enterprise",
      seatCount: 25,
      adminUserId: user.id,
    },
    create: {
      name: "Seed Org",
      domain: "seed.example.com",
      subscriptionType: "enterprise",
      seatCount: 25,
      adminUserId: user.id,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: user.email,
      },
    },
    update: {
      userId: user.id,
      role: "admin",
      status: "active",
      acceptedAt: new Date(),
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      email: user.email,
      role: "admin",
      status: "active",
      invitedByUserId: user.id,
      acceptedAt: new Date(),
    },
  });

  const seedMember = await prisma.user.upsert({
    where: { email: "seed.member@example.com" },
    update: {
      name: "Seed Member",
      role: "user",
      organization: "Seed Org",
      subscriptionTier: "enterprise",
    },
    create: {
      email: "seed.member@example.com",
      name: "Seed Member",
      role: "user",
      organization: "Seed Org",
      subscriptionTier: "enterprise",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: seedMember.email,
      },
    },
    update: {
      userId: seedMember.id,
      role: "member",
      status: "active",
      invitedByUserId: user.id,
      acceptedAt: new Date(),
    },
    create: {
      organizationId: organization.id,
      userId: seedMember.id,
      email: seedMember.email,
      role: "member",
      status: "active",
      invitedByUserId: user.id,
      acceptedAt: new Date(),
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: "invited.dev@example.com",
      },
    },
    update: {
      userId: null,
      role: "member",
      status: "invited",
      invitedByUserId: user.id,
      acceptedAt: null,
    },
    create: {
      organizationId: organization.id,
      userId: null,
      email: "invited.dev@example.com",
      role: "member",
      status: "invited",
      invitedByUserId: user.id,
      acceptedAt: null,
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
