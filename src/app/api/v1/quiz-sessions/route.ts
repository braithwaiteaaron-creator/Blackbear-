import { postQuizSessionsHandler } from "@/lib/api-handlers/quiz-sessions";

export async function POST(request: Request) {
  const response = await postQuizSessionsHandler(request);
  response.headers.set("X-API-Version", "v1");
  return response;
}
