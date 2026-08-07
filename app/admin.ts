import { env } from "cloudflare:workers";

function adminEmails() {
  const value = (env as unknown as { ADMIN_EMAILS?: string }).ADMIN_EMAILS ?? "";
  return value.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function adminRole(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return null;
  const emails = adminEmails();
  const index = emails.indexOf(email);
  if (index < 0) return null;
  return index === 0 ? "admin" : "assistant";
}

export function isAdminRequest(request: Request) {
  return adminRole(request) !== null;
}
