import MemberHome from "./member-home";
import { getAmaonUser } from "./auth";
import { readProfileEntry } from "./profile-entry-data";
import { readRecentPlayerProfiles } from "./recent-player-data";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const userPromise = getAmaonUser();
  const params = await searchParams;
  const team = typeof params.team === "string" ? params.team : "";
  const player = typeof params.player === "string" ? params.player : "";
  const initialProfile = team && player ? { team, player } : null;
  const [user, profileEntry, recentPlayers] = await Promise.all([
    userPromise,
    initialProfile ? readProfileEntry(team, player).catch(() => null) : null,
    initialProfile ? Promise.resolve([]) : readRecentPlayerProfiles().catch(() => []),
  ]);
  return <MemberHome signedIn={Boolean(user)} initialProfile={initialProfile} profileEntry={profileEntry} recentPlayers={recentPlayers} />;
}
