import MemberHome from "./member-home";
import { getAmaonUser } from "./auth";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [user, params] = await Promise.all([getAmaonUser(), searchParams]);
  const team = typeof params.team === "string" ? params.team : "";
  const player = typeof params.player === "string" ? params.player : "";
  const initialProfile = team && player ? { team, player } : null;
  return <MemberHome signedIn={Boolean(user)} initialProfile={initialProfile} />;
}
