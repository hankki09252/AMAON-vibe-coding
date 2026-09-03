"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { createSupabaseBrowserClient } from "./supabase/browser";
import { managedTeamOptions } from "./team-directory";
import { youtubeEmbedUrl, type VideoOrientation } from "./youtube";
import { offerMemberLogin } from "./member-login";

export type TeamPlayer = {
  id: string;
  number: string;
  name: string;
  year?: number;
  position: string;
  grade: string;
  height: number;
  weight: number;
  batsThrows: string;
};

type MediaItem = {
  key: string;
  playerId: string;
  type: "image" | "video";
  contentType: string;
  url: string;
  uploadedAt: string;
  category: MediaStorageCategory;
  source?: "upload" | "youtube";
  videoId?: string;
  thumbnailUrl?: string;
  orientation?: VideoOrientation;
};

type MediaCategory = "pitching" | "batting" | "fielding" | "photo";
type MediaStorageCategory = MediaCategory | "profile";
type LikeState = { count: number; liked: boolean };
type TeamEmblem = { key: string; url: string; uploadedAt: string };
type TeamBanner = { key: string; url: string; uploadedAt: string };
type PlayerProfileOverride = { playerId: string; year: number; number: string; grade: string; position: string; height: number; weight: number; introduction: string; strengths: string; aspiration: string; updatedAt: number };
type ProfileEditForm = { year: string; number: string; grade: string; position: string; height: string; weight: string; introduction: string; strengths: string; aspiration: string };
type OriginSchool = { playerId: string; sequence: number; region: string; school: string; year: number; position: string };
type OriginSchoolForm = { region: string; school: string; year: string; position: string };
export type ManagedRosterPlayer = { playerId: string; originTeamId: string; teamId: string; hidden: boolean; created: boolean; player: TeamPlayer; updatedAt: string; updatedBy: string };
type NewPlayerForm = { number: string; name: string; year: string; position: string; grade: string; height: string; weight: string; batsThrows: string };
type ImportPlayer = Omit<TeamPlayer, "id">;

const mediaCategories: Array<{ id: MediaCategory; label: string; shortLabel: string }> = [
  { id: "photo", label: "사진", shortLabel: "PHOTO" },
  { id: "batting", label: "타격영상", shortLabel: "BATTING" },
  { id: "fielding", label: "수비영상", shortLabel: "FIELDING" },
  { id: "pitching", label: "투구영상", shortLabel: "PITCHING" },
];

function newestMediaFirst(items: MediaItem[]) {
  return [...items].sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
}

export const gdPlayers: TeamPlayer[] = [
  { id: "13", number: "13", name: "기재혁", position: "외야수", grade: "1학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "21", number: "21", name: "김건수", position: "투수", grade: "2학년", height: 187, weight: 92, batsThrows: "좌투좌타" },
  { id: "28", number: "28", name: "김재준", position: "투수", grade: "3학년", height: 175, weight: 82, batsThrows: "우투우타" },
  { id: "7", number: "7", name: "김태양", position: "외야수", grade: "3학년", height: 165, weight: 65, batsThrows: "우투우타" },
  { id: "17", number: "17", name: "나하람", position: "투수", grade: "2학년", height: 181, weight: 84, batsThrows: "우투우타" },
  { id: "9", number: "9", name: "배석민", position: "내야수", grade: "3학년", height: 176, weight: 70, batsThrows: "우투좌타" },
  { id: "23", number: "23", name: "서무혁", position: "외야수", grade: "2학년", height: 181, weight: 78, batsThrows: "우투우타" },
  { id: "10", number: "10", name: "손주환", position: "내야수", grade: "2학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "18", number: "18", name: "신지원", position: "투수", grade: "3학년", height: 187, weight: 92, batsThrows: "우투우타" },
  { id: "11", number: "11", name: "안장근", position: "투수", grade: "2학년", height: 184, weight: 84, batsThrows: "우투우타" },
  { id: "40", number: "40", name: "용거련", position: "투수", grade: "1학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "5", number: "5", name: "윤도현", position: "포수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "36", number: "36", name: "윤현중", position: "외야수", grade: "3학년", height: 175, weight: 73, batsThrows: "우투우타" },
  { id: "16", number: "16", name: "이주영", position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "1", number: "1", name: "임명훈", position: "투수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "32", number: "32", name: "정건우", position: "포수", grade: "2학년", height: 178, weight: 82, batsThrows: "우투우타" },
  { id: "19", number: "19", name: "조이준", position: "투수", grade: "3학년", height: 189, weight: 106, batsThrows: "우투우타" },
  { id: "25", number: "25", name: "최규호", position: "미지정", grade: "2학년", height: 184, weight: 88, batsThrows: "우투우타" },
  { id: "2", number: "2", name: "최승호", position: "내야수", grade: "2학년", height: 174, weight: 61, batsThrows: "우투우타" },
  { id: "12", number: "12", name: "최효범", position: "포수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
];

type TeamRosterProps = {
  sectionId: string;
  kicker: string;
  title: string;
  subtitle: string;
  teamLabel: string;
  monogram: string;
  players: TeamPlayer[];
};

export function TeamRoster({ sectionId, kicker, title, subtitle, teamLabel, monogram, players }: TeamRosterProps) {
  const [selected, setSelected] = useState<TeamPlayer | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get("team") !== sectionId) return null;
    const playerId = params.get("player");
    return players.find((player) => player.id === playerId) ?? null;
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoadComplete, setProfileLoadComplete] = useState(false);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingPlayerId, setUploadingPlayerId] = useState<string | null>(null);
  const [youtubeFormOpen, setYoutubeFormOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeOrientation, setYoutubeOrientation] = useState<VideoOrientation>("portrait");
  const [savingYoutube, setSavingYoutube] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("photo");
  const [likes, setLikes] = useState<Record<string, LikeState>>({});
  const [likingKeys, setLikingKeys] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [emblem, setEmblem] = useState<TeamEmblem | null>(null);
  const [emblemUploading, setEmblemUploading] = useState(false);
  const [teamBanner, setTeamBanner] = useState<TeamBanner | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [profileOverrides, setProfileOverrides] = useState<Record<string, PlayerProfileOverride>>({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileEditForm>({ year: "2026", number: "", grade: "", position: "", height: "", weight: "", introduction: "", strengths: "", aspiration: "" });
  const [originSchools, setOriginSchools] = useState<Record<string, OriginSchool[]>>({});
  const [editingOrigins, setEditingOrigins] = useState(false);
  const [savingOrigins, setSavingOrigins] = useState(false);
  const [originForm, setOriginForm] = useState<OriginSchoolForm[]>([]);
  const [mediaFeedOpen, setMediaFeedOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [rosterChanges, setRosterChanges] = useState<ManagedRosterPlayer[]>([]);
  const [rosterManagerOpen, setRosterManagerOpen] = useState(false);
  const [newPlayerOpen, setNewPlayerOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportPlayers, setBulkImportPlayers] = useState<ImportPlayer[]>([]);
  const [bulkImportErrors, setBulkImportErrors] = useState<string[]>([]);
  const [bulkImportFileName, setBulkImportFileName] = useState("");
  const [bulkImportReading, setBulkImportReading] = useState(false);
  const [rosterSaving, setRosterSaving] = useState(false);
  const [transferTeamId, setTransferTeamId] = useState("");
  const [newPlayerForm, setNewPlayerForm] = useState<NewPlayerForm>({ number: "", name: "", year: "2026", position: "미지정", grade: "1학년", height: "170", weight: "65", batsThrows: "우투우타" });
  const mediaFeedRef = useRef<HTMLDivElement>(null);
  const mediaVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const profileHistoryPushedRef = useRef(false);
  const singlePlayerEntryRef = useRef(false);

  function resolvePlayer(player: TeamPlayer): TeamPlayer {
    const override = profileOverrides[player.id];
    return override ? {
      ...player,
      year: override.year || player.year || 2026,
      number: override.number || player.number,
      grade: override.grade || player.grade,
      position: override.position,
      height: override.height,
      weight: override.weight,
    } : { ...player, year: player.year || 2026 };
  }

  function getProfileUrl(player: TeamPlayer) {
    const url = new URL(window.location.origin);
    url.searchParams.set("team", sectionId);
    url.searchParams.set("player", player.id);
    url.hash = sectionId;
    return url.toString();
  }

  function openPlayer(player: TeamPlayer) {
    setSelected(player);
    setTransferTeamId("");
    setEditingProfile(false);
    setEditingOrigins(false);
    setSelectedCategory("photo");
    setYoutubeFormOpen(false);
    setYoutubeUrl("");
    setNotice("");
    profileHistoryPushedRef.current = true;
    window.history.pushState({ amaonView: "player", team: sectionId, player: player.id }, "", getProfileUrl(player));
  }

  function closePlayer() {
    if (singlePlayerEntryRef.current) {
      singlePlayerEntryRef.current = false;
      void loadRosterChanges();
      void loadProfileOverrides();
    }
    setMediaFeedOpen(false);
    setSelected(null);
    setEditingProfile(false);
    setEditingOrigins(false);
    if (profileHistoryPushedRef.current) {
      profileHistoryPushedRef.current = false;
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("team") !== sectionId) return;
    url.searchParams.delete("team");
    url.searchParams.delete("player");
    url.hash = sectionId;
    window.history.replaceState({ amaonView: "team", team: sectionId }, "", url);
    requestAnimationFrame(() => {
      const team = document.getElementById(sectionId);
      if (team) window.scrollTo({ top: team.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    });
  }

  function goToSchoolDirectory() {
    setSelected(null);
    setMediaFeedOpen(false);
    profileHistoryPushedRef.current = false;
    const url = new URL(window.location.href);
    url.searchParams.delete("team");
    url.searchParams.delete("player");
    url.searchParams.delete("media");
    url.hash = "schools";
    window.history.pushState({ amaonView: "schools" }, "", url);
    document.getElementById("schools")?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  async function copyProfileLink() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(getProfileUrl(selected));
      setNotice("선수 프로필 링크를 복사했습니다. 인스타그램 프로필에 붙여 넣어주세요.");
    } catch {
      setNotice("링크를 복사하지 못했습니다. 주소창의 링크를 직접 복사해 주세요.");
    }
  }

  async function shareProfile() {
    if (!selected) return;
    const player = resolvePlayer(selected);
    const url = getProfileUrl(selected);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${player.name} 선수 | 아마ON`,
          text: `${teamLabel} ${player.name} 선수 프로필`,
          url,
        });
        return;
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
      }
    }
    await copyProfileLink();
  }

  async function loadMedia(extraPlayerIds: string[] = [], onlyPlayerId?: string) {
    setLoading(true);
    try {
      const teamPlayerIds = onlyPlayerId ? [onlyPlayerId] : [...new Set([
        ...players.map((player) => player.id),
        ...rosterChanges.filter((item) => item.teamId === sectionId && !item.hidden).map((item) => item.playerId),
        ...extraPlayerIds,
      ])].slice(0, 100);
      if (!teamPlayerIds.length) {
        setMedia([]);
        return;
      }
      const params = new URLSearchParams(onlyPlayerId ? { playerId: onlyPlayerId } : { playerIds: teamPlayerIds.join(",") });
      const response = await fetch(`/api/media?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("미디어를 불러오지 못했습니다.");
      const data = await response.json() as { items: MediaItem[] };
      setMedia(data.items);
    } catch {
      setNotice("업로드된 미디어를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function loadLikes() {
    try {
      const response = await fetch("/api/likes", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: Array<{ key: string; count: number; liked: boolean }> };
      setLikes(Object.fromEntries(data.items.map((item) => [item.key, { count: item.count, liked: item.liked }])));
    } catch {
      // Likes are optional display data; media remains available if this request fails.
    }
  }

  async function loadAdminAccess() {
    try {
      const response = await fetch("/api/admin", { cache: "no-store" });
      const data = await response.json() as { isAdmin?: boolean };
      setIsAdmin(Boolean(response.ok && data.isAdmin));
    } catch {
      setIsAdmin(false);
    }
  }

  async function loadTeamEmblem() {
    try {
      const response = await fetch(`/api/team-emblems?teamId=${encodeURIComponent(sectionId)}`);
      if (!response.ok) return;
      const data = await response.json() as { emblem: TeamEmblem | null };
      setEmblem(data.emblem);
      window.dispatchEvent(new CustomEvent("amaon:team-asset-changed", { detail: { teamId: sectionId, kind: "emblem", url: data.emblem?.url || "" } }));
    } catch {
      // The monogram remains visible when no uploaded emblem is available.
    }
  }

  async function loadProfileOverrides(playerId?: string) {
    try {
      const response = await fetch(`/api/player-profiles?teamId=${encodeURIComponent(sectionId)}${playerId ? `&playerId=${encodeURIComponent(playerId)}` : ""}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: PlayerProfileOverride[] };
      setProfileOverrides(Object.fromEntries(data.items.map((item) => [item.playerId, item])));
    } catch {
      // Original roster information remains available if overrides cannot load.
    }
  }

  async function loadTeamBanner() {
    try {
      const response = await fetch(`/api/team-banners?teamId=${encodeURIComponent(sectionId)}`);
      if (!response.ok) return;
      const data = await response.json() as { banner: TeamBanner | null };
      setTeamBanner(data.banner);
      window.dispatchEvent(new CustomEvent("amaon:team-asset-changed", { detail: { teamId: sectionId, kind: "banner", url: data.banner?.url || "" } }));
    } catch {
      // The generated team banner remains visible when no image is uploaded.
    }
  }

  async function loadOriginSchools() {
    try {
      const response = await fetch(`/api/player-origins?teamId=${encodeURIComponent(sectionId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: OriginSchool[] };
      const grouped: Record<string, OriginSchool[]> = {};
      data.items.forEach((item) => { grouped[item.playerId] = [...(grouped[item.playerId] ?? []), item]; });
      setOriginSchools(grouped);
    } catch {
      // The profile remains available if origin-school history cannot load.
    }
  }

  async function loadRosterChanges(playerId?: string, includeMedia = true) {
    try {
      const response = await fetch(`/api/roster-players${playerId ? `?playerId=${encodeURIComponent(playerId)}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("선수 명단을 불러오지 못했습니다.");
      const data = await response.json() as { items: ManagedRosterPlayer[] };
      const items = data.items || [];
      setRosterChanges(items);
      const managedPlayerIds = items.filter((item) => item.teamId === sectionId && !item.hidden).map((item) => item.playerId);
      if (includeMedia) await loadMedia(managedPlayerIds);
    } catch {
      setProfileLoadFailed(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setProfileLoadComplete(false);
    const params = new URLSearchParams(window.location.search);
    const playerId = params.get("team") === sectionId ? params.get("player") : null;
    singlePlayerEntryRef.current = Boolean(playerId);
    // A shared link must not wait for unrelated players, likes, or team decorations.
    const critical = playerId
      ? [loadRosterChanges(playerId, false), loadProfileOverrides(playerId), loadMedia([], playerId)]
      : [loadRosterChanges(), loadProfileOverrides()];
    void Promise.all(critical).finally(() => {
      if (cancelled) return;
      setProfileLoadComplete(true);
      void loadLikes();
      void loadAdminAccess();
      void loadTeamEmblem();
      void loadTeamBanner();
      void loadOriginSchools();
    });
    return () => { cancelled = true; };
  }, [sectionId]);

  function beginOriginEdit() {
    if (!selectedDisplay) return;
    const current = originSchools[selectedDisplay.id] ?? [];
    setOriginForm(current.length
      ? current.map((item) => ({ region: item.region, school: item.school, year: String(item.year), position: item.position }))
      : [{ region: "", school: "", year: "2026", position: selectedDisplay.position }]);
    setEditingOrigins(true);
    setNotice("");
  }

  function updateOriginRow(index: number, field: keyof OriginSchoolForm, value: string) {
    setOriginForm((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function addOriginRow() {
    if (!selectedDisplay || originForm.length >= 10) return;
    setOriginForm((current) => [...current, { region: "", school: "", year: "2026", position: selectedDisplay.position }]);
  }

  async function saveOriginSchools() {
    if (!selectedDisplay) return;
    setSavingOrigins(true);
    setNotice("");
    try {
      const response = await fetch("/api/player-origins", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamId: sectionId,
          playerId: selectedDisplay.id,
          items: originForm.map((item) => ({ ...item, year: Number(item.year) })),
        }),
      });
      const data = await response.json().catch(() => null) as { playerId?: string; items?: Array<Omit<OriginSchool, "playerId">>; error?: string } | null;
      if (!response.ok || !data?.playerId || !data.items) throw new Error(data?.error ?? "출신학교를 저장하지 못했습니다.");
      setOriginSchools((current) => ({ ...current, [data.playerId as string]: data.items!.map((item) => ({ ...item, playerId: data.playerId as string })) }));
      setEditingOrigins(false);
      setNotice(`${selectedDisplay.name} 선수의 출신학교를 저장했습니다.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "출신학교 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingOrigins(false);
    }
  }

  async function uploadTeamBanner(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    setNotice("");
    try {
      const form = new FormData();
      form.append("teamId", sectionId);
      form.append("file", file);
      const response = await fetch("/api/team-banners", { method: "POST", body: form });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "팀 배너 업로드에 실패했습니다.");
      }
      await loadTeamBanner();
      setNotice(`${teamLabel} 소속 모든 선수에게 팀 배너를 적용했습니다.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "팀 배너 업로드 중 오류가 발생했습니다.");
    } finally {
      setBannerUploading(false);
      event.target.value = "";
    }
  }

  async function deleteTeamBanner() {
    if (!window.confirm(`${teamLabel} 팀 배너를 삭제하고 기본 배너로 되돌릴까요?`)) return;
    const response = await fetch(`/api/team-banners?teamId=${encodeURIComponent(sectionId)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setNotice(data?.error ?? "팀 배너를 삭제하지 못했습니다.");
      return;
    }
    setTeamBanner(null);
    window.dispatchEvent(new CustomEvent("amaon:team-asset-changed", { detail: { teamId: sectionId, kind: "banner", url: "" } }));
    setNotice(`${teamLabel} 팀 배너를 기본 표시로 되돌렸습니다.`);
  }

  function beginProfileEdit() {
    if (!selected) return;
    const current = resolvePlayer(selected);
    const details = profileOverrides[selected.id];
    setProfileForm({
      year: String(current.year || 2026),
      number: current.number,
      grade: current.grade,
      position: current.position,
      height: current.height > 0 ? String(current.height) : "",
      weight: current.weight > 0 ? String(current.weight) : "",
      introduction: details?.introduction ?? "",
      strengths: details?.strengths ?? "",
      aspiration: details?.aspiration ?? "",
    });
    setEditingProfile(true);
    setNotice("");
  }

  async function saveProfileEdit() {
    if (!selected) return;
    setSavingProfile(true);
    setNotice("");
    try {
      const response = await fetch("/api/player-profiles", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamId: sectionId,
          playerId: selected.id,
          year: Number(profileForm.year),
          number: profileForm.number,
          grade: profileForm.grade,
          position: profileForm.position,
          height: Number(profileForm.height),
          weight: Number(profileForm.weight),
          introduction: profileForm.introduction,
          strengths: profileForm.strengths,
          aspiration: profileForm.aspiration,
        }),
      });
      const data = await response.json().catch(() => null) as PlayerProfileOverride & { error?: string } | null;
      if (!response.ok || !data) throw new Error(data?.error ?? "선수 정보를 저장하지 못했습니다.");
      setProfileOverrides((current) => ({ ...current, [selected.id]: data }));
      setEditingProfile(false);
      setNotice(`${selected.name} 선수 정보를 수정했습니다.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "선수 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function resetProfileEdit() {
    if (!selected || !profileOverrides[selected.id]) return;
    if (!window.confirm(`${selected.name} 선수의 연도·등번호·학년을 포함한 모든 정보를 최초 등록값으로 되돌릴까요?`)) return;
    const response = await fetch(`/api/player-profiles?teamId=${encodeURIComponent(sectionId)}&playerId=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setNotice(data?.error ?? "선수 정보를 되돌리지 못했습니다.");
      return;
    }
    setProfileOverrides((current) => {
      const next = { ...current };
      delete next[selected.id];
      return next;
    });
    setEditingProfile(false);
    setNotice(`${selected.name} 선수 정보를 최초 등록값으로 되돌렸습니다.`);
  }

  async function uploadTeamEmblem(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setEmblemUploading(true);
    setNotice("");
    try {
      const form = new FormData();
      form.append("teamId", sectionId);
      form.append("file", file);
      const response = await fetch("/api/team-emblems", { method: "POST", body: form });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "엠블럼 업로드에 실패했습니다.");
      }
      await loadTeamEmblem();
      setNotice(`${teamLabel} 엠블럼을 변경했습니다.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "엠블럼 업로드 중 오류가 발생했습니다.");
    } finally {
      setEmblemUploading(false);
      event.target.value = "";
    }
  }

  async function deleteTeamEmblem() {
    if (!window.confirm(`${teamLabel} 엠블럼을 삭제하고 기본 학교 약자로 되돌릴까요?`)) return;
    const response = await fetch(`/api/team-emblems?teamId=${encodeURIComponent(sectionId)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setNotice(data?.error ?? "엠블럼을 삭제하지 못했습니다.");
      return;
    }
    setEmblem(null);
    window.dispatchEvent(new CustomEvent("amaon:team-asset-changed", { detail: { teamId: sectionId, kind: "emblem", url: "" } }));
    setNotice(`${teamLabel} 엠블럼을 기본 표시로 되돌렸습니다.`);
  }

  const displayPlayers = useMemo(() => {
    const changesByPlayer = new Map(rosterChanges.map((item) => [item.playerId, item]));
    const visible = players.flatMap((player) => {
      const change = changesByPlayer.get(player.id);
      if (change && (change.hidden || change.teamId !== sectionId)) return [];
      return [change?.player ?? player];
    });
    const existing = new Set(visible.map((player) => player.id));
    rosterChanges.forEach((change) => {
      if (change.teamId === sectionId && !change.hidden && !existing.has(change.playerId)) {
        visible.push(change.player);
        existing.add(change.playerId);
      }
    });
    return visible;
  }, [players, rosterChanges, sectionId]);

  const managedHere = rosterChanges.filter((item) => item.teamId === sectionId || item.originTeamId === sectionId);
  const hiddenPlayers = managedHere.filter((item) => item.hidden && item.teamId === sectionId);
  const transferredPlayers = managedHere.filter((item) => item.teamId !== sectionId);

  function rosterChangeFor(playerId: string) {
    return rosterChanges.find((item) => item.playerId === playerId);
  }

  async function saveRosterChange(item: ManagedRosterPlayer, fromTeamId: string, successMessage: string) {
    setRosterSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/roster-players", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...item, fromTeamId }),
      });
      const data = await response.json().catch(() => null) as { item?: ManagedRosterPlayer; error?: string } | null;
      if (!response.ok || !data?.item) throw new Error(data?.error || "선수 변경사항을 저장하지 못했습니다.");
      setRosterChanges((current) => [...current.filter((change) => change.playerId !== data.item!.playerId), data.item!]);
      window.dispatchEvent(new CustomEvent("amaon:roster-changed", { detail: data.item }));
      setNotice(successMessage);
      return data.item;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "선수 변경 중 오류가 발생했습니다.");
      return null;
    } finally {
      setRosterSaving(false);
    }
  }

  async function createPlayer() {
    setRosterSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/roster-players", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamId: sectionId,
          player: {
            ...newPlayerForm,
            year: Number(newPlayerForm.year),
            height: Number(newPlayerForm.height),
            weight: Number(newPlayerForm.weight),
          },
        }),
      });
      const data = await response.json().catch(() => null) as { item?: ManagedRosterPlayer; error?: string } | null;
      if (!response.ok || !data?.item) throw new Error(data?.error || "새 선수를 추가하지 못했습니다.");
      setRosterChanges((current) => [...current, data.item!]);
      window.dispatchEvent(new CustomEvent("amaon:roster-changed", { detail: data.item }));
      setNewPlayerOpen(false);
      setNewPlayerForm({ number: "", name: "", year: "2026", position: "미지정", grade: "1학년", height: "170", weight: "65", batsThrows: "우투우타" });
      setNotice(`${data.item.player.name} 선수를 ${teamLabel}에 추가했습니다.`);
      openPlayer(data.item.player);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "새 선수 추가 중 오류가 발생했습니다.");
    } finally {
      setRosterSaving(false);
    }
  }

  async function previewRosterFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBulkImportReading(true);
    setBulkImportPlayers([]);
    setBulkImportErrors([]);
    setBulkImportFileName(file.name);
    setNotice("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/roster-players/import", { method: "POST", body: form });
      const data = await response.json().catch(() => null) as { players?: ImportPlayer[]; errors?: string[]; error?: string } | null;
      if (!response.ok || !data?.players) throw new Error(data?.error || "명단 파일을 읽지 못했습니다.");
      setBulkImportPlayers(data.players);
      setBulkImportErrors(data.errors || []);
      setNotice(`${file.name}에서 선수 ${data.players.length}명을 확인했습니다. 아래 미리보기 후 등록을 눌러주세요.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "명단 파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setBulkImportReading(false);
      event.target.value = "";
    }
  }

  const existingPlayerKeys = useMemo(() => new Set(displayPlayers.map((player) => `${player.name.trim()}|${player.number.trim()}`)), [displayPlayers]);
  const uniqueExistingPlayerNames = useMemo(() => {
    const counts = new Map<string, number>();
    displayPlayers.forEach((player) => counts.set(player.name.trim(), (counts.get(player.name.trim()) || 0) + 1));
    return new Set([...counts].filter(([, count]) => count === 1).map(([name]) => name));
  }, [displayPlayers]);
  const importablePlayers = bulkImportPlayers.filter((player) => !existingPlayerKeys.has(`${player.name.trim()}|${player.number.trim()}`));
  const duplicateImportCount = bulkImportPlayers.length - importablePlayers.length;

  async function importRosterPlayers() {
    if (!importablePlayers.length) {
      setNotice("새로 등록할 선수가 없습니다. 이름과 등번호가 같은 선수가 이미 명단에 있습니다.");
      return;
    }
    if (!window.confirm(`${teamLabel}에 선수 ${importablePlayers.length}명을 한 번에 등록할까요?`)) return;
    setRosterSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/roster-players", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamId: sectionId, players: importablePlayers }),
      });
      const data = await response.json().catch(() => null) as { items?: ManagedRosterPlayer[]; skipped?: number; corrected?: number; created?: number; error?: string } | null;
      if (!response.ok || !data?.items) throw new Error(data?.error || "선수 명단을 저장하지 못했습니다.");
      const savedIds = new Set(data.items.map((item) => item.playerId));
      setRosterChanges((current) => [...current.filter((item) => !savedIds.has(item.playerId)), ...data.items!]);
      data.items.forEach((item) => window.dispatchEvent(new CustomEvent("amaon:roster-changed", { detail: item })));
      setBulkImportPlayers([]);
      setBulkImportErrors([]);
      setBulkImportFileName("");
      setBulkImportOpen(false);
      const corrected = data.corrected || 0;
      const created = data.created ?? Math.max(0, data.items.length - corrected);
      setNotice(`${teamLabel} 명단 반영 완료: 신규 ${created}명${corrected ? ` · 등번호 보정 ${corrected}명` : ""}.${(data.skipped || duplicateImportCount) ? ` 중복 ${(data.skipped || 0) + duplicateImportCount}명은 제외했습니다.` : ""}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "선수 명단 등록 중 오류가 발생했습니다.");
    } finally {
      setRosterSaving(false);
    }
  }

  function downloadRosterTemplate() {
    const csv = "\uFEFF선수명,백넘버,기준연도,학년,포지션,키(cm),몸무게(kg),투타\r\n홍길동,10,2026,1학년,투수,180,75,우투우타\r\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${teamLabel.replace(/[^가-힣a-zA-Z0-9_-]/g, "-")}-선수등록양식.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function hideSelectedPlayer() {
    if (!selectedDisplay || !window.confirm(`${selectedDisplay.name} 선수를 명단에서 숨길까요? 사진·영상·프로필 데이터는 삭제되지 않습니다.`)) return;
    const current = rosterChangeFor(selectedDisplay.id);
    const saved = await saveRosterChange({
      playerId: selectedDisplay.id,
      originTeamId: current?.originTeamId || sectionId,
      teamId: sectionId,
      hidden: true,
      created: current?.created || false,
      player: selectedDisplay,
      updatedAt: "",
      updatedBy: "",
    }, sectionId, `${selectedDisplay.name} 선수를 숨겼습니다. 선수 관리에서 복구할 수 있습니다.`);
    if (saved) closePlayer();
  }

  async function restorePlayer(item: ManagedRosterPlayer) {
    await saveRosterChange({ ...item, hidden: false }, item.teamId, `${item.player.name} 선수를 명단에 다시 표시했습니다.`);
  }

  async function transferSelectedPlayer() {
    if (!selectedDisplay || !transferTeamId || transferTeamId === sectionId) return;
    const destination = managedTeamOptions.find((team) => team.id === transferTeamId);
    if (!destination || !window.confirm(`${selectedDisplay.name} 선수의 소속을 ${destination.label}(으)로 옮길까요? 사진·영상·좋아요·프로필 정보는 그대로 유지됩니다.`)) return;
    const current = rosterChangeFor(selectedDisplay.id);
    const saved = await saveRosterChange({
      playerId: selectedDisplay.id,
      originTeamId: current?.originTeamId || sectionId,
      teamId: transferTeamId,
      hidden: false,
      created: current?.created || false,
      player: selectedDisplay,
      updatedAt: "",
      updatedBy: "",
    }, sectionId, `${selectedDisplay.name} 선수를 ${destination.label}(으)로 전학 처리했습니다.`);
    if (saved) {
      const targetUrl = new URL(window.location.href);
      targetUrl.searchParams.set("team", transferTeamId);
      targetUrl.searchParams.set("player", selectedDisplay.id);
      targetUrl.hash = transferTeamId;
      window.location.assign(targetUrl.toString());
    }
  }

  useEffect(() => {
    function syncProfileFromUrl() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("team") !== sectionId) {
        profileHistoryPushedRef.current = false;
        setSelected(null);
        setMediaFeedOpen(false);
        return;
      }
      const playerId = params.get("player");
      const linkedPlayer = displayPlayers.find((player) => player.id === playerId);
      if (linkedPlayer) {
        profileHistoryPushedRef.current = window.history.state?.amaonView === "player";
        setSelected(linkedPlayer);
        setSelectedCategory("photo");
        return;
      }
      profileHistoryPushedRef.current = false;
      setSelected(null);
      const movedPlayer = rosterChanges.find((item) => item.playerId === playerId && !item.hidden && item.teamId !== sectionId);
      if (movedPlayer) {
        const targetUrl = new URL(window.location.href);
        targetUrl.searchParams.set("team", movedPlayer.teamId);
        targetUrl.hash = movedPlayer.teamId;
        window.location.replace(targetUrl.toString());
      }
    }

    syncProfileFromUrl();
    window.addEventListener("popstate", syncProfileFromUrl);
    return () => window.removeEventListener("popstate", syncProfileFromUrl);
  }, [displayPlayers, rosterChanges, sectionId]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (mediaFeedOpen) setMediaFeedOpen(false);
      else if (selected) closePlayer();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mediaFeedOpen, selected]);

  const mediaByPlayer = useMemo(() => {
    const grouped = new Map<string, MediaItem[]>();
    media.forEach((item) => grouped.set(item.playerId, [...(grouped.get(item.playerId) ?? []), item]));
    return grouped;
  }, [media]);

  async function uploadSupabaseFile(file: File, playerId: string, category: MediaStorageCategory) {
    const maxVideoSize = 2 * 1024 * 1024 * 1024;
    const maxImageSize = 30 * 1024 * 1024;
    const isImage = category === "photo" || category === "profile";
    if (file.size > (isImage ? maxImageSize : maxVideoSize)) throw new Error(isImage ? "사진은 최대 30MB까지 올릴 수 있습니다." : "영상은 최대 2GB까지 올릴 수 있습니다.");
    const contentType = file.type || (file.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4");
    const extension = (file.name.split(".").pop() || (isImage ? "jpg" : "mp4")).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    const key = `gd/${playerId}/${category}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
    const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        headers: { authorization: `Bearer ${session.access_token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024,
        metadata: { bucketName: "media", objectName: key, contentType, cacheControl: "31536000" },
        onError: reject,
        onProgress: (uploaded, total) => setUploadProgress(Math.round((uploaded / total) * 95)),
        onSuccess: () => resolve(),
      });
      upload.findPreviousUploads().then((previous) => {
        if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      }).catch(reject);
    });
    const registered = await fetch("/api/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, playerId, category, contentType }) });
    if (!registered.ok) {
      const data = await registered.json().catch(() => null) as { error?: string } | null;
      throw new Error(data?.error || "업로드 파일을 등록하지 못했습니다.");
    }
    setUploadProgress(100);
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!selected || !event.target.files?.length) return;
    const files = Array.from(event.target.files).slice(0, 10);
    setUploading(true);
    setUploadProgress(null);
    setNotice("");

    try {
      for (const file of files) {
        const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(file.name);
        if (selectedCategory !== "photo" || isVideo) throw new Error("사진만 직접 업로드할 수 있습니다. 경기 영상은 유튜브 링크로 등록해 주세요.");
        setUploadProgress(0);
        await uploadSupabaseFile(file, selected.id, "photo");
      }
      const categoryLabel = mediaCategories.find((category) => category.id === selectedCategory)?.label;
      setNotice(`${categoryLabel}에 ${files.length}개 파일을 업로드했습니다.`);
      await loadMedia();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      event.target.value = "";
    }
  }

  async function registerYoutubeVideo() {
    if (!selected || selectedCategory === "photo" || !youtubeUrl.trim()) return;
    setSavingYoutube(true);
    setNotice("");
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceType: "youtube",
          youtubeUrl: youtubeUrl.trim(),
          playerId: selected.id,
          category: selectedCategory,
          orientation: youtubeOrientation,
        }),
      });
      const data = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "유튜브 영상을 등록하지 못했습니다.");
      setYoutubeUrl("");
      setYoutubeFormOpen(false);
      setNotice(`${activeCategory.label}에 유튜브 영상을 등록했습니다.`);
      await loadMedia();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "유튜브 영상 등록 중 오류가 발생했습니다.");
    } finally {
      setSavingYoutube(false);
    }
  }

  async function uploadPlayerPhoto(player: TeamPlayer, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPlayerId(player.id);
    setNotice("");

    try {
      setUploadProgress(0);
      await uploadSupabaseFile(file, player.id, "profile");
      const previousProfiles = (mediaByPlayer.get(player.id) ?? []).filter((item) => item.category === "profile");
      await Promise.all(previousProfiles.map((item) =>
        fetch(`/api/media?action=delete&key=${encodeURIComponent(item.key)}`, { method: "DELETE" }).catch(() => null)
      ));
      await loadMedia();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingPlayerId(null);
      event.target.value = "";
    }
  }

  async function toggleLike(item: MediaItem) {
    if (likingKeys.has(item.key)) return;
    setLikingKeys((current) => new Set(current).add(item.key));
    setNotice("");
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });
      const data = await response.json().catch(() => null) as { key?: string; count?: number; liked?: boolean; error?: string } | null;
      if (!response.ok || !data?.key || typeof data.count !== "number" || typeof data.liked !== "boolean") {
        if (response.status === 401) offerMemberLogin();
        throw new Error(data?.error ?? (response.status === 401 ? "로그인 후 좋아요를 누를 수 있습니다." : "좋아요를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."));
      }
      setLikes((current) => ({ ...current, [data.key!]: { count: data.count!, liked: data.liked! } }));
      setNotice(data.liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.");
      window.dispatchEvent(new CustomEvent("amaon:likes-changed"));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "좋아요를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLikingKeys((current) => {
        const next = new Set(current);
        next.delete(item.key);
        return next;
      });
    }
  }

  useEffect(() => {
    const updateLike = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; count: number; liked: boolean }>).detail;
      if (detail?.key && typeof detail.count === "number" && typeof detail.liked === "boolean") {
        setLikes((current) => ({ ...current, [detail.key]: { count: detail.count, liked: detail.liked } }));
      }
    };
    window.addEventListener("amaon:likes-changed", updateLike);
    return () => window.removeEventListener("amaon:likes-changed", updateLike);
  }, []);

  async function deleteMedia(item: MediaItem) {
    if (!window.confirm("이 사진 또는 영상을 삭제할까요? 삭제하면 복구할 수 없습니다.")) return;
    const response = await fetch(`/api/media?action=delete&key=${encodeURIComponent(item.key)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setNotice(data?.error ?? "삭제하지 못했습니다.");
      return;
    }
    setMedia((current) => current.filter((mediaItem) => mediaItem.key !== item.key));
    if (selectedCategoryMedia.length <= 1) setMediaFeedOpen(false);
    else setActiveMediaIndex((current) => Math.min(current, selectedCategoryMedia.length - 2));
    setNotice("사진 또는 영상을 삭제했습니다.");
  }

  const selectedMedia = selected ? mediaByPlayer.get(selected.id) ?? [] : [];
  const selectedCategoryMedia = selectedMedia.filter((item) => item.category === selectedCategory);
  const activeCategory = mediaCategories.find((category) => category.id === selectedCategory) ?? mediaCategories[0];
  const selectedDisplay = selected ? resolvePlayer(selected) : null;
  const selectedOrigins = selectedDisplay ? originSchools[selectedDisplay.id] ?? [] : [];
  const selectedDetails = selectedDisplay ? profileOverrides[selectedDisplay.id] : undefined;
  const selectedProfilePortrait = selected
    ? newestMediaFirst(selectedMedia.filter((item) => item.type === "image" && item.category === "profile"))[0]
      ?? newestMediaFirst(selectedMedia.filter((item) => item.type === "image" && item.category === "photo"))[0]
    : undefined;
  useEffect(() => {
    if (!profileLoadComplete) return;
    const params = new URLSearchParams(window.location.search);
    const playerId = params.get("player");
    if (params.get("team") !== sectionId || !playerId) return;
    const found = displayPlayers.some((player) => player.id === playerId);
    if (found && selected?.id !== playerId) return; // URL selection commits next render.
    if (!found && rosterChanges.some((item) => item.playerId === playerId && !item.hidden && item.teamId !== sectionId)) return;
    const frame = requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("amaon:profile-ready", {
      detail: { team: sectionId, player: playerId, ready: found && !profileLoadFailed },
    })));
    return () => cancelAnimationFrame(frame);
  }, [profileLoadComplete, profileLoadFailed, selected?.id, displayPlayers, rosterChanges, sectionId]);
  const featuredVideo = selected
    ? newestMediaFirst(selectedMedia.filter((item) => item.type === "video"))[0]
    : undefined;
  const selectedTagline = selectedDetails?.introduction?.trim()
    || `${selectedDisplay?.position ?? "야구선수"}로서 매 순간 성장하고 있습니다.`;

  function openMediaFeed() {
    if (!selectedCategoryMedia.length) return;
    setActiveMediaIndex(0);
    setMediaFeedOpen(true);
  }

  function moveMediaFeed(direction: -1 | 1) {
    const nextIndex = Math.min(Math.max(activeMediaIndex + direction, 0), selectedCategoryMedia.length - 1);
    mediaFeedRef.current?.scrollTo({ top: nextIndex * mediaFeedRef.current.clientHeight, behavior: "smooth" });
    setActiveMediaIndex(nextIndex);
  }

  useEffect(() => {
    if (!mediaFeedOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMediaFeedOpen(false);
      if (event.key === "ArrowDown") moveMediaFeed(1);
      if (event.key === "ArrowUp") moveMediaFeed(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mediaFeedOpen, activeMediaIndex, selectedCategoryMedia.length]);

  useEffect(() => {
    mediaVideoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (mediaFeedOpen && index === activeMediaIndex) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [activeMediaIndex, mediaFeedOpen, selectedCategory, selectedCategoryMedia.length]);

  useEffect(() => {
    if (!media.length) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("team") !== sectionId || params.get("player") !== selected?.id) return;
    const mediaKey = params.get("media");
    if (!mediaKey) return;
    const target = media.find((item) => item.key === mediaKey && item.playerId === selected.id && item.type === "video");
    if (!target || target.category === "profile" || target.category === "photo") return;
    const categoryItems = (mediaByPlayer.get(selected.id) ?? []).filter((item) => item.category === target.category);
    const targetIndex = categoryItems.findIndex((item) => item.key === target.key);
    setSelectedCategory(target.category);
    setActiveMediaIndex(Math.max(targetIndex, 0));
    setMediaFeedOpen(true);
    params.delete("media");
    const url = new URL(window.location.href);
    url.search = params.toString();
    url.hash = sectionId;
    window.history.replaceState(null, "", url);
  }, [media, mediaByPlayer, sectionId, selected]);

  return (
    <section className="gd-section" id={sectionId}>
      <button type="button" className="gd-roster-back" onClick={goToSchoolDirectory} aria-label="학교 목록으로 돌아가기">
        <span aria-hidden="true">←</span> 학교 목록으로
      </button>
      <div className="gd-heading">
        <div className="gd-heading-main">
          <div className="gd-team-emblem">
            {emblem ? <img src={emblem.url} alt={`${teamLabel} 엠블럼`} loading="lazy" decoding="async" /> : <strong>{monogram}</strong>}
            {isAdmin && <div className="gd-emblem-controls">
              <label className={emblemUploading ? "disabled" : ""}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadTeamEmblem} disabled={emblemUploading} />
                <span>{emblemUploading ? "올리는 중…" : emblem ? "엠블럼 교체" : "엠블럼 추가"}</span>
              </label>
              {emblem && <button type="button" onClick={() => void deleteTeamEmblem()}>삭제</button>}
            </div>}
          </div>
          <div>
            <p className="kicker"><span /> {kicker}</p>
            <h2>{title}</h2>
            <p>{subtitle.replace(/등록 선수 \d+명/, `등록 선수 ${displayPlayers.length}명`)}</p>
          </div>
        </div>
        <div className="gd-summary"><strong>{displayPlayers.length}</strong><span>PLAYER PROFILES</span></div>
      </div>

      {isAdmin && <div className="gd-roster-admin">
        <div className="gd-roster-admin-actions">
          <button type="button" onClick={() => setNewPlayerOpen((open) => !open)}>+ 새 선수 추가</button>
          <button type="button" onClick={() => setBulkImportOpen((open) => !open)}>엑셀로 여러 명 등록</button>
          <button type="button" className="secondary" onClick={() => setRosterManagerOpen((open) => !open)}>선수 관리 {hiddenPlayers.length ? `· 숨김 ${hiddenPlayers.length}` : ""}</button>
        </div>
        {newPlayerOpen && <div className="gd-new-player-form">
          <label>선수 이름<input value={newPlayerForm.name} maxLength={30} onChange={(event) => setNewPlayerForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label>등번호<input value={newPlayerForm.number} maxLength={3} placeholder="미정 가능" onChange={(event) => setNewPlayerForm((current) => ({ ...current, number: event.target.value }))} /></label>
          <label>기준 연도<input type="number" min="2000" max="2100" value={newPlayerForm.year} onChange={(event) => setNewPlayerForm((current) => ({ ...current, year: event.target.value }))} /></label>
          <label>학년<select value={newPlayerForm.grade} onChange={(event) => setNewPlayerForm((current) => ({ ...current, grade: event.target.value }))}><option>1학년</option><option>2학년</option><option>3학년</option><option>졸업</option></select></label>
          <label>포지션<input value={newPlayerForm.position} maxLength={20} onChange={(event) => setNewPlayerForm((current) => ({ ...current, position: event.target.value }))} /></label>
          <label>키(cm)<input type="number" min="100" max="230" value={newPlayerForm.height} onChange={(event) => setNewPlayerForm((current) => ({ ...current, height: event.target.value }))} /></label>
          <label>몸무게(kg)<input type="number" min="30" max="200" value={newPlayerForm.weight} onChange={(event) => setNewPlayerForm((current) => ({ ...current, weight: event.target.value }))} /></label>
          <label>투타<input value={newPlayerForm.batsThrows} maxLength={20} placeholder="예: 우투우타" onChange={(event) => setNewPlayerForm((current) => ({ ...current, batsThrows: event.target.value }))} /></label>
          <div><button type="button" onClick={() => void createPlayer()} disabled={rosterSaving}>{rosterSaving ? "저장 중…" : "선수 생성"}</button><button type="button" className="cancel" onClick={() => setNewPlayerOpen(false)} disabled={rosterSaving}>취소</button></div>
        </div>}
        {bulkImportOpen && <div className="gd-roster-import">
          <div className="gd-roster-import-head">
            <div><strong>{teamLabel} 선수 명단 일괄 등록</strong><span>.xls · .xlsx · .csv 지원 · 실제 저장 전 미리보기</span></div>
            <button type="button" className="template" onClick={downloadRosterTemplate}>등록 양식 받기</button>
          </div>
          <label className={bulkImportReading ? "disabled" : ""}>
            <input type="file" accept=".xls,.xlsx,.csv" onChange={(event) => void previewRosterFile(event)} disabled={bulkImportReading || rosterSaving} />
            <span>{bulkImportReading ? "파일 확인 중…" : bulkImportFileName || "엑셀·CSV 명단 선택"}</span>
          </label>
          <p className="gd-roster-import-guide">열 제목은 선수명(또는 성명), 백넘버(등번호·배번도 가능), 학년, 포지션, 키, 몸무게, 투타를 사용하세요. No와 백넘버 열이 함께 있으면 백넘버를 선수 배번으로 적용합니다. 감독·코치 행은 자동 제외됩니다. 같은 이름의 기존 선수가 한 명이면 백넘버를 자동 교정합니다.</p>
          {bulkImportPlayers.length > 0 && <>
            <div className="gd-roster-import-summary"><b>확인 {bulkImportPlayers.length}명</b><span>등록·교정 가능 {importablePlayers.length}명</span>{duplicateImportCount > 0 && <em>변경 없는 선수 {duplicateImportCount}명 제외</em>}{bulkImportErrors.length > 0 && <em>오류 행 {bulkImportErrors.length}개 제외</em>}</div>
            <div className="gd-roster-import-preview"><table><thead><tr><th>등번호</th><th>선수명</th><th>학년</th><th>포지션</th><th>신체</th><th>투타</th><th>상태</th></tr></thead><tbody>{bulkImportPlayers.map((player, index) => { const duplicate = existingPlayerKeys.has(`${player.name.trim()}|${player.number.trim()}`); const correctsNumber = !duplicate && player.number !== "미정" && uniqueExistingPlayerNames.has(player.name.trim()); return <tr key={`${player.name}-${player.number}-${index}`} className={duplicate ? "duplicate" : ""}><td>{player.number}</td><td>{player.name}</td><td>{player.grade}</td><td>{player.position}</td><td>{player.height}cm / {player.weight}kg</td><td>{player.batsThrows}</td><td>{duplicate ? "기존 명단 중복" : correctsNumber ? "백넘버 교정" : "등록 가능"}</td></tr>; })}</tbody></table></div>
            {bulkImportErrors.length > 0 && <details className="gd-roster-import-errors"><summary>제외된 행 확인</summary>{bulkImportErrors.map((error) => <p key={error}>{error}</p>)}</details>}
            <div className="gd-roster-import-actions"><button type="button" onClick={() => void importRosterPlayers()} disabled={rosterSaving || !importablePlayers.length}>{rosterSaving ? "저장 중…" : `${importablePlayers.length}명 등록·교정`}</button><button type="button" className="cancel" onClick={() => { setBulkImportOpen(false); setBulkImportPlayers([]); setBulkImportErrors([]); setBulkImportFileName(""); }} disabled={rosterSaving}>취소</button></div>
          </>}
        </div>}
        {rosterManagerOpen && <div className="gd-roster-manager">
          <div><strong>숨긴 선수</strong><span>탈퇴·활동 중단 선수의 모든 데이터는 보관됩니다.</span></div>
          {hiddenPlayers.length ? hiddenPlayers.map((item) => <p key={item.playerId}><span><b>{item.player.name}</b> · {item.player.grade} · {item.player.position}</span><button type="button" onClick={() => void restorePlayer(item)} disabled={rosterSaving}>명단에 복구</button></p>) : <p className="empty-row">숨긴 선수가 없습니다.</p>}
          {transferredPlayers.length > 0 && <><div><strong>전학 처리한 선수</strong><span>새 학교 명단과 기존 프로필에서 확인할 수 있습니다.</span></div>{transferredPlayers.map((item) => <p key={item.playerId}><span><b>{item.player.name}</b> → {managedTeamOptions.find((team) => team.id === item.teamId)?.label || item.teamId}</span></p>)}</>}
        </div>}
      </div>}

      <div className="gd-grid">
        {displayPlayers.map((player) => {
          const displayPlayer = resolvePlayer(player);
          const playerMedia = mediaByPlayer.get(player.id) ?? [];
          const profilePortrait = newestMediaFirst(playerMedia.filter((item) => item.type === "image" && item.category === "profile"))[0];
          const legacyPortrait = newestMediaFirst(playerMedia.filter((item) => item.type === "image" && item.category === "photo"))[0];
          const portrait = profilePortrait ?? legacyPortrait;
          const galleryMediaCount = playerMedia.filter((item) => item.category !== "profile").length;
          return (
            <article className="gd-card" key={player.id}>
              <button className="gd-card-main" onClick={() => openPlayer(player)}>
                <div className="gd-portrait">
                  {portrait ? <img className="gd-uploaded-portrait" src={portrait.url} alt={`${player.name} 선수`} loading="lazy" decoding="async" /> : <span className="gd-jersey-placeholder" aria-hidden="true"><b>{displayPlayer.number}</b><i>{monogram}</i></span>}
                  <small>{galleryMediaCount ? `MEDIA ${galleryMediaCount}` : "PHOTO READY"}</small>
                </div>
                <div className="gd-card-info">
                  <p>{displayPlayer.position} · {displayPlayer.grade} · {displayPlayer.year}</p>
                  <h3><em>{displayPlayer.number}.</em> {player.name}</h3>
                  <dl><div><dt>신체</dt><dd>{displayPlayer.height > 0 && displayPlayer.weight > 0 ? `${displayPlayer.height}cm / ${displayPlayer.weight}kg` : "미정"}</dd></div><div><dt>투타</dt><dd>{displayPlayer.batsThrows}</dd></div></dl>
                  <span>프로필 열기 ↗</span>
                </div>
              </button>
              {isAdmin && <label className={`gd-card-upload${uploadingPlayerId === player.id ? " disabled" : ""}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadPlayerPhoto(player, event)} disabled={uploadingPlayerId !== null} />
                <span>{uploadingPlayerId === player.id ? "프로필 사진 올리는 중…" : profilePortrait ? "프로필 사진 교체하기" : "+ 프로필 사진 올리기"}</span>
              </label>}
            </article>
          );
        })}
      </div>
      {loading && <p className="gd-loading">업로드된 사진과 영상을 확인하고 있습니다.</p>}

      {selectedDisplay && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closePlayer}>
          <section className="gd-modal" role="dialog" aria-modal="true" aria-label={`${selectedDisplay.name} 선수 프로필`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={closePlayer} aria-label="닫기">×</button>
            <button type="button" className="gd-profile-back" onClick={closePlayer} aria-label={`${teamLabel} 선수단으로 돌아가기`}>
              <span aria-hidden="true">←</span> 선수단으로
            </button>
            <div className={`gd-modal-team-banner${teamBanner ? " has-image" : ""}`}>
              {teamBanner && <img src={teamBanner.url} alt={`${teamLabel} 팀 배너`} loading="lazy" decoding="async" />}
              <div className="gd-team-banner-overlay" />
              <div className="gd-team-banner-brand">
                <span className="gd-team-banner-emblem">{emblem ? <img src={emblem.url} alt="" loading="lazy" decoding="async" /> : monogram}</span>
                <div><small>PLAYER TEAM</small><strong>{teamLabel}</strong><b>{selectedDisplay.year} · U-18 BASEBALL</b></div>
              </div>
              {isAdmin && <div className="gd-team-banner-controls">
                <label className={bannerUploading ? "disabled" : ""}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadTeamBanner} disabled={bannerUploading} /><span>{bannerUploading ? "배너 적용 중…" : teamBanner ? "같은 팀 전체 배너 교체" : "같은 팀 전체에 배너 적용"}</span></label>
                {teamBanner && <button type="button" onClick={() => void deleteTeamBanner()}>기본 배너로</button>}
              </div>}
            </div>
            <section className="gd-profile-hero">
              <div className="gd-profile-portrait">
                {selectedProfilePortrait
                  ? <img src={selectedProfilePortrait.url} alt={`${selectedDisplay.name} 선수 프로필`} />
                  : <div className="gd-profile-portrait-fallback"><small>{monogram}</small><strong>{selectedDisplay.number}</strong></div>}
                <span>OFFICIAL PLAYER</span>
              </div>
              <div className="gd-profile-hero-copy">
                <p>PLAYER SPOTLIGHT · {selectedDisplay.year}</p>
                <h2>{selectedDisplay.name}</h2>
                <div className="gd-profile-chips">
                  <span>{teamLabel}</span>
                  <span>{selectedDisplay.position} · {selectedDisplay.grade}</span>
                  {selectedDisplay.height > 0 && selectedDisplay.weight > 0 && <span>{selectedDisplay.height}cm · {selectedDisplay.weight}kg</span>}
                  <span>{selectedDisplay.batsThrows}</span>
                </div>
                <blockquote>{selectedTagline}</blockquote>
                <div className="gd-profile-actions">
                  <button type="button" className="primary" onClick={() => void shareProfile()}>프로필 공유</button>
                  <button type="button" onClick={() => document.getElementById(`${sectionId}-${selectedDisplay.id}-media`)?.scrollIntoView({ behavior: "smooth", block: "start" })} disabled={!featuredVideo}>대표 영상 보기</button>
                  {isAdmin && <button type="button" className="edit" onClick={beginProfileEdit}>선수 정보 편집</button>}
                </div>
              </div>
              <aside className="gd-profile-feature">
                <header><small>FEATURED PLAY</small><strong>대표 경기 영상</strong></header>
                {featuredVideo ? <div className={`gd-profile-feature-media ${featuredVideo.orientation ?? "portrait"}`}>
                  {featuredVideo.source === "youtube" && featuredVideo.videoId
                    ? <iframe src={youtubeEmbedUrl(featuredVideo.videoId)} title={`${selectedDisplay.name} 대표 경기 영상`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                    : <video src={featuredVideo.url} controls preload="metadata" playsInline />}
                </div> : <div className="gd-profile-feature-empty"><b>대표 영상 준비 중</b><span>투구·타격·수비 영상을 등록하면 이곳에 가장 최근 영상이 표시됩니다.</span></div>}
              </aside>
            </section>

            {isAdmin && <div className="gd-player-management">
              <div><small>ADMIN · PLAYER STATUS</small><h3>선수 소속·활동 관리</h3><p>전학은 사진·영상·좋아요·프로필을 유지한 채 새 학교로 옮깁니다. 숨김은 데이터를 삭제하지 않습니다.</p></div>
              <label>전학할 학교<select value={transferTeamId} onChange={(event) => setTransferTeamId(event.target.value)}><option value="">학교 선택</option>{managedTeamOptions.filter((team) => team.id !== sectionId).map((team) => <option key={team.id} value={team.id}>{team.label}</option>)}</select></label>
              <button type="button" onClick={() => void transferSelectedPlayer()} disabled={rosterSaving || !transferTeamId}>전학 처리</button>
              <button type="button" className="hide" onClick={() => void hideSelectedPlayer()} disabled={rosterSaving}>선수 숨기기</button>
            </div>}

            {isAdmin && editingOrigins && <div className="gd-origin-editor">
              <div className="gd-origin-editor-head"><div><small>ADMIN EDIT</small><h3>출신학교 편집</h3></div><button type="button" onClick={addOriginRow} disabled={originForm.length >= 10}>+ 학교 추가</button></div>
              {originForm.map((item, index) => <div className="gd-origin-editor-row" key={index}>
                <label>지역<input value={item.region} maxLength={30} placeholder="예: 서울" onChange={(event) => updateOriginRow(index, "region", event.target.value)} /></label>
                <label>학교명<input value={item.school} maxLength={60} placeholder="예: ○○중학교" onChange={(event) => updateOriginRow(index, "school", event.target.value)} /></label>
                <label>연도<input type="number" min="1950" max="2100" value={item.year} onChange={(event) => updateOriginRow(index, "year", event.target.value)} /></label>
                <label>포지션<input value={item.position} maxLength={20} placeholder="예: 외야수" onChange={(event) => updateOriginRow(index, "position", event.target.value)} /></label>
                <button type="button" className="remove" aria-label={`${index + 1}번째 출신학교 삭제`} onClick={() => setOriginForm((current) => current.filter((_, itemIndex) => itemIndex !== index))}>삭제</button>
              </div>)}
              {!originForm.length && <p className="gd-origin-editor-empty">저장하면 기존 출신학교 이력이 모두 삭제됩니다.</p>}
              <div className="gd-origin-editor-actions"><button type="button" onClick={() => void saveOriginSchools()} disabled={savingOrigins}>{savingOrigins ? "저장 중…" : "출신학교 저장"}</button><button type="button" className="cancel" onClick={() => setEditingOrigins(false)} disabled={savingOrigins}>취소</button></div>
            </div>}
            <div className="gd-profile-stats">
              <div><span>HEIGHT</span><strong>{selectedDisplay.height > 0 ? <>{selectedDisplay.height}<small>cm</small></> : "미정"}</strong></div>
              <div><span>WEIGHT</span><strong>{selectedDisplay.weight > 0 ? <>{selectedDisplay.weight}<small>kg</small></> : "미정"}</strong></div>
              <div><span>THROW / BAT</span><strong>{selectedDisplay.batsThrows}</strong></div>
            </div>

            {isAdmin && editingProfile && <div className="gd-profile-editor">
              <div><label htmlFor={`${sectionId}-${selectedDisplay.id}-year`}>기준 연도</label><input id={`${sectionId}-${selectedDisplay.id}-year`} type="number" min="2000" max="2100" value={profileForm.year} onChange={(event) => setProfileForm((current) => ({ ...current, year: event.target.value }))} /></div>
              <div><label htmlFor={`${sectionId}-${selectedDisplay.id}-number`}>등번호</label><input id={`${sectionId}-${selectedDisplay.id}-number`} inputMode="numeric" maxLength={3} value={profileForm.number} onChange={(event) => setProfileForm((current) => ({ ...current, number: event.target.value.replace(/\D/g, "").slice(0, 3) }))} /></div>
              <div><label htmlFor={`${sectionId}-${selectedDisplay.id}-grade`}>학년</label><select id={`${sectionId}-${selectedDisplay.id}-grade`} value={profileForm.grade} onChange={(event) => setProfileForm((current) => ({ ...current, grade: event.target.value }))}><option>1학년</option><option>2학년</option><option>3학년</option><option>졸업</option></select></div>
              <div><label htmlFor={`${sectionId}-${selectedDisplay.id}-position`}>포지션</label><input id={`${sectionId}-${selectedDisplay.id}-position`} value={profileForm.position} maxLength={20} onChange={(event) => setProfileForm((current) => ({ ...current, position: event.target.value }))} /></div>
              <div><label htmlFor={`${sectionId}-${selectedDisplay.id}-height`}>키(cm)</label><input id={`${sectionId}-${selectedDisplay.id}-height`} type="number" min="100" max="230" value={profileForm.height} onChange={(event) => setProfileForm((current) => ({ ...current, height: event.target.value }))} /></div>
              <div><label htmlFor={`${sectionId}-${selectedDisplay.id}-weight`}>몸무게(kg)</label><input id={`${sectionId}-${selectedDisplay.id}-weight`} type="number" min="30" max="200" value={profileForm.weight} onChange={(event) => setProfileForm((current) => ({ ...current, weight: event.target.value }))} /></div>
              <div className="story-field"><label htmlFor={`${sectionId}-${selectedDisplay.id}-introduction`}>자기소개 <small>{profileForm.introduction.length}/500</small></label><textarea id={`${sectionId}-${selectedDisplay.id}-introduction`} value={profileForm.introduction} maxLength={500} rows={4} placeholder="선수의 성격, 야구를 시작한 계기, 플레이 스타일 등을 소개해 주세요." onChange={(event) => setProfileForm((current) => ({ ...current, introduction: event.target.value }))} /></div>
              <div className="story-field"><label htmlFor={`${sectionId}-${selectedDisplay.id}-strengths`}>나의 장점 <small>{profileForm.strengths.length}/300</small></label><textarea id={`${sectionId}-${selectedDisplay.id}-strengths`} value={profileForm.strengths} maxLength={300} rows={3} placeholder="주루, 장타력, 제구력, 수비 범위 등 선수의 강점을 적어주세요." onChange={(event) => setProfileForm((current) => ({ ...current, strengths: event.target.value }))} /></div>
              <div className="story-field"><label htmlFor={`${sectionId}-${selectedDisplay.id}-aspiration`}>목표와 포부 <small>{profileForm.aspiration.length}/300</small></label><textarea id={`${sectionId}-${selectedDisplay.id}-aspiration`} value={profileForm.aspiration} maxLength={300} rows={3} placeholder="앞으로 이루고 싶은 목표와 각오를 적어주세요." onChange={(event) => setProfileForm((current) => ({ ...current, aspiration: event.target.value }))} /></div>
              <div className="gd-profile-editor-actions"><button type="button" onClick={() => void saveProfileEdit()} disabled={savingProfile}>{savingProfile ? "저장 중…" : "변경사항 저장"}</button><button type="button" className="cancel" onClick={() => setEditingProfile(false)} disabled={savingProfile}>취소</button>{profileOverrides[selectedDisplay.id] && <button type="button" className="reset" onClick={() => void resetProfileEdit()} disabled={savingProfile}>최초값으로</button>}</div>
            </div>}

            <div className="gd-profile-section-title"><small>PLAYER STORY</small><h3>{selectedDisplay.name}의 야구 이야기</h3></div>
            <section className="gd-player-story" aria-label={`${selectedDisplay.name} 선수 자기소개`}>
              <article className="gd-story-card gd-story-about">
                <div className="gd-story-visual">
                  {selectedProfilePortrait
                    ? <img src={selectedProfilePortrait.url} alt="" loading="lazy" decoding="async" />
                    : <div className="gd-story-visual-fallback"><small>{monogram}</small><strong>{selectedDisplay.number}</strong></div>}
                  <div className="gd-story-player-mark"><small>{selectedDisplay.position}</small><strong>#{selectedDisplay.number} {selectedDisplay.name}</strong></div>
                </div>
                <div className="gd-story-copy">
                  <header><span>01</span><div><small>ABOUT ME</small><b>나를 소개합니다</b></div></header>
                  <h3>자기소개</h3>
                  <blockquote>{selectedDetails?.introduction || "선수 자기소개가 준비 중입니다."}</blockquote>
                </div>
              </article>
              <article className="gd-story-card gd-story-detail strength">
                <header><span>02</span><div><small>MY STRENGTH</small><h3>나의 장점</h3></div></header>
                <p>{selectedDetails?.strengths || "선수의 장점이 준비 중입니다."}</p>
                <div className="gd-story-meta"><span>PLAYER SKILL</span><strong>{selectedDisplay.position}</strong></div>
              </article>
              <article className="gd-story-card gd-story-detail goal">
                <header><span>03</span><div><small>MY GOAL</small><h3>목표와 포부</h3></div></header>
                <p>{selectedDetails?.aspiration || "선수의 목표와 포부가 준비 중입니다."}</p>
                <div className="gd-story-meta"><span>NEXT CHAPTER</span><strong>{selectedDisplay.year}</strong></div>
              </article>
            </section>

            <section className="gd-origin-panel">
              <div className="gd-origin-title"><div><small>PLAYER HISTORY</small><h3>출신학교</h3></div>{isAdmin && <button type="button" onClick={beginOriginEdit}>편집</button>}</div>
              {selectedOrigins.length ? <div className="gd-origin-table">
                <div className="head"><span>지역</span><span>학교</span><span>연도</span><span>포지션</span></div>
                {selectedOrigins.map((item) => <div className="row" key={`${item.sequence}-${item.school}-${item.year}`}><span>{item.region}</span><strong>{item.school}</strong><span>{item.year}</span><span>{item.position}</span></div>)}
              </div> : <p className="gd-origin-empty">등록된 출신학교가 없습니다.</p>}
            </section>

            <div className="gd-media-head" id={`${sectionId}-${selectedDisplay.id}-media`}><div><h3>사진 · 경기 영상</h3><p>카테고리를 선택한 뒤 전체화면에서 위아래로 넘겨볼 수 있습니다.</p></div><div className="gd-media-head-actions"><button type="button" className="gd-feed-open" onClick={openMediaFeed} disabled={!selectedCategoryMedia.length}>릴스처럼 보기 <span>↕</span></button>{isAdmin ? selectedCategory === "photo" ? <label className={uploading ? "disabled" : ""}><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadFiles} disabled={uploading} /><span>{uploading ? `업로드 중${uploadProgress === null ? "…" : ` ${uploadProgress}%`}` : "+ 사진 올리기"}</span></label> : <button type="button" className="gd-youtube-open" onClick={() => setYoutubeFormOpen((open) => !open)}>+ 유튜브 영상 등록</button> : <span className="gd-admin-note">관리자만 업로드할 수 있습니다</span>}</div></div>
            <div className="gd-media-categories" aria-label="미디어 카테고리">
              {mediaCategories.map((category) => (
                <button key={category.id} className={selectedCategory === category.id ? "active" : ""} onClick={() => { setSelectedCategory(category.id); setYoutubeFormOpen(false); setNotice(""); }}>
                  <span>{category.label}</span><small>{selectedMedia.filter((item) => item.category === category.id).length}</small>
                </button>
              ))}
            </div>
            {isAdmin && selectedCategory !== "photo" && youtubeFormOpen && <div className="gd-youtube-form">
              <div><small>YOUTUBE PUBLIC VIDEO</small><strong>{activeCategory.label} 링크 등록</strong><p>영상 원본은 유튜브에서 재생되며 아마온에는 링크 정보만 저장됩니다.</p></div>
              <label className="url-field">유튜브 주소<input type="url" value={youtubeUrl} placeholder="https://youtu.be/… 또는 Shorts 주소" onChange={(event) => setYoutubeUrl(event.target.value)} disabled={savingYoutube} /></label>
              <label>영상 비율<select value={youtubeOrientation} onChange={(event) => setYoutubeOrientation(event.target.value as VideoOrientation)} disabled={savingYoutube}><option value="portrait">세로 9:16</option><option value="landscape">가로 16:9</option></select></label>
              <button type="button" onClick={() => void registerYoutubeVideo()} disabled={savingYoutube || !youtubeUrl.trim()}>{savingYoutube ? "등록 중…" : "영상 등록"}</button>
            </div>}
            {notice && <p className="gd-notice">{notice}</p>}
            <div className="gd-media-grid">
              {selectedCategoryMedia.map((item) => {
                const like = likes[item.key] ?? { count: 0, liked: false };
                const liking = likingKeys.has(item.key);
                return <figure className={item.orientation === "portrait" ? "portrait" : "landscape"} key={item.key}>{item.type === "image" ? <img src={item.url} alt={`${selectedDisplay.name} 업로드 사진`} loading="lazy" decoding="async" /> : item.source === "youtube" && item.videoId ? <div className="gd-youtube-player"><iframe src={youtubeEmbedUrl(item.videoId)} title={`${selectedDisplay.name} ${activeCategory.label}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div> : <video src={item.url} controls preload="metadata" />}<figcaption>{activeCategory.shortLabel}{item.source === "youtube" ? " · YOUTUBE" : ""}</figcaption><div className="gd-media-actions"><button className={like.liked ? "liked" : ""} onClick={() => void toggleLike(item)} aria-label={liking ? "좋아요 처리 중" : like.liked ? "좋아요 취소" : "좋아요"} aria-busy={liking} disabled={liking}>♥ <span>{liking ? "…" : like.count}</span></button>{isAdmin && <button className="delete" onClick={() => void deleteMedia(item)}>삭제</button>}</div></figure>;
              })}
              {!selectedCategoryMedia.length && <div className="gd-media-empty"><span>＋</span><strong>아직 등록된 {activeCategory.label}이 없습니다.</strong><p>{selectedCategory === "photo" ? "JPG·PNG·WEBP 사진을 올려주세요." : "공개 유튜브 영상 주소를 등록해 주세요."}</p></div>}
            </div>
            <p className="gd-rights">선수·보호자 동의와 촬영물 사용 권리가 확인된 사진과 공개 유튜브 영상만 등록해 주세요.</p>
          </section>
        </div>
      )}
      {mediaFeedOpen && selectedDisplay && selectedCategoryMedia.length > 0 && (
        <section className="gd-media-feed" role="dialog" aria-modal="true" aria-label={`${selectedDisplay.name} ${activeCategory.label} 전체화면 보기`}>
          <div className="gd-media-feed-top"><div><small>{teamLabel}</small><strong>{selectedDisplay.name} · {activeCategory.label}</strong></div><span>{activeMediaIndex + 1} / {selectedCategoryMedia.length}</span></div>
          <button type="button" className="gd-media-feed-close" onClick={() => setMediaFeedOpen(false)} aria-label="전체화면 미디어 닫기">×</button>
          <div className="gd-media-feed-scroll" ref={mediaFeedRef} onScroll={(event) => setActiveMediaIndex(Math.min(Math.round(event.currentTarget.scrollTop / event.currentTarget.clientHeight), selectedCategoryMedia.length - 1))}>
            {selectedCategoryMedia.map((item, index) => {
              const like = likes[item.key] ?? { count: 0, liked: false };
              const liking = likingKeys.has(item.key);
              return <article className="gd-media-feed-slide" key={item.key} aria-label={`${index + 1}번째 미디어`}>
                <div className="gd-media-feed-stage">
                  {item.type === "image" ? <img src={item.url} alt={`${selectedDisplay.name} 업로드 사진`} loading="lazy" decoding="async" /> : item.source === "youtube" && item.videoId ? <div className={`gd-youtube-feed-player ${item.orientation === "portrait" ? "portrait" : "landscape"}`}><iframe src={youtubeEmbedUrl(item.videoId, index === activeMediaIndex)} title={`${selectedDisplay.name} ${activeCategory.label} ${index + 1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div> : <video ref={(node) => { mediaVideoRefs.current[index] = node; }} src={item.url} controls playsInline muted loop preload={Math.abs(index - activeMediaIndex) <= 1 ? "metadata" : "none"} />}
                </div>
                <div className="gd-media-feed-meta"><div><small>{activeCategory.shortLabel}</small><strong>{selectedDisplay.number}. {selectedDisplay.name}</strong><span>{teamLabel}</span></div><div className="gd-media-feed-actions"><button type="button" className={like.liked ? "liked" : ""} onClick={() => void toggleLike(item)} aria-label={liking ? "좋아요 처리 중" : like.liked ? "좋아요 취소" : "좋아요"} aria-busy={liking} disabled={liking}>♥ <span>{liking ? "…" : like.count}</span></button>{isAdmin && <button type="button" className="delete" onClick={() => void deleteMedia(item)}>삭제</button>}</div></div>
              </article>;
            })}
          </div>
          {selectedCategoryMedia.length > 1 && <div className="gd-media-feed-nav"><button type="button" onClick={() => moveMediaFeed(-1)} disabled={activeMediaIndex === 0} aria-label="이전 미디어">↑</button><button type="button" onClick={() => moveMediaFeed(1)} disabled={activeMediaIndex === selectedCategoryMedia.length - 1} aria-label="다음 미디어">↓</button></div>}
        </section>
      )}
    </section>
  );
}

export default function GdRoster() {
  return <TeamRoster sectionId="gd-roster" kicker="GD CHALLENGERS · U-18" title="GD챌린저스 선수단" subtitle="2026 등록 선수 20명 · 감독 송구홍" teamLabel="GD CHALLENGERS" monogram="GD" players={gdPlayers} />;
}
