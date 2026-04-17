import { getQuizSessionsMeHandler } from "@/lib/api-handlers/quiz-sessions-me";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = await getQuizSessionsMeHandler(request);
  response.headers.set("X-API-Version", "v1");
  return response;
}
