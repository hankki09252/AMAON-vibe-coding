import MemberHome from "./member-home";
import { getAmaonUser } from "./auth";
import { readProfileEntry } from "./profile-entry-data";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const userPromise = getAmaonUser();
  const params = await searchParams;
  const team = typeof params.team === "string" ? params.team : "";
  const player = typeof params.player === "string" ? params.player : "";
  const initialProfile = team && player ? { team, player } : null;
  const [user, profileEntry] = await Promise.all([
    userPromise,
    initialProfile ? readProfileEntry(team, player).catch(() => null) : null,
  ]);
  return <MemberHome signedIn={Boolean(user)} initialProfile={initialProfile} profileEntry={profileEntry} />;
}
