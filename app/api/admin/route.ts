import { apiAdmin } from "../../api-auth";

export async function GET(request: Request) {
  void request;
  const { user, role } = await apiAdmin();
  if (!user) return Response.json({ isAdmin: false, role: null }, { status: 401 });
  return Response.json({ isAdmin: role !== null, role }, { headers: { "cache-control": "no-store" } });
}
