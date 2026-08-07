import { adminRole, isAuthenticatedRequest } from "../../admin";

export async function GET(request: Request) {
  if (!isAuthenticatedRequest(request)) return Response.json({ isAdmin: false, role: null }, { status: 401 });
  const role = adminRole(request);
  return Response.json({ isAdmin: role !== null, role }, { headers: { "cache-control": "no-store" } });
}
