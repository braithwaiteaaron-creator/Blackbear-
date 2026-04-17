import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import { postQuizSessionsHandler } from "@/lib/api-handlers/quiz-sessions";

export async function POST(request: Request) {
  const response = await postQuizSessionsHandler(request);
  return setDeprecationHeaders(response, "/api/v1/quiz-sessions");
}
