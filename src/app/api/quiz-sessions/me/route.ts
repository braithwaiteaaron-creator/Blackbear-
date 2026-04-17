import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { getQuizSessionsMeHandler } from "@/lib/api-handlers/quiz-sessions-me";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = await getQuizSessionsMeHandler(request);
  return setDeprecationHeaders(response, "/api/v1/quiz-sessions/me");
}
