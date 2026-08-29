"use client";

// The signed-in member experience. Authentication is enforced by app/page.tsx.

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState, type ComponentType } from "react";
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

type School = {
  name: string;
  region: string;
  players: number;
  coach: string;
  featured?: boolean;
};

type TeamDirectoryAsset = { key: string; url: string; uploadedAt: string };
type TeamDirectoryAssets = Record<string, { banner?: string; emblem?: string }>;

const schools: School[] = [
  { name: "GD챌린저스BC(U-18)", region: "서울", players: 20, coach: "송구홍", featured: true },
  { name: "경기고", region: "서울", players: 60, coach: "오규택", featured: true },
  { name: "경기상업고", region: "서울", players: 53, coach: "최덕현" },
  { name: "경동고", region: "서울", players: 55, coach: "조정권" },
  { name: "덕수고", region: "서울", players: 45, coach: "정윤진", featured: true },
  { name: "명지BC(U-18)", region: "서울", players: 21, coach: "민상기" },
  { name: "배명고", region: "서울", players: 56, coach: "김경섭" },
  { name: "배재고", region: "서울", players: 34, coach: "권오영" },
  { name: "서울HG야구단(U-18)", region: "서울", players: 20, coach: "박상근" },
  { name: "서울HK야구단(U-18)", region: "서울", players: 37, coach: "김진원" },
  { name: "서울고", region: "서울", players: 51, coach: "김동수", featured: true },
  { name: "서울동산고", region: "서울", players: 45, coach: "곽동성" },
  { name: "서울디자인고", region: "서울", players: 42, coach: "이호" },
  { name: "서울아이티고BC", region: "서울", players: 22, coach: "조용준" },
  { name: "서울자동차고", region: "서울", players: 32, coach: "이우종" },
  { name: "서울컨벤션고", region: "서울", players: 36, coach: "유영원" },
  { name: "선린인터넷고", region: "서울", players: 36, coach: "박덕희" },
  { name: "성남고", region: "서울", players: 35, coach: "박혁" },
  { name: "세명컴퓨터고야구단", region: "서울", players: 27, coach: "안승찬" },
  { name: "신일고", region: "서울", players: 34, coach: "하지호" },
  { name: "우신고", region: "서울", players: 49, coach: "지병호" },
  { name: "장충고", region: "서울", players: 49, coach: "신성우" },
  { name: "중앙고", region: "서울", players: 32, coach: "남인환" },
  { name: "청원고", region: "서울", players: 53, coach: "김수관" },
  { name: "충암고", region: "서울", players: 51, coach: "이영복", featured: true },
  { name: "한광BC(U-18)", region: "서울", players: 21, coach: "유정민" },
  { name: "휘문고", region: "서울", players: 42, coach: "오태근", featured: true },
  { name: "경기항공고", region: "경기", players: 43, coach: "이동수" },
  { name: "경민IT고", region: "경기", players: 28, coach: "김종석" },
  { name: "김포과학기술고", region: "경기", players: 30, coach: "김희상" },
  { name: "라온고", region: "경기", players: 70, coach: "강봉수" },
  { name: "백송고", region: "경기", players: 51, coach: "박종호" },
  { name: "부원고야구단", region: "경기", players: 30, coach: "김상현" },
  { name: "비봉고", region: "경기", players: 39, coach: "신현철" },
  { name: "상우고야구단", region: "경기", players: 30, coach: "신명철" },
  { name: "세원고", region: "경기", players: 30, coach: "오현민" },
  { name: "소래고", region: "경기", players: 43, coach: "김석인" },
  { name: "수원야구단(U-18)", region: "경기", players: 21, coach: "이덕진" },
  { name: "신흥고", region: "경기", players: 30, coach: "곽연수" },
  { name: "안산공업고", region: "경기", players: 40, coach: "하성진" },
  { name: "야탑고", region: "경기", players: 38, coach: "최경훈", featured: true },
  { name: "유신고", region: "경기", players: 42, coach: "홍석무", featured: true },
  { name: "율곡고야구단", region: "경기", players: 35, coach: "문용수" },
  { name: "의왕BC(U-18)", region: "경기", players: 27, coach: "김윤섭" },
  { name: "인창고", region: "경기", players: 31, coach: "송성수" },
  { name: "장안고", region: "경기", players: 40, coach: "박건민" },
  { name: "진영고", region: "경기", players: 38, coach: "최승순" },
  { name: "청담고", region: "경기", players: 50, coach: "유호재" },
  { name: "충훈고", region: "경기", players: 43, coach: "정회선" },
  { name: "화성동탄B(U-18)", region: "경기", players: 28, coach: "이주희" },
  { name: "동산고", region: "인천", players: 41, coach: "이양기" },
  { name: "인천고", region: "인천", players: 46, coach: "계기범", featured: true },
  { name: "제물포고", region: "인천", players: 65, coach: "강필선" },
  { name: "개성고", region: "부산", players: 43, coach: "홍민국" },
  { name: "경남고", region: "부산", players: 53, coach: "전광열", featured: true },
  { name: "부경고", region: "부산", players: 38, coach: "채종범" },
  { name: "부산고", region: "부산", players: 45, coach: "박계원", featured: true },
  { name: "부산공업고", region: "부산", players: 41, coach: "이승학" },
  { name: "경북고", region: "대구", players: 63, coach: "이준호", featured: true },
  { name: "대구고", region: "대구", players: 59, coach: "손경호" },
  { name: "대구북구SC(U-18)", region: "대구", players: 25, coach: "이시원" },
  { name: "대구상원고", region: "대구", players: 63, coach: "김승관", featured: true },
  { name: "대전고", region: "대전", players: 48, coach: "김의수", featured: true },
  { name: "대전제일고", region: "대전", players: 36, coach: "길태근" },
  { name: "울산BC(U-18)", region: "울산", players: 24, coach: "정정오", featured: true },
  { name: "강릉고", region: "강원", players: 43, coach: "최재호", featured: true },
  { name: "강원고", region: "강원", players: 23, coach: "김정수" },
  { name: "상동고", region: "강원", players: 44, coach: "백재호" },
  { name: "설악고", region: "강원", players: 31, coach: "윤형국" },
  { name: "원주고", region: "강원", players: 27, coach: "정성민" },
  { name: "세광고", region: "충북", players: 48, coach: "방진호", featured: true },
  { name: "청주고", region: "충북", players: 40, coach: "김인철" },
  { name: "공주고", region: "충남", players: 40, coach: "오주상", featured: true },
  { name: "북일고", region: "충남", players: 37, coach: "임재철" },
  { name: "아산BC(U-18)", region: "충남", players: 18, coach: "김재우" },
  { name: "천안CSBC(U-18)", region: "충남", players: 20, coach: "윤강민" },
  { name: "군산상일고", region: "전북", players: 48, coach: "석수철", featured: true },
  { name: "인상고", region: "전북", players: 28, coach: "최한림" },
  { name: "전북인공지능고", region: "전북", players: 28, coach: "길휘종" },
  { name: "전주고", region: "전북", players: 43, coach: "최대근" },
  { name: "한국마사고BC", region: "전북", players: 23, coach: "박대희" },
  { name: "광남고BC", region: "전남", players: 28, coach: "허세환", featured: true },
  { name: "순천효천고BC", region: "전남", players: 47, coach: "정진" },
  { name: "화순고", region: "전남", players: 31, coach: "최길환" },
  { name: "경주고", region: "경북", players: 31, coach: "임원수", featured: true },
  { name: "도개고", region: "경북", players: 24, coach: "이효근" },
  { name: "예일메디텍고", region: "경북", players: 30, coach: "권시훈" },
  { name: "의성고", region: "경북", players: 44, coach: "김형근" },
  { name: "포항제철고", region: "경북", players: 31, coach: "김백만" },
  { name: "거제BC(U-18)", region: "경남", players: 24, coach: "권두조", featured: true },
  { name: "금남고", region: "경남", players: 22, coach: "전봉석" },
  { name: "김해고", region: "경남", players: 41, coach: "오성민" },
  { name: "마산고", region: "경남", players: 52, coach: "고윤성" },
  { name: "마산용마고", region: "경남", players: 44, coach: "진민수" },
  { name: "물금고", region: "경남", players: 41, coach: "강승영" },
  { name: "밀양BC(U-18)", region: "경남", players: 19, coach: "최동욱" },
  { name: "야로고BC", region: "경남", players: 19, coach: "장인욱" },
  { name: "창원공고야구단", region: "경남", players: 35, coach: "차정민" },
  { name: "제주고", region: "제주", players: 25, coach: "박재현", featured: true },
  { name: "세종BC(U-18)", region: "세종", players: 20, coach: "신진호", featured: true },
  { name: "광주동성고", region: "광주", players: 32, coach: "김재덕" },
  { name: "광주제일고", region: "광주", players: 38, coach: "조윤채", featured: true },
  { name: "광주진흥고", region: "광주", players: 38, coach: "김인호" },
];

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체");
  const [playerDirectoryQuery, setPlayerDirectoryQuery] = useState("");
  const [playerDirectoryRegion, setPlayerDirectoryRegion] = useState("전체");
  const [visibleRegions, setVisibleRegions] = useState(defaultVisibleRegions);
  const [regionDraft, setRegionDraft] = useState(defaultVisibleRegions);
  const [isAdmin, setIsAdmin] = useState(false);
  const [regionSettingsOpen, setRegionSettingsOpen] = useState(false);
  const [savingRegions, setSavingRegions] = useState(false);
  const [regionNotice, setRegionNotice] = useState("");
  const [managedRosterPlayers, setManagedRosterPlayers] = useState<ManagedRosterPlayer[]>([]);
  const [teamDirectoryAssets, setTeamDirectoryAssets] = useState<TeamDirectoryAssets>({});
  const [activeRosterSection, setActiveRosterSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState("top");
  const [showMobileBack, setShowMobileBack] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/region-visibility", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
      fetch("/api/admin", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
      fetch("/api/roster-players", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
    ]).then(([visibility, admin, rosterManagement]) => {
      if (Array.isArray(visibility?.visibleRegions) && visibility.visibleRegions.length) {
        setVisibleRegions(visibility.visibleRegions);
        setRegionDraft(visibility.visibleRegions);
      }
      setIsAdmin(Boolean(admin?.isAdmin));
      if (Array.isArray(rosterManagement?.items)) setManagedRosterPlayers(rosterManagement.items);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
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
  }, []);

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
    if (!activeRosterSection || window.location.hash !== `#${activeRosterSection}`) return;
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
  const activeRosterSchool = activeRosterSection ? publishedSchools.find((school) => rosterSectionBySchool[school.name] === activeRosterSection) : undefined;
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
    const url = new URL(window.location.href);
    url.searchParams.set("team", result.sectionId);
    url.searchParams.set("player", result.player.id);
    url.hash = result.sectionId;
    window.location.assign(url.toString());
  }

  function searchSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  function toggleRegionDraft(item: string) {
    setRegionNotice("");
    setRegionDraft((current) => current.includes(item) ? current.filter((regionName) => regionName !== item) : [...current, item]);
  }

  async function saveRegionVisibility() {
    if (!regionDraft.length) {
      setRegionNotice("공개할 지역을 한 곳 이상 선택해 주세요.");
      return;
    }
    setSavingRegions(true);
    setRegionNotice("");
    try {
      const response = await fetch("/api/region-visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibleRegions: regionDraft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "설정을 저장하지 못했습니다.");
      setVisibleRegions(result.visibleRegions);
      setRegionDraft(result.visibleRegions);
      setRegionNotice("공개 지역 설정을 저장했습니다.");
    } catch (error) {
      setRegionNotice(error instanceof Error ? error.message : "설정을 저장하지 못했습니다.");
    } finally {
      setSavingRegions(false);
    }
  }

  return (
    <main className="member-home">
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
        <button className="outline-button" onClick={() => jumpToSection("community")}>내 회원정보</button>
        <div className="mobile-top-actions">
          <button type="button" className="mobile-account-button" onClick={() => jumpToSection("community")} aria-label="내 회원정보">
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
          <button type="button" className="mobile-member-card" onClick={() => jumpToSection("community")}>
            <span className="mobile-account-glyph" aria-hidden="true" />
            <span><small>MEMBER</small><strong>내 회원정보</strong></span>
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

      <VideoRankings players={publishedPlayerSearchIndex} visibleRegions={visibleRegions} schoolRegions={schoolRegionByName} />

      <CommunityBoard />

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
            <button type="button" className="region-admin-toggle" onClick={() => { setRegionSettingsOpen((open) => !open); setRegionDraft(visibleRegions); setRegionNotice(""); }}>
              지역 공개 설정 {regionSettingsOpen ? "닫기" : "열기"}
            </button>
            {regionSettingsOpen && (
              <div className="region-settings" aria-label="지역 공개 설정">
                <div><strong>서비스에 공개할 지역</strong><span>숨긴 지역은 학교 목록·검색·선수 프로필에서 표시되지 않습니다.</span></div>
                <div className="region-settings-grid">
                  {regions.slice(1).map((item) => (
                    <label key={item} className={regionDraft.includes(item) ? "active" : ""}>
                      <input type="checkbox" checked={regionDraft.includes(item)} onChange={() => toggleRegionDraft(item)} />
                      <span>{item}</span><small>{regionDraft.includes(item) ? "공개" : "숨김"}</small>
                    </label>
                  ))}
                </div>
                <div className="region-settings-actions">
                  <button type="button" onClick={saveRegionVisibility} disabled={savingRegions}>{savingRegions ? "저장 중…" : "설정 저장"}</button>
                  {regionNotice && <p>{regionNotice}</p>}
                </div>
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

      <section className="how-section" id="how">
        <div className="how-copy">
          <div className="section-console-bar compact">
            <span><i /> 05 · TRUST & SAFETY</span>
            <small>AMAON STANDARD</small>
          </div>
          <p className="kicker dark"><span /> TRUSTED PROFILE SYSTEM</p>
          <h2>가입 즉시 함께하고,<br />신원은 안전하게 확인합니다.</h2>
          <p>회원은 학교·선수 검색과 커뮤니티를 이용하고, 운영팀 확인을 거치면 선수·보호자·지도자 신원 배지가 표시됩니다.</p>
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

          <section className="amaon-guide-share">
            <div><small>YOUR PROFILE · ONE LINK</small><h3>등록된 프로필 링크를<br /><em>자신의 SNS에 올리세요.</em></h3><p>프로필의 ‘프로필 공유’ 기능으로 링크를 복사해 인스타그램 소개, 스토리, 게시물 또는 다른 SNS에 붙여 넣을 수 있습니다. 그 링크를 누르면 학교 목록을 다시 찾지 않아도 선수의 프로필이 바로 열립니다.</p></div>
            <div className="amaon-guide-link-card"><span>AMAON PLAYER LINK</span><strong>나의 프로필로<br />바로 연결</strong><b>PROFILE · STORY · FILM →</b></div>
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
