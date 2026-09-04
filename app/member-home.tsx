"use client";

// Public browsing; member actions remain protected by server API checks.

import Image from "next/image";
import { schools } from "./school-catalog";
import { FormEvent, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import GdRoster, { gdPlayers, TeamRoster, type ManagedRosterPlayer } from "./gd-roster";
import GyeonggiRoster, { players as gyeonggiPlayers } from "./gyeonggi-roster";
import GyeongsangRoster, { players as gyeongsangPlayers } from "./gyeongsang-roster";
import KyungdongRoster, { players as kyungdongPlayers } from "./kyungdong-roster";
import GangneungRoster, { players as gangneungPlayers } from "./gangneung-roster";
import DeoksuRoster, { players as deoksuPlayers } from "./deoksu-roster";
import MyeongjiRoster, { players as myeongjiPlayers } from "./myeongji-roster";
import BaemyeongRoster, { players as baemyeongPlayers } from "./baemyeong-roster";
import BaekjaeRoster, { players as baekjaePlayers } from "./baekjae-roster";
import SeoulHgRoster, { players as seoulHgPlayers } from "./seoul-hg-roster";
import SeoulHkRoster, { players as seoulHkPlayers } from "./seoul-hk-roster";
import SeoulRoster, { players as seoulPlayers } from "./seoul-roster";
import SeoulDongsanRoster, { players as seoulDongsanPlayers } from "./seoul-dongsan-roster";
import SeoulDesignRoster, { players as seoulDesignPlayers } from "./seoul-design-roster";
import SeoulItRoster, { players as seoulItPlayers } from "./seoul-it-roster";
import SeoulAutoRoster, { players as seoulAutoPlayers } from "./seoul-auto-roster";
import SeoulConventionRoster, { players as seoulConventionPlayers } from "./seoul-convention-roster";
import SunrinRoster, { players as sunrinPlayers } from "./sunrin-roster";
import SeongnamRoster, { players as seongnamPlayers } from "./seongnam-roster";
import SemyeongRoster, { players as semyeongPlayers } from "./semyeong-roster";
import GyeonggiAviationRoster, { players as gyeonggiAviationPlayers } from "./gyeonggi-aviation-roster";
import GyeongminItRoster, { players as gyeongminItPlayers } from "./gyeongmin-it-roster";
import GimpoScienceRoster, { players as gimpoSciencePlayers } from "./gimpo-science-roster";
import RaonRoster, { players as raonPlayers } from "./raon-roster";
import BaeksongRoster, { players as baeksongPlayers } from "./baeksong-roster";
import BuwonRoster, { players as buwonPlayers } from "./buwon-roster";
import BibongRoster, { players as bibongPlayers } from "./bibong-roster";
import SangwooRoster, { players as sangwooPlayers } from "./sangwoo-roster";
import SewonRoster, { players as sewonPlayers } from "./sewon-roster";
import SoraeRoster, { players as soraePlayers } from "./sorae-roster";
import SuwonRoster, { players as suwonPlayers } from "./suwon-roster";
import ShinheungRoster, { players as shinheungPlayers } from "./shinheung-roster";
import AnsanTechnicalRoster, { players as ansanTechnicalPlayers } from "./ansan-technical-roster";
import PwaInstallButton from "./pwa-install-button";
import VideoRankings from "./video-rankings";
import CommunityBoard from "./community-board";
import { managedTeamOptions } from "./team-directory";
import { createSupabaseBrowserClient } from "./supabase/browser";
import { ProfileEntryContext, type ProfileEntryData } from "./profile-entry-context";
import type { RecentPlayerProfile } from "./recent-player-data";


type TeamDirectoryAsset = { key: string; url: string; uploadedAt: string };
type TeamDirectoryAssets = Record<string, { banner?: string; emblem?: string }>;



const regions = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "세종"];
const defaultVisibleRegions = ["경기", "인천"];
const schoolRegionByName = Object.fromEntries(schools.map((school) => [school.name, school.region]));

const rosterSectionBySchool: Record<string, string> = Object.fromEntries(
  managedTeamOptions.map((team) => [team.label, team.id]),
);
const schoolByRosterSection = Object.fromEntries(Object.entries(rosterSectionBySchool).map(([school, sectionId]) => [sectionId, school]));

const customRosterComponents: Record<string, ComponentType> = {
  "gd-roster": GdRoster,
  "gyeonggi-roster": GyeonggiRoster,
  "gyeongsang-roster": GyeongsangRoster,
  "kyungdong-roster": KyungdongRoster,
  "gangneung-roster": GangneungRoster,
  "deoksu-roster": DeoksuRoster,
  "myeongji-roster": MyeongjiRoster,
  "baemyeong-roster": BaemyeongRoster,
  "baekjae-roster": BaekjaeRoster,
  "seoul-hg-roster": SeoulHgRoster,
  "seoul-hk-roster": SeoulHkRoster,
  "seoul-roster": SeoulRoster,
  "seoul-dongsan-roster": SeoulDongsanRoster,
  "seoul-design-roster": SeoulDesignRoster,
  "seoul-it-roster": SeoulItRoster,
  "seoul-auto-roster": SeoulAutoRoster,
  "seoul-convention-roster": SeoulConventionRoster,
  "sunrin-roster": SunrinRoster,
  "seongnam-roster": SeongnamRoster,
  "semyeong-roster": SemyeongRoster,
  "gyeonggi-aviation-roster": GyeonggiAviationRoster,
  "gyeongmin-it-roster": GyeongminItRoster,
  "gimpo-science-roster": GimpoScienceRoster,
  "raon-roster": RaonRoster,
  "baeksong-roster": BaeksongRoster,
  "buwon-roster": BuwonRoster,
  "bibong-roster": BibongRoster,
  "sangwoo-roster": SangwooRoster,
  "sewon-roster": SewonRoster,
  "sorae-roster": SoraeRoster,
  "suwon-roster": SuwonRoster,
  "shinheung-roster": ShinheungRoster,
  "ansan-technical-roster": AnsanTechnicalRoster,
};

const playerSearchIndex = [
  ...gdPlayers.map((player) => ({ player, school: "GD챌린저스BC(U-18)", sectionId: "gd-roster" })),
  ...gyeonggiPlayers.map((player) => ({ player, school: "경기고", sectionId: "gyeonggi-roster" })),
  ...gyeongsangPlayers.map((player) => ({ player, school: "경기상업고", sectionId: "gyeongsang-roster" })),
  ...kyungdongPlayers.map((player) => ({ player, school: "경동고", sectionId: "kyungdong-roster" })),
  ...gangneungPlayers.map((player) => ({ player, school: "강릉고", sectionId: "gangneung-roster" })),
  ...deoksuPlayers.map((player) => ({ player, school: "덕수고", sectionId: "deoksu-roster" })),
  ...myeongjiPlayers.map((player) => ({ player, school: "명지BC(U-18)", sectionId: "myeongji-roster" })),
  ...baemyeongPlayers.map((player) => ({ player, school: "배명고", sectionId: "baemyeong-roster" })),
  ...baekjaePlayers.map((player) => ({ player, school: "배재고", sectionId: "baekjae-roster" })),
  ...seoulHgPlayers.map((player) => ({ player, school: "서울HG야구단(U-18)", sectionId: "seoul-hg-roster" })),
  ...seoulHkPlayers.map((player) => ({ player, school: "서울HK야구단(U-18)", sectionId: "seoul-hk-roster" })),
  ...seoulPlayers.map((player) => ({ player, school: "서울고", sectionId: "seoul-roster" })),
  ...seoulDongsanPlayers.map((player) => ({ player, school: "서울동산고", sectionId: "seoul-dongsan-roster" })),
  ...seoulDesignPlayers.map((player) => ({ player, school: "서울디자인고", sectionId: "seoul-design-roster" })),
  ...seoulItPlayers.map((player) => ({ player, school: "서울아이티고BC", sectionId: "seoul-it-roster" })),
  ...seoulAutoPlayers.map((player) => ({ player, school: "서울자동차고", sectionId: "seoul-auto-roster" })),
  ...seoulConventionPlayers.map((player) => ({ player, school: "서울컨벤션고", sectionId: "seoul-convention-roster" })),
  ...sunrinPlayers.map((player) => ({ player, school: "선린인터넷고", sectionId: "sunrin-roster" })),
  ...seongnamPlayers.map((player) => ({ player, school: "성남고", sectionId: "seongnam-roster" })),
  ...semyeongPlayers.map((player) => ({ player, school: "세명컴퓨터고야구단", sectionId: "semyeong-roster" })),
  ...gyeonggiAviationPlayers.map((player) => ({ player, school: "경기항공고", sectionId: "gyeonggi-aviation-roster" })),
  ...gyeongminItPlayers.map((player) => ({ player, school: "경민IT고", sectionId: "gyeongmin-it-roster" })),
  ...gimpoSciencePlayers.map((player) => ({ player, school: "김포과학기술고", sectionId: "gimpo-science-roster" })),
  ...raonPlayers.map((player) => ({ player, school: "라온고", sectionId: "raon-roster" })),
  ...baeksongPlayers.map((player) => ({ player, school: "백송고", sectionId: "baeksong-roster" })),
  ...buwonPlayers.map((player) => ({ player, school: "부원고야구단", sectionId: "buwon-roster" })),
  ...bibongPlayers.map((player) => ({ player, school: "비봉고", sectionId: "bibong-roster" })),
  ...sangwooPlayers.map((player) => ({ player, school: "상우고야구단", sectionId: "sangwoo-roster" })),
  ...sewonPlayers.map((player) => ({ player, school: "세원고", sectionId: "sewon-roster" })),
  ...soraePlayers.map((player) => ({ player, school: "소래고", sectionId: "sorae-roster" })),
  ...suwonPlayers.map((player) => ({ player, school: "수원야구단(U-18)", sectionId: "suwon-roster" })),
  ...shinheungPlayers.map((player) => ({ player, school: "신흥고", sectionId: "shinheung-roster" })),
  ...ansanTechnicalPlayers.map((player) => ({ player, school: "안산공업고", sectionId: "ansan-technical-roster" })),
];

type ProfileTarget = { team: string; player: string };

export default function Home({ signedIn = false, initialProfile = null, profileEntry = null, recentPlayers = [] }: { signedIn?: boolean; initialProfile?: ProfileTarget | null; profileEntry?: ProfileEntryData | null; recentPlayers?: RecentPlayerProfile[] }) {
  const [pendingProfile, setPendingProfile] = useState<ProfileTarget | null>(profileEntry ? null : initialProfile);
  const [profileEntryError, setProfileEntryError] = useState("");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체");
  const [playerDirectoryQuery, setPlayerDirectoryQuery] = useState("");
  const [playerDirectoryRegion, setPlayerDirectoryRegion] = useState("전체");
  const [visibleRegions, setVisibleRegions] = useState(profileEntry?.visibleRegions ?? defaultVisibleRegions);
  const [regionDraft, setRegionDraft] = useState(defaultVisibleRegions);
  const [editingRegions, setEditingRegions] = useState<string[]>([]);
  const [regionEditingDraft, setRegionEditingDraft] = useState<string[]>([]);
  const [regionEditorRegion, setRegionEditorRegion] = useState("서울");
  const [isAdmin, setIsAdmin] = useState(false);
  const [regionSettingsOpen, setRegionSettingsOpen] = useState(false);
  const [savingRegions, setSavingRegions] = useState(false);
  const [regionNotice, setRegionNotice] = useState("");
  const [managedRosterPlayers, setManagedRosterPlayers] = useState<ManagedRosterPlayer[]>([]);
  const [teamDirectoryAssets, setTeamDirectoryAssets] = useState<TeamDirectoryAssets>({});
  const [activeRosterSection, setActiveRosterSection] = useState<string | null>(profileEntry?.team ?? null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [supportCopyNotice, setSupportCopyNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState("top");
  const [showMobileBack, setShowMobileBack] = useState(false);
  const recentPlayersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/region-visibility", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
      fetch("/api/admin", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
      initialProfile ? Promise.resolve({ items: [] }) : fetch("/api/roster-players", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
    ]).then(([visibility, admin, rosterManagement]) => {
      if (initialProfile) {
        const region = schoolRegionByName[schoolByRosterSection[initialProfile.team]];
        if (!visibility || !rosterManagement) setProfileEntryError("선수 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
        else if (!region || (!admin?.isAdmin && !visibility.visibleRegions?.includes(region))) setProfileEntryError("공개된 선수 프로필을 찾을 수 없습니다.");
      }
      if (Array.isArray(visibility?.visibleRegions) && visibility.visibleRegions.length) {
        setVisibleRegions(visibility.visibleRegions);
        setRegionDraft(visibility.visibleRegions);
      }
      if (Array.isArray(visibility?.editingRegions)) {
        setEditingRegions(visibility.editingRegions);
        setRegionEditingDraft(visibility.editingRegions);
        const firstSafeRegion = visibility.editingRegions[0]
          ?? regions.slice(1).find((item) => !visibility.visibleRegions?.includes(item));
        if (firstSafeRegion) setRegionEditorRegion(firstSafeRegion);
      }
      setIsAdmin(Boolean(admin?.isAdmin));
      if (Array.isArray(rosterManagement?.items)) setManagedRosterPlayers(rosterManagement.items);
    }).catch(() => {
      if (initialProfile) setProfileEntryError("선수 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
    });
  }, []);

  useEffect(() => {
    if (!initialProfile || pendingProfile) return;
    void fetch("/api/roster-players", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (Array.isArray(data?.items)) setManagedRosterPlayers(data.items); })
      .catch(() => undefined);
  }, [initialProfile, pendingProfile]);

  useEffect(() => {
    if (!pendingProfile) return;
    function finishEntry(event: Event) {
      const detail = (event as CustomEvent<{ team: string; player: string; ready: boolean }>).detail;
      if (detail?.team !== pendingProfile?.team || detail.player !== pendingProfile.player) return;
      if (detail.ready) setPendingProfile(null);
      else setProfileEntryError("공개된 선수 프로필을 찾을 수 없습니다.");
    }
    const timeout = window.setTimeout(() => setProfileEntryError("연결이 지연되고 있습니다. 다시 시도해 주세요."), 15000);
    window.addEventListener("amaon:profile-ready", finishEntry);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("amaon:profile-ready", finishEntry);
    };
  }, [pendingProfile]);

  useEffect(() => {
    if (pendingProfile) return; // Prioritize the shared player over the home directory assets.
    const teamIds = [...new Set(Object.values(rosterSectionBySchool))];
    const loadAssets = async () => {
      async function loadAssetKind(kind: "banners" | "emblems") {
        const chunks = Array.from({ length: Math.ceil(teamIds.length / 50) }, (_, index) =>
          teamIds.slice(index * 50, (index + 1) * 50),
        );
        const responses = await Promise.all(chunks.map((chunk) =>
          fetch(`/api/team-${kind}?teamIds=${encodeURIComponent(chunk.join(","))}`),
        ));
        const payloads = await Promise.all(responses.map(async (response) => response.ok
          ? (await response.json() as { items?: Record<string, TeamDirectoryAsset | null> }).items ?? {}
          : {},
        ));
        return Object.assign({}, ...payloads) as Record<string, TeamDirectoryAsset | null>;
      }

      const [banners, emblems] = await Promise.all([
        loadAssetKind("banners"),
        loadAssetKind("emblems"),
      ]);
      setTeamDirectoryAssets(Object.fromEntries(Object.values(rosterSectionBySchool).map((teamId) => [teamId, {
        banner: banners[teamId]?.url || undefined,
        emblem: emblems[teamId]?.url || undefined,
      }])));
    };
    void loadAssets().catch(() => undefined);

    function syncTeamAsset(event: Event) {
      const detail = (event as CustomEvent<{ teamId?: string; kind?: "banner" | "emblem"; url?: string }>).detail;
      if (!detail?.teamId || !detail.kind) return;
      const teamId = detail.teamId;
      const kind = detail.kind;
      setTeamDirectoryAssets((current) => ({
        ...current,
        [teamId]: { ...current[teamId], [kind]: detail.url || undefined },
      }));
    }
    window.addEventListener("amaon:team-asset-changed", syncTeamAsset);
    return () => window.removeEventListener("amaon:team-asset-changed", syncTeamAsset);
  }, [pendingProfile]);

  useEffect(() => {
    function syncRosterChange(event: Event) {
      const item = (event as CustomEvent<ManagedRosterPlayer>).detail;
      if (!item?.playerId) return;
      setManagedRosterPlayers((current) => [
        ...current.filter((change) => change.playerId !== item.playerId),
        item,
      ]);
    }
    window.addEventListener("amaon:roster-changed", syncRosterChange);
    return () => window.removeEventListener("amaon:roster-changed", syncRosterChange);
  }, []);

  useEffect(() => {
    if (region !== "전체" && !visibleRegions.includes(region)) setRegion("전체");
    if (playerDirectoryRegion !== "전체" && !visibleRegions.includes(playerDirectoryRegion)) setPlayerDirectoryRegion("전체");
  }, [playerDirectoryRegion, region, visibleRegions]);

  useEffect(() => {
    function syncMobileNavigation() {
      const hash = window.location.hash.replace(/^#/, "") || "top";
      const params = new URLSearchParams(window.location.search);
      const requestedRoster = hash.endsWith("-roster") ? hash : params.get("team");
      setActiveRosterSection(requestedRoster && schoolByRosterSection[requestedRoster] ? requestedRoster : null);
      if (params.has("player") || hash === "players") setActiveMobileSection("players");
      else if (hash === "video-ranking") setActiveMobileSection("video-ranking");
      else if (hash === "community") setActiveMobileSection("community");
      else if (hash === "how") setActiveMobileSection("how");
      else if (hash === "schools" || hash.endsWith("-roster")) setActiveMobileSection("schools");
      else setActiveMobileSection("top");
      setShowMobileBack(params.has("player") || hash.endsWith("-roster"));
      setMobileMenuOpen(false);
    }
    syncMobileNavigation();
    window.addEventListener("hashchange", syncMobileNavigation);
    window.addEventListener("popstate", syncMobileNavigation);
    return () => {
      window.removeEventListener("hashchange", syncMobileNavigation);
      window.removeEventListener("popstate", syncMobileNavigation);
    };
  }, []);

  useEffect(() => {
    if (!activeRosterSection || new URLSearchParams(window.location.search).has("player") || window.location.hash !== `#${activeRosterSection}`) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(activeRosterSection);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeRosterSection]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!guideOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeGuideOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setGuideOpen(false);
    }
    window.addEventListener("keydown", closeGuideOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeGuideOnEscape);
    };
  }, [guideOpen]);

  const publishedSchools = useMemo(
    () => schools.filter((school) => visibleRegions.includes(school.region)),
    [visibleRegions],
  );
  const availableRegions = useMemo(
    () => ["전체", ...regions.slice(1).filter((item) => visibleRegions.includes(item))],
    [visibleRegions],
  );
  const currentPlayerSearchIndex = useMemo(() => {
    const changes = new Map(managedRosterPlayers.map((item) => [item.playerId, item]));
    const merged = playerSearchIndex.flatMap((item) => {
      const change = changes.get(item.player.id);
      if (!change) return [item];
      if (change.hidden || change.teamId !== item.sectionId) return [];
      return [{ player: change.player, school: schoolByRosterSection[change.teamId] || item.school, sectionId: change.teamId }];
    });
    const existing = new Set(merged.map((item) => item.player.id));
    managedRosterPlayers.forEach((change) => {
      if (!change.hidden && !existing.has(change.playerId) && schoolByRosterSection[change.teamId]) {
        merged.push({ player: change.player, school: schoolByRosterSection[change.teamId], sectionId: change.teamId });
        existing.add(change.playerId);
      }
    });
    return merged;
  }, [managedRosterPlayers]);
  const publishedPlayerSearchIndex = useMemo(
    () => currentPlayerSearchIndex.filter((item) => visibleRegions.includes(schoolRegionByName[item.school])),
    [currentPlayerSearchIndex, visibleRegions],
  );
  const publishedPlayerCount = useMemo(
    () => publishedPlayerSearchIndex.length,
    [publishedPlayerSearchIndex],
  );
  const recentPlayerCards = useMemo(() => recentPlayers.flatMap((recent) => {
    const directoryEntry = currentPlayerSearchIndex.find((item) => item.player.id === recent.playerId && item.sectionId === recent.teamId);
    if (!directoryEntry || !visibleRegions.includes(schoolRegionByName[directoryEntry.school])) return [];
    return [{ recent, directoryEntry }];
  }).slice(0, 10), [currentPlayerSearchIndex, recentPlayers, visibleRegions]);
  const filteredPlayerDirectory = useMemo(() => {
    const keyword = playerDirectoryQuery.trim().replace(/\s+/g, "").toLowerCase();
    return publishedPlayerSearchIndex.filter(({ player, school }) => {
      const schoolRegion = schoolRegionByName[school];
      const matchesRegion = playerDirectoryRegion === "전체" || schoolRegion === playerDirectoryRegion;
      const searchable = `${player.name}${school}${player.position}${player.grade}${player.number}`.replace(/\s+/g, "").toLowerCase();
      return matchesRegion && (!keyword || searchable.includes(keyword));
    });
  }, [playerDirectoryQuery, playerDirectoryRegion, publishedPlayerSearchIndex]);
  const visiblePlayerDirectory = useMemo(() => filteredPlayerDirectory.slice(0, 48), [filteredPlayerDirectory]);
  const regionEditorSchools = useMemo(
    () => schools.filter((school) => school.region === regionEditorRegion && rosterSectionBySchool[school.name]),
    [regionEditorRegion],
  );
  const activeRosterSchool = activeRosterSection
    ? (isAdmin ? schools : publishedSchools).find((school) => rosterSectionBySchool[school.name] === activeRosterSection)
    : undefined;
  const ActiveRosterComponent = activeRosterSection ? customRosterComponents[activeRosterSection] : undefined;

  const filteredSchools = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return publishedSchools.filter((school) => {
      const matchesRegion = region === "전체" || school.region === region;
      const matchesQuery = !keyword || `${school.name} ${school.region} ${school.coach}`.toLowerCase().includes(keyword);
      return matchesRegion && matchesQuery;
    });
  }, [publishedSchools, query, region]);

  const matchingPlayers = useMemo(() => {
    const keyword = query.trim().replace(/\s+/g, "").toLowerCase();
    if (!keyword) return [];
    return publishedPlayerSearchIndex.filter(({ player }) => player.name.replace(/\s+/g, "").toLowerCase().includes(keyword)).slice(0, 8);
  }, [publishedPlayerSearchIndex, query]);

  function jumpToSection(sectionId: string) {
    const isRosterSection = sectionId.endsWith("-roster") && Boolean(schoolByRosterSection[sectionId]);
    if (isRosterSection) setActiveRosterSection(sectionId);
    else setActiveRosterSection(null);
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.history.pushState({ amaonView: "section", sectionId }, "", `#${sectionId}`);
    setActiveMobileSection(sectionId.endsWith("-roster") ? "schools" : sectionId);
    setShowMobileBack(sectionId.endsWith("-roster"));
    setMobileMenuOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(sectionId);
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, left: 0, behavior: "auto" });
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    });
  }

  function mobileGoBack() {
    const url = new URL(window.location.href);
    const teamId = url.searchParams.get("team");
    if (url.searchParams.has("player")) {
      url.searchParams.delete("player");
      url.hash = teamId || "schools";
      window.location.assign(url.toString());
      return;
    }
    jumpToSection("schools");
  }

  function openSearchedPlayer(result: (typeof currentPlayerSearchIndex)[number]) {
    setProfileEntryError("");
    setPendingProfile({ team: result.sectionId, player: result.player.id });
    const url = new URL(window.location.href);
    url.searchParams.set("team", result.sectionId);
    url.searchParams.set("player", result.player.id);
    url.searchParams.delete("media");
    url.hash = result.sectionId;
    window.history.pushState({ amaonView: "player", team: result.sectionId, player: result.player.id }, "", url);
    setActiveRosterSection(result.sectionId);
    setActiveMobileSection("players");
    setShowMobileBack(true);
    setMobileMenuOpen(false);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function runMainSearch() {
    const keyword = query.trim().replace(/\s+/g, "").toLowerCase();
    const exactPlayers = publishedPlayerSearchIndex.filter(({ player }) => player.name.replace(/\s+/g, "").toLowerCase() === keyword);
    const playerMatch = exactPlayers.length === 1 ? exactPlayers[0] : exactPlayers.length === 0 && matchingPlayers.length === 1 ? matchingPlayers[0] : null;
    if (playerMatch) {
      openSearchedPlayer(playerMatch);
      return;
    }
    if (exactPlayers.length > 1 || matchingPlayers.length > 1) return;

    const exactMatch = publishedSchools.find((school) => school.name.replace(/\s+/g, "").toLowerCase() === keyword);
    const match = exactMatch ?? (filteredSchools.length === 1 ? filteredSchools[0] : null);

    if (match) setRegion(match.region);
    const sectionId = match ? rosterSectionBySchool[match.name] : undefined;
    requestAnimationFrame(() => jumpToSection(sectionId ?? "schools"));
  }

  function scrollRecentPlayers(direction: -1 | 1) {
    const track = recentPlayersRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(280, track.clientWidth * .82), behavior: "smooth" });
  }

  function searchSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runMainSearch();
  }

  function openPlayerDirectorySearchResult() {
    const keyword = playerDirectoryQuery.trim().replace(/\s+/g, "").toLowerCase();
    if (!keyword) return;
    const exactPlayers = filteredPlayerDirectory.filter(({ player }) => player.name.replace(/\s+/g, "").toLowerCase() === keyword);
    const playerMatch = exactPlayers.length === 1
      ? exactPlayers[0]
      : exactPlayers.length === 0 && filteredPlayerDirectory.length === 1
        ? filteredPlayerDirectory[0]
        : null;
    if (playerMatch) openSearchedPlayer(playerMatch);
  }

  function setRegionStatus(item: string, status: "public" | "editing" | "hidden") {
    setRegionNotice("");
    setRegionDraft((current) => status === "public"
      ? [...current.filter((regionName) => regionName !== item), item]
      : current.filter((regionName) => regionName !== item));
    setRegionEditingDraft((current) => status === "editing"
      ? [...current.filter((regionName) => regionName !== item), item]
      : current.filter((regionName) => regionName !== item));
    if (status === "editing") setRegionEditorRegion(item);
  }

  async function saveRegionVisibility() {
    if (!regionDraft.length) {
      setRegionNotice("공개할 지역을 한 곳 이상 선택해 주세요.");
      return;
    }
    const newlyPublic = regionDraft.filter((item) => !visibleRegions.includes(item));
    if (newlyPublic.length && !window.confirm(`${newlyPublic.join(", ")} 지역을 지금 공개할까요? 공개 즉시 일반 회원의 학교·선수 검색에 표시됩니다.`)) return;
    setSavingRegions(true);
    setRegionNotice("");
    try {
      const response = await fetch("/api/region-visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibleRegions: regionDraft, editingRegions: regionEditingDraft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "설정을 저장하지 못했습니다.");
      setVisibleRegions(result.visibleRegions);
      setRegionDraft(result.visibleRegions);
      setEditingRegions(result.editingRegions || []);
      setRegionEditingDraft(result.editingRegions || []);
      setRegionNotice("지역 상태를 저장했습니다. ‘편집 중’ 지역은 운영자에게만 표시됩니다.");
    } catch (error) {
      setRegionNotice(error instanceof Error ? error.message : "설정을 저장하지 못했습니다.");
    } finally {
      setSavingRegions(false);
    }
  }

  async function copySupportAccount() {
    try {
      await navigator.clipboard.writeText("302-2177-2877-01");
      setSupportCopyNotice("계좌번호가 복사되었습니다.");
    } catch {
      setSupportCopyNotice("계좌번호를 길게 눌러 복사해 주세요.");
    }
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const { error } = await createSupabaseBrowserClient().auth.signOut();
    if (error) {
      setSigningOut(false);
      window.alert("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    window.location.replace("/");
  }

  return (
    <main className={`member-home${pendingProfile ? " profile-entry-pending" : ""}`}>
      {pendingProfile && <div className="profile-entry-gate" role={profileEntryError ? "alert" : "status"} aria-live="polite">
        <div><small>AMAON · PLAYER PROFILE</small><strong>{profileEntryError || "선수 프로필을 준비하고 있습니다"}</strong>
          {profileEntryError ? <p><button type="button" onClick={() => window.location.reload()}>다시 시도</button><a href="/">아마ON 홈으로</a></p>
            : <p>잠시만 기다려 주세요.</p>}
        </div>
      </div>}
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label="아마ON 홈">
          <Image
            className="brand-logo-image"
            src="/yamaon-logo.png"
            alt="아마ON by 한끼방패"
            width={72}
            height={72}
            priority
          />
        </a>
        <nav aria-label="주요 메뉴">
          <button type="button" className="topbar-guide-link" onClick={() => setGuideOpen(true)}>아마ON 안내</button>
          <a href="#schools">학교 찾기</a>
          <a href="#schools">경기·인천 학교</a>
          <a href="#players">선수 프로필</a>
          <a href="#community">커뮤니티</a>
        </nav>
        <PwaInstallButton />
        {signedIn ? <button className="outline-button" onClick={() => jumpToSection("community")}>내 회원정보</button> : <a className="outline-button" href="/login">로그인</a>}
        {signedIn ? <button type="button" className="logout-button" onClick={() => void signOut()} disabled={signingOut}>{signingOut ? "로그아웃 중…" : "로그아웃"}</button> : <a className="logout-button" href="/login?mode=signup">회원가입</a>}
        <div className="mobile-top-actions">
          <button type="button" className="mobile-account-button" onClick={() => signedIn ? jumpToSection("community") : window.location.assign("/login")} aria-label={signedIn ? "내 회원정보" : "로그인"}>
            <span className="mobile-account-glyph" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="전체 메뉴 열기"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-site-menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-drawer-backdrop${mobileMenuOpen ? " open" : ""}`} onMouseDown={() => setMobileMenuOpen(false)}>
        <aside id="mobile-site-menu" className="mobile-drawer" aria-label="모바일 전체 메뉴" onMouseDown={(event) => event.stopPropagation()}>
          <div className="mobile-drawer-head">
            <div><small>AMAON MENU</small><strong>메뉴</strong></div>
            <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="메뉴 닫기">×</button>
          </div>
          <button type="button" className="mobile-member-card" onClick={() => signedIn ? jumpToSection("community") : window.location.assign("/login")}>
            <span className="mobile-account-glyph" aria-hidden="true" />
            <span><small>MEMBER</small><strong>{signedIn ? "내 회원정보" : "로그인"}</strong></span>
            <b>→</b>
            </button>
            <nav className="mobile-drawer-nav" aria-label="전체 메뉴 항목">
              {[
                { id: "top", icon: "⌂", eyebrow: "HOME", label: "홈" },
                { id: "schools", icon: "▦", eyebrow: "TEAM", label: "학교 찾기" },
                { id: "players", icon: "◎", eyebrow: "PLAYER", label: "선수 프로필" },
                { id: "video-ranking", icon: "▶", eyebrow: "FILM", label: "영상 TOP 5" },
                { id: "community", icon: "◌", eyebrow: "COMMUNITY", label: "커뮤니티" },
                { id: "how", icon: "＋", eyebrow: "GUIDE", label: "등록 안내" },
              ].map((item) => {
                const isActive = activeMobileSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={isActive ? "is-active" : ""}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => jumpToSection(item.id)}
                  >
                    <span className="mobile-drawer-icon" aria-hidden="true">{item.icon}</span>
                    <span className="mobile-drawer-label"><small>{item.eyebrow}</small><strong>{item.label}</strong></span>
                    <b aria-hidden="true">→</b>
                  </button>
                );
              })}
            </nav>
          <button type="button" className="mobile-guide-link" onClick={() => { setMobileMenuOpen(false); setGuideOpen(true); }}>
            <span><small>START HERE</small><strong>아마ON 사용설명서</strong></span><b>→</b>
          </button>
          {isAdmin && (
            <button type="button" className="mobile-admin-link" onClick={() => jumpToSection("schools")}>
              <span>운영자</span><strong>학교·선수 관리</strong><b>→</b>
            </button>
          )}
          <button type="button" className="mobile-logout-link" onClick={() => signedIn ? void signOut() : window.location.assign("/login?mode=signup")} disabled={signingOut}>
            <span><small>ACCOUNT</small><strong>{signedIn ? signingOut ? "로그아웃 중…" : "로그아웃" : "회원가입"}</strong></span><b>→</b>
          </button>
          <p className="mobile-drawer-note">학교와 선수 기록은 기존 데이터 그대로 유지됩니다.</p>
        </aside>
      </div>

      {showMobileBack && (
        <button type="button" className="mobile-context-back" onClick={mobileGoBack}>
          <span aria-hidden="true">←</span> 이전 화면
        </button>
      )}

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> PLAYER SPOTLIGHT PLATFORM</p>
          <h1 className="hero-purpose-title">
            <span className="hero-title-line">아마ON,</span><br />
            <em className="hero-purpose-line">이제는 선수를 알리는 시대.</em>
          </h1>
          <p className="hero-lead">
            기록을 넘어, 선수의 진정성과 가능성을 세상에 연결합니다.<br />
            선수와 부모가 함께 완성하는 단 하나의 야구 프로필.
          </p>
          <div className="hero-search-wrap">
            <form className="hero-search" onSubmit={searchSchool}>
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  runMainSearch();
                }}
                placeholder="학교명 또는 선수명 검색"
                aria-label="학교명 또는 선수명 검색"
              />
              <button type="submit">검색</button>
            </form>
            {matchingPlayers.length > 0 && (
              <div className="hero-search-results" aria-label="선수 검색 결과">
                {matchingPlayers.map((result) => (
                  <button type="button" key={`${result.sectionId}-${result.player.id}`} onClick={() => openSearchedPlayer(result)}>
                    <strong>{result.player.name}</strong>
                    <span>{result.school} · {result.player.position} · {result.player.grade}</span>
                    <em>{result.player.number}</em>
                  </button>
                ))}
              </div>
            )}
          </div>
          <aside className="hero-instagram-cta" aria-label="한끼방패 인스타그램 선수 등록 안내">
            <div>
              <small>PLAYER REGISTRATION · INSTAGRAM DM</small>
              <strong>선수 영상·사진·프로필을 보내주세요.</strong>
              <p>한끼방패 인스타그램 DM으로 보내주시면, 확인 후 아마ON 선수 프로필과 공유 링크를 만들어드립니다.</p>
            </div>
            <a href="https://ig.me/m/hankki09252" target="_blank" rel="noopener noreferrer">
              <span>인스타그램 DM으로 등록 신청</span><b aria-hidden="true">↗</b>
            </a>
          </aside>
          <button type="button" className="amaon-guide-trigger" onClick={() => setGuideOpen(true)}>
            <span>AMAON GUIDE</span>
            <strong>아마ON 사용설명서</strong>
            <small>선수 등록부터 SNS 프로필 공유까지 <b>→</b></small>
          </button>
          <div className="hero-counts" aria-label="현재 공개 현황">
            <div><strong>{publishedSchools.length}</strong><span>공개 학교</span></div>
            <div><strong>{publishedPlayerCount.toLocaleString()}</strong><span>등록 선수</span></div>
            <div><strong>{visibleRegions.length}</strong><span>공개 지역</span></div>
          </div>
        </div>

        <div className="hero-visual hero-dashboard" aria-label="아마ON 빠른 시작">
          <div className="score-grid" />
          <div className="hero-dashboard-shell">
            <div className="hero-dashboard-head">
              <span className="hero-dashboard-live"><i /> LIVE DIRECTORY</span>
              <small>AMAON · 2026</small>
            </div>
            <div className="hero-dashboard-copy">
              <p>PLAYER FIRST PLATFORM</p>
              <h2>선수의 이름이<br /><em>하나의 브랜드가 되도록.</em></h2>
              <span>학교를 찾고, 선수의 영상을 보고, 프로필 링크를 공유하세요.</span>
            </div>
            <div className="hero-quick-grid">
              <button type="button" onClick={() => jumpToSection("schools")}><small>01 · TEAM</small><strong>학교 찾기</strong><span>{publishedSchools.length}팀 <b>→</b></span></button>
              <button type="button" onClick={() => jumpToSection("players")}><small>02 · PLAYER</small><strong>선수 보기</strong><span>{publishedPlayerCount.toLocaleString()}명 <b>→</b></span></button>
              <button type="button" onClick={() => jumpToSection("video-ranking")}><small>03 · FILM</small><strong>영상 TOP 5</strong><span>PLAY <b>→</b></span></button>
            </div>
            <div className="hero-dashboard-foot"><b>ON</b><span>DIRECT PROFILE · YOUTUBE FILM · COMMUNITY</span></div>
          </div>
        </div>
      </section>

      {!pendingProfile && recentPlayerCards.length > 0 && (
        <section className="recent-player-section" aria-labelledby="recent-player-title">
          <header className="recent-player-head">
            <div><small><i /> LIVE UPDATE</small><h2 id="recent-player-title">최근 업데이트된 선수 프로필</h2><p>새롭게 등록되거나 사진·영상·프로필이 업데이트된 선수를 만나보세요.</p></div>
            <div className="recent-player-controls" aria-label="최근 선수 프로필 슬라이드 이동">
              <button type="button" onClick={() => scrollRecentPlayers(-1)} aria-label="이전 선수 보기">←</button>
              <span>{String(recentPlayerCards.length).padStart(2, "0")} PLAYERS</span>
              <button type="button" onClick={() => scrollRecentPlayers(1)} aria-label="다음 선수 보기">→</button>
            </div>
          </header>
          <div className="recent-player-track" ref={recentPlayersRef}>
            {recentPlayerCards.map(({ recent, directoryEntry }, index) => (
              <button type="button" className="recent-player-card" key={`${recent.teamId}-${recent.playerId}`} onClick={() => openSearchedPlayer(directoryEntry)}>
                <span className="recent-player-photo">
                  {recent.cardImageUrl ? <Image src={recent.cardImageUrl} alt={`${directoryEntry.player.name} 선수 프로필 미리보기`} width={320} height={400} sizes="(max-width: 760px) 68vw, 260px" loading={index < 2 ? "eager" : "lazy"} /> : <b aria-hidden="true"><small>{directoryEntry.school.slice(0, 2)}</small>{directoryEntry.player.number}</b>}
                  <em>{recent.updateType}</em>
                </span>
                <span className="recent-player-info">
                  <small>{directoryEntry.school} · {directoryEntry.player.position}</small>
                  <strong><em>{directoryEntry.player.number}</em> {directoryEntry.player.name}</strong>
                  <span>{directoryEntry.player.grade}<b>{recent.updatedLabel} 업데이트 →</b></span>
                </span>
              </button>
            ))}
          </div>
          <p className="recent-player-swipe">좌우로 밀어 선수 프로필을 더 볼 수 있습니다. <span>↔</span></p>
        </section>
      )}

      {!pendingProfile && <VideoRankings players={publishedPlayerSearchIndex} visibleRegions={visibleRegions} schoolRegions={schoolRegionByName} onOpenPlayer={openSearchedPlayer} />}

      {!pendingProfile && <CommunityBoard signedIn={signedIn} />}

      <section className="school-section" id="schools">
        <div className="section-console-bar">
          <span><i /> 01 · TEAM DIRECTORY</span>
          <small>2026 · KOREA U-18 BASEBALL</small>
        </div>
        <div className="section-title">
          <div><p className="kicker dark"><span /> TEAM DIRECTORY</p><h2>학교별로 찾기</h2></div>
          <p>2026 고교야구 등록팀을 지역별로 살펴보세요.</p>
        </div>
        <div className="directory-stats" aria-label="현재 학교 검색 현황">
          <div><small>SELECTED REGION</small><strong>{region === "전체" ? "공개 전체" : region}</strong></div>
          <div><small>VISIBLE TEAMS</small><strong>{filteredSchools.length}<em> 팀</em></strong></div>
          <div><small>ROSTER SIZE</small><strong>{filteredSchools.reduce((sum, school) => sum + school.players, 0).toLocaleString()}<em> 명</em></strong></div>
          <span>팀 카드를 선택하면 등록 선수와 프로필로 바로 연결됩니다. <b>→</b></span>
        </div>
        {isAdmin && (
          <div className="region-admin">
            <button type="button" className="region-admin-toggle" onClick={() => { setRegionSettingsOpen((open) => !open); setRegionDraft(visibleRegions); setRegionEditingDraft(editingRegions); setRegionNotice(""); }}>
              지역 공개 설정 {regionSettingsOpen ? "닫기" : "열기"}
            </button>
            {regionSettingsOpen && (
              <div className="region-settings" aria-label="지역 공개 설정">
                <div><strong>지역 상태 관리</strong><span>‘편집 중’과 ‘숨김’ 지역은 일반 회원의 학교 목록·검색·선수 프로필에 표시되지 않습니다.</span></div>
                <div className="region-settings-grid">
                  {regions.slice(1).map((item) => {
                    const draftStatus = regionDraft.includes(item) ? "public" : regionEditingDraft.includes(item) ? "editing" : "hidden";
                    const savedStatus = visibleRegions.includes(item) ? "현재 공개" : editingRegions.includes(item) ? "현재 편집 중 · 비공개" : "현재 숨김";
                    return <article key={item} className={`region-status-card ${draftStatus}`}>
                      <div><strong>{item}</strong><small>{savedStatus}</small></div>
                      <div role="group" aria-label={`${item} 지역 상태`}>
                        <button type="button" className={draftStatus === "public" ? "active" : ""} aria-pressed={draftStatus === "public"} onClick={() => setRegionStatus(item, "public")}>공개</button>
                        <button type="button" className={draftStatus === "editing" ? "active" : ""} aria-pressed={draftStatus === "editing"} onClick={() => setRegionStatus(item, "editing")}>편집 중</button>
                        <button type="button" className={draftStatus === "hidden" ? "active" : ""} aria-pressed={draftStatus === "hidden"} onClick={() => setRegionStatus(item, "hidden")}>숨김</button>
                      </div>
                    </article>;
                  })}
                </div>
                <div className="region-settings-actions">
                  <button type="button" onClick={saveRegionVisibility} disabled={savingRegions}>{savingRegions ? "저장 중…" : "지역 상태 저장"}</button>
                  {regionNotice && <p>{regionNotice}</p>}
                </div>
                <section className="region-editor-workspace" aria-label="비공개 지역 학교와 선수 편집">
                  <div className="region-editor-head">
                    <div><small>ADMIN EDIT WORKSPACE</small><strong>비공개 상태로 학교·선수 편집</strong><p>이곳에서 학교를 열어도 지역 공개 상태는 바뀌지 않습니다.</p></div>
                    <label>편집할 지역<select value={regionEditorRegion} onChange={(event) => setRegionEditorRegion(event.target.value)}>{regions.slice(1).map((item) => <option key={item} value={item}>{item} · {regionDraft.includes(item) ? "공개" : regionEditingDraft.includes(item) ? "편집 중" : "숨김"}</option>)}</select></label>
                  </div>
                  <div className="region-editor-school-grid">
                    {regionEditorSchools.map((school) => {
                      const sectionId = rosterSectionBySchool[school.name];
                      return <button type="button" key={school.name} onClick={() => { if (sectionId) jumpToSection(sectionId); }}><span><small>{school.region}</small><strong>{school.name}</strong><em>감독 {school.coach} · {school.players}명</em></span><b>학교·선수 편집 →</b></button>;
                    })}
                  </div>
                  {!regionEditorSchools.length && <p className="region-editor-empty">이 지역에는 편집 가능한 학교 데이터가 없습니다.</p>}
                </section>
              </div>
            )}
          </div>
        )}
        <div className="filters" aria-label="지역 필터">
          {availableRegions.map((item) => (
            <button key={item} className={region === item ? "active" : ""} onClick={() => setRegion(item)}>{item}</button>
          ))}
        </div>
        <div className="directory-head"><span>TEAM / REGION</span><span>ROSTER</span></div>
        <div className="school-list">
          {filteredSchools.length ? filteredSchools.map((school, index) => {
            const sectionId = rosterSectionBySchool[school.name];
            const visual = sectionId ? teamDirectoryAssets[sectionId] : undefined;
            return <article
              className="school-row"
              key={school.name}
              role="button"
              tabIndex={0}
              aria-label={`${school.name} 선수단 보기`}
              onClick={() => jumpToSection(sectionId ?? "players")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  jumpToSection(sectionId ?? "players");
                }
              }}
            >
              <span className="school-index">{String(index + 1).padStart(2, "0")}</span>
              <div className={`school-banner-preview${visual?.banner || visual?.emblem ? " has-image" : ""}`} aria-hidden="true">
                {visual?.banner
                  ? <img src={visual.banner} alt="" loading="lazy" decoding="async" />
                  : visual?.emblem
                    ? <img className="emblem-image" src={visual.emblem} alt="" loading="lazy" decoding="async" />
                    : <span className="school-emblem">{school.name.slice(0, 1)}</span>}
              </div>
              <div className="school-name"><h3>{school.name}</h3><p>{school.region} · 감독 {school.coach}</p></div>
              {school.featured && <span className="verified">✓ 정보 확인</span>}
              <div className="roster"><strong>{school.players}</strong><span>명</span></div>
            </article>;
          }) : <div className="empty">조건에 맞는 학교가 없습니다. 다른 지역이나 검색어를 선택해 주세요.</div>}
        </div>
        <p className="data-note">학교·선수 수는 제공하신 2026년 자료를 바탕으로 구성한 시안 데이터입니다.</p>
      </section>

      <section className="player-section actual-player-directory" id="players">
        <div className="section-console-bar inverted">
          <span><i /> 02 · PLAYER DIRECTORY</span>
          <small>REAL ROSTER · PROFILE · STORY · FILM</small>
        </div>
        <div className="section-title light">
          <div><p className="kicker"><span /> PLAYER PROFILE DIRECTORY</p><h2>선수 프로필 찾기</h2></div>
          <p>공개된 학교 선수단을 이름·학교·포지션으로 검색하고 선수 프로필을 확인하세요.</p>
        </div>
        <div className="player-directory-summary" aria-label="선수 검색 현황">
          <div><small>PUBLIC REGION</small><strong>{playerDirectoryRegion === "전체" ? visibleRegions.join(" · ") : playerDirectoryRegion}</strong></div>
          <div><small>MATCHED PLAYERS</small><strong>{filteredPlayerDirectory.length.toLocaleString()}<em> 명</em></strong></div>
          <p>선수를 선택하면 사진·자기소개·영상이 있는 상세 프로필로 이동합니다.</p>
        </div>
        <div className="player-directory-tools">
          <label className="player-directory-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={playerDirectoryQuery}
              onChange={(event) => setPlayerDirectoryQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                openPlayerDirectorySearchResult();
              }}
              placeholder="선수 이름, 학교, 포지션 검색"
              aria-label="선수 이름, 학교, 포지션 검색"
            />
            {playerDirectoryQuery && <button type="button" onClick={() => setPlayerDirectoryQuery("")} aria-label="선수 검색어 지우기">×</button>}
          </label>
          <div className="player-directory-regions" aria-label="선수 지역 필터">
            {availableRegions.map((item) => <button key={item} type="button" className={playerDirectoryRegion === item ? "active" : ""} onClick={() => setPlayerDirectoryRegion(item)}>{item}</button>)}
          </div>
        </div>
        {visiblePlayerDirectory.length ? <div className="actual-player-grid">
          {visiblePlayerDirectory.map((result) => {
            const { player, school } = result;
            return <button type="button" className="actual-player-card" key={`${result.sectionId}-${player.id}`} onClick={() => openSearchedPlayer(result)} aria-label={`${school} ${player.name} 선수 프로필 보기`}>
              <span className="actual-player-number"><small>NO.</small><strong>{player.number}</strong></span>
              <span className="actual-player-identity"><small>{schoolRegionByName[school]} · {school}</small><strong>{player.name}</strong><span>{player.position} · {player.grade}</span></span>
              <span className="actual-player-spec"><small>{player.height > 0 ? `${player.height}cm` : "신장 미정"} · {player.weight > 0 ? `${player.weight}kg` : "체중 미정"}</small><strong>{player.batsThrows}</strong></span>
              <b>프로필 보기 <span aria-hidden="true">→</span></b>
            </button>;
          })}
        </div> : <div className="player-directory-empty">조건에 맞는 선수가 없습니다. 검색어나 지역을 다시 선택해 주세요.</div>}
        {filteredPlayerDirectory.length > visiblePlayerDirectory.length && <p className="player-directory-note">검색 속도를 위해 처음 48명을 표시합니다. 이름이나 학교를 입력하면 원하는 선수를 빠르게 찾을 수 있습니다.</p>}
      </section>

      <ProfileEntryContext.Provider value={profileEntry}>
      {activeRosterSchool && ActiveRosterComponent && <ActiveRosterComponent key={activeRosterSection} />}
      {activeRosterSchool && activeRosterSection && !ActiveRosterComponent && <TeamRoster
        key={activeRosterSection}
        sectionId={activeRosterSection}
        kicker={`${activeRosterSchool.region} · U-18 BASEBALL · 2026`}
        title={`${activeRosterSchool.name} 선수단`}
        subtitle={`선수를 직접 추가하거나 엑셀로 일괄 등록할 수 있습니다 · 감독 ${activeRosterSchool.coach}`}
        teamLabel={activeRosterSchool.name}
        monogram={activeRosterSchool.name.slice(0, 1)}
        players={[]}
      />}
      </ProfileEntryContext.Provider>

      <section className="how-section" id="how">
        <div className="how-copy">
          <div className="section-console-bar compact">
            <span><i /> 05 · TRUST & SAFETY</span>
            <small>AMAON STANDARD</small>
          </div>
          <p className="kicker dark"><span /> TRUSTED PROFILE SYSTEM</p>
          <h2>가입 즉시 함께하고,<br />신원은 안전하게 확인합니다.</h2>
          <p>학교·선수 프로필·사진·영상과 게시판은 로그인 없이 볼 수 있습니다. 글쓰기·댓글·좋아요·신고는 로그인 후 이용하며, 운영팀 확인을 거치면 선수·보호자·지도자 신원 배지가 표시됩니다.</p>
          <button className="solid-button" onClick={() => jumpToSection("community")}>커뮤니티 참여하기 <span>↗</span></button>
        </div>
        <ol className="steps">
          <li><span>01</span><div><strong>회원 유형을 선택해 가입</strong><p>선수, 보호자, 지도자, 관계자 또는 팬으로 가입합니다.</p></div></li>
          <li><span>02</span><div><strong>가입 즉시 열람·활동</strong><p>학교와 선수를 검색하고 안전한 커뮤니티를 이용합니다.</p></div></li>
          <li><span>03</span><div><strong>운영팀 신원 확인</strong><p>소속 확인 후 신원 배지를 부여합니다. 활동 등급은 별도입니다.</p></div></li>
          <li><span>04</span><div><strong>콘텐츠는 운영자만 편집</strong><p>선수·보호자 회원은 열람과 커뮤니티 활동만 가능합니다.</p></div></li>
        </ol>
      </section>

      <section className="safety-band">
        <div><span className="shield">✓</span><div><strong>미성년 선수 보호가 먼저입니다</strong><p>상세 생년월일, 연락처, 주소는 공개하지 않습니다. 영상·사진은 권리 확인 후 게시합니다.</p></div></div>
        <a href="#how">운영 원칙 보기 →</a>
      </section>

      <section className="cta-section">
        <p>YOUR STORY STARTS HERE</p>
        <h2>당신의 야구를<br /><em>기록으로 남기세요.</em></h2>
        <button onClick={() => jumpToSection("community")}>커뮤니티 바로가기 <span>↗</span></button>
      </section>

      <section className="support-section" aria-labelledby="support-title">
        <div className="support-message">
          <small>SUPPORT AMAON · BUY US A COFFEE</small>
          <h2 id="support-title">아마ON이 도움이 되셨다면,<br /><em>커피 한 잔으로 응원해 주세요.</em></h2>
          <p>보내주신 응원은 더 많은 아마야구 선수의 이야기와 영상을 알리고, 아마ON을 안정적으로 운영하는 데 소중히 사용하겠습니다.</p>
          <span>후원은 자유이며 서비스 이용과는 무관합니다.</span>
        </div>
        <div className="support-account-card" aria-label="아마ON 후원 계좌">
          <div><small>BANK</small><strong>NH농협은행</strong></div>
          <div><small>ACCOUNT</small><strong>302-2177-2877-01</strong></div>
          <div><small>HOLDER</small><strong>한끼방패 브랜드랩</strong></div>
          <button type="button" onClick={() => void copySupportAccount()}>
            {supportCopyNotice || "계좌번호 복사"}<span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer>
        <a className="brand-lockup footer-brand" href="#top" aria-label="아마ON 홈">
          <Image
            className="brand-logo-image"
            src="/yamaon-logo.png"
            alt="아마ON by 한끼방패"
            width={76}
            height={76}
          />
        </a>
        <p>고교야구 선수와 팀의 오늘을 기록합니다.</p>
        <small>© 2026 HANKKI AMATEUR BASEBALL</small>
      </footer>

      {guideOpen && <div className="amaon-guide-backdrop" role="presentation" onMouseDown={() => setGuideOpen(false)}>
        <section className="amaon-guide-modal" role="dialog" aria-modal="true" aria-labelledby="amaon-guide-title" onMouseDown={(event) => event.stopPropagation()}>
          <button type="button" className="amaon-guide-close" onClick={() => setGuideOpen(false)} aria-label="아마ON 사용설명서 닫기">×</button>
          <header className="amaon-guide-head">
            <div><small>AMAON · PLAYER PORTFOLIO GUIDE</small><span>경기 · 인천 OPEN</span></div>
            <h2 id="amaon-guide-title">숫자를 넘어,<br /><em>선수를 알리는 시대.</em></h2>
            <p>아마ON은 매일의 기록만 나열하는 곳이 아닙니다. 선수의 프로필과 장점, 플레이 영상을 한곳에 모아 자신을 제대로 알릴 수 있도록 돕는 아마야구 선수 포트폴리오입니다.</p>
          </header>

          <div className="amaon-guide-purpose">
            <span>WHY AMAON</span>
            <strong>기록은 숫자로 남고,<br />선수의 가능성은 이야기와 영상으로 기억됩니다.</strong>
            <p>학교·포지션·신체 정보부터 자기소개, 나의 장점, 목표와 포부, 경기 영상까지 하나의 프로필로 연결합니다.</p>
          </div>

          <div className="amaon-guide-features" aria-label="아마ON 프로필 구성">
            <article><span>01</span><small>PROFILE</small><h3>나를 소개하는 프로필</h3><p>소속 학교, 포지션, 학년과 기본 정보를 한눈에 보여줍니다.</p></article>
            <article><span>02</span><small>STORY</small><h3>장점과 목표를 담는 이야기</h3><p>선수의 강점, 플레이 스타일, 앞으로의 목표와 포부를 직접 알립니다.</p></article>
            <article><span>03</span><small>FILM</small><h3>플레이를 증명하는 영상</h3><p>유튜브에 등록된 투구·타격·수비 영상을 프로필에서 바로 확인할 수 있습니다.</p></article>
          </div>

          <section className="amaon-guide-register">
            <div className="amaon-guide-section-title"><small>HOW TO REGISTER</small><h3>프로필 등록 방법</h3><p>현재 경기·인천권부터 운영하며 지역은 순차적으로 확대합니다.</p></div>
            <ol>
              <li><span>1</span><div><strong>프로필 내용을 준비하세요</strong><p>선수 이름, 학교, 포지션, 학년, 신체 정보, 자기소개, 장점과 목표를 정리합니다.</p></div></li>
              <li><span>2</span><div><strong>영상과 함께 한끼방패 인스타그램 DM으로 보내주세요</strong><p>프로필 내용과 공개 가능한 사진, 유튜브 영상 주소를 전달합니다.</p></div></li>
              <li><span>3</span><div><strong>확인 후 아마ON에 등록됩니다</strong><p>운영팀이 전달 내용을 확인한 뒤 선수 프로필을 구성해 공개합니다.</p></div></li>
            </ol>
          </section>

          <section className="amaon-guide-install">
            <div className="amaon-guide-install-copy">
              <small>INSTALL AMAON · ANDROID CHROME</small>
              <h3>웹사이트를 넘어,<br /><em>휴대폰 앱처럼 사용하세요.</em></h3>
              <p>안드로이드 휴대폰의 크롬에서 <strong>www.amaon.kr</strong>을 입력해 접속하면 화면 상단에 ‘아마ON by 한끼방패 설치’ 안내가 나타납니다.</p>
              <ol>
                <li><span>1</span><div><strong>크롬에서 www.amaon.kr 접속</strong><p>주소창에 아마ON 공식 주소를 직접 입력합니다.</p></div></li>
                <li><span>2</span><div><strong>설치 안내의 ‘설치’ 선택</strong><p>안내가 보이지 않으면 크롬 오른쪽 위 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택합니다.</p></div></li>
                <li><span>3</span><div><strong>홈 화면의 아마ON 아이콘으로 실행</strong><p>설치가 끝나면 휴대폰 홈 화면에 아마ON 아이콘이 생기며, 아이콘을 누르면 바로 실행됩니다.</p></div></li>
              </ol>
              <span className="amaon-guide-install-note">별도의 앱스토어 가입이나 Vercel 가입은 필요하지 않습니다. 학교·선수 프로필·사진·영상과 게시판 읽기는 로그인 없이 이용하세요. 글쓰기·댓글·좋아요·신고는 아마ON 회원 로그인 후 이용할 수 있습니다.</span>
            </div>
            <div className="amaon-guide-install-visuals" aria-label="아마ON 휴대폰 설치 화면 예시">
              <figure className="amaon-guide-install-screen">
                <Image src="/guide/amaon-chrome-install.jpg" alt="안드로이드 크롬에서 표시되는 아마ON 설치 안내" width={1440} height={2783} sizes="(max-width: 760px) 80vw, 360px" />
                <figcaption>01 · 크롬 설치 안내</figcaption>
              </figure>
              <figure className="amaon-guide-installed-icon">
                <Image src="/guide/amaon-installed-app.png" alt="휴대폰 홈 화면에 설치된 아마ON 앱 아이콘" width={125} height={123} />
                <figcaption><small>02 · 설치 완료</small><strong>홈 화면에서<br />아마ON 바로 실행</strong></figcaption>
              </figure>
            </div>
          </section>

          <section className="amaon-guide-share">
            <div><small>YOUR PROFILE · ONE LINK</small><h3>등록된 프로필 링크를<br /><em>자신의 SNS에 올리세요.</em></h3><p>프로필의 ‘프로필 공유’ 기능으로 링크를 복사해 인스타그램 소개, 스토리, 게시물 또는 다른 SNS에 붙여 넣을 수 있습니다. 그 링크를 누르면 학교 목록을 다시 찾지 않아도 선수의 프로필이 바로 열립니다.</p></div>
            <div className="amaon-guide-link-card"><span>AMAON PLAYER LINK</span><strong>나의 프로필로<br />바로 연결</strong><b>PROFILE · STORY · FILM →</b></div>
          </section>

          <section className="amaon-guide-support">
            <div>
              <small>KEEP AMAON ON · COFFEE SUPPORT</small>
              <h3>선수들의 이야기를 계속 알리려면<br /><em>아마ON을 유지하는 비용이 필요합니다.</em></h3>
              <p>아마ON은 서버 운영, 데이터베이스, 영상·이미지 트래픽, 도메인과 지속적인 유지보수에 비용이 들어갑니다. 아마ON이 도움이 되셨다면 커피 한 잔의 마음으로 응원해 주세요. 보내주신 후원은 더 많은 아마야구 선수의 프로필과 영상을 안정적으로 알리는 데 사용하겠습니다.</p>
              <span>후원은 전적으로 자유이며, 서비스 이용이나 선수 프로필 등록 여부와는 무관합니다.</span>
            </div>
            <div className="amaon-guide-support-account" aria-label="아마ON 커피 후원 계좌">
              <small>NH농협은행</small>
              <strong>302-2177-2877-01</strong>
              <span>한끼방패 브랜드랩</span>
              <button type="button" onClick={() => void copySupportAccount()}>{supportCopyNotice || "계좌번호 복사"} <b>→</b></button>
            </div>
          </section>

          <div className="amaon-guide-mission"><small>OUR GOAL</small><strong>아마야구 선수가 자신의 가능성을 보여주는<br /><em>하나의 포트폴리오</em>가 되게 하는 것.</strong><button type="button" onClick={() => { setGuideOpen(false); jumpToSection("players"); }}>선수 프로필 보기 <span>→</span></button></div>
        </section>
      </div>}

      <nav className="mobile-bottom-nav" aria-label="모바일 빠른 메뉴">
        <button type="button" aria-current={activeMobileSection === "top" ? "page" : undefined} className={activeMobileSection === "top" ? "active" : ""} onClick={() => jumpToSection("top")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-5v6h-5A1.5 1.5 0 0 1 3 19.5z" /></svg><small>홈</small></button>
        <button type="button" aria-current={activeMobileSection === "schools" ? "page" : undefined} className={activeMobileSection === "schools" ? "active" : ""} onClick={() => jumpToSection("schools")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V7l8-4 8 4v14M8 10h1m6 0h1M8 14h1m6 0h1M10 21v-4h4v4M2 21h20" /></svg><small>학교</small></button>
        <button type="button" aria-current={activeMobileSection === "players" ? "page" : undefined} className={activeMobileSection === "players" ? "active" : ""} onClick={() => jumpToSection("players")}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-5 3.4-7.5 8-7.5S19.3 16 20 21" /></svg><small>선수</small></button>
        <button type="button" aria-current={activeMobileSection === "video-ranking" ? "page" : undefined} className={activeMobileSection === "video-ranking" ? "active" : ""} onClick={() => jumpToSection("video-ranking")}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></svg><small>영상</small></button>
        <button type="button" aria-current={activeMobileSection === "community" ? "page" : undefined} className={activeMobileSection === "community" ? "active" : ""} onClick={() => jumpToSection("community")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H9l-5 4v-15Z" /><path d="M8 10h8M8 13h5" /></svg><small>커뮤니티</small></button>
      </nav>

    </main>
  );
}
