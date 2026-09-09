import MemberHome from "./member-home";
import type { Metadata } from "next";
import { getAmaonUser } from "./auth";
import { readProfileEntry } from "./profile-entry-data";
import { readRecentPlayerProfiles } from "./recent-player-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const url = new URL("https://www.amaon.kr/");
  if (typeof params.team === "string" && typeof params.player === "string") {
    url.searchParams.set("team", params.team);
    url.searchParams.set("player", params.player);
  }
  return { alternates: { canonical: url.toString() } };
}

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
  return <>{!initialProfile && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "아마온", alternateName: ["아마ON", "AMAON"], url: "https://www.amaon.kr/" }) }} />}<MemberHome signedIn={Boolean(user)} initialProfile={initialProfile} profileEntry={profileEntry} recentPlayers={recentPlayers} /></>;
}
