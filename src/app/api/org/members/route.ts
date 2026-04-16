import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import {
  GET as getV1OrgMembers,
  POST as postV1OrgMembers,
} from "@/app/api/v1/org/members/route";

export async function GET(request: Request) {
  const response = await getV1OrgMembers(request);
  return setDeprecationHeaders(response, "/api/v1/org/members");
}

export async function POST(request: Request) {
  const response = await postV1OrgMembers(request);
  return setDeprecationHeaders(response, "/api/v1/org/members");
}
