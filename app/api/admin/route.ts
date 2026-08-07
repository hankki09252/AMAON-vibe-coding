import { adminRole } from "../../admin";

export async function GET(request: Request) {
  const role = adminRole(request);
  return Response.json({ isAdmin: role !== null, role }, { headers: { "cache-control": "no-store" } });
}
