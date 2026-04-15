import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapSessionSummary } from "@/lib/quiz-persistence";

export async function GET() {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ sessions: [] });
  }

  const sessions = await prisma.quizSession.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 25,
    include: {
      questionResponses: {
        select: {
          questionId: true,
          isCorrect: true,
        },
      },
    },
  });

  return NextResponse.json({
    sessions: sessions.map((item) => mapSessionSummary(item)),
  });
}
