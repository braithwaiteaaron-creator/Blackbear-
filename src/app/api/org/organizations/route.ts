import { setDeprecationHeaders } from "@/app/api/v1/route-config";
import {
  GET as getV1OrgOrganizations,
  POST as postV1OrgOrganizations,
} from "@/app/api/v1/org/organizations/route";

export async function GET() {
  const response = await getV1OrgOrganizations();
  return setDeprecationHeaders(response, "/api/v1/org/organizations");
}

export async function POST(request: Request) {
  const response = await postV1OrgOrganizations(request);
  return setDeprecationHeaders(response, "/api/v1/org/organizations");
}
