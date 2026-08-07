"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

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

const mediaCategories: Array<{ id: MediaCategory; label: string; shortLabel: string }> = [
  { id: "photo", label: "사진", shortLabel: "PHOTO" },
  { id: "batting", label: "타격영상", shortLabel: "BATTING" },
  { id: "fielding", label: "수비영상", shortLabel: "FIELDING" },
  { id: "pitching", label: "투구영상", shortLabel: "PITCHING" },
];

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
  const [selected, setSelected] = useState<TeamPlayer | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingPlayerId, setUploadingPlayerId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("photo");
  const [likes, setLikes] = useState<Record<string, LikeState>>({});
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
    setEditingProfile(false);
    setEditingOrigins(false);
    setSelectedCategory("photo");
    setNotice("");
    window.history.replaceState(null, "", getProfileUrl(player));
  }

  function closePlayer() {
    setSelected(null);
    setEditingProfile(false);
    setEditingOrigins(false);
    const url = new URL(window.location.href);
    if (url.searchParams.get("team") === sectionId) {
      url.searchParams.delete("team");
      url.searchParams.delete("player");
      url.hash = sectionId;
      window.history.replaceState(null, "", url);
    }
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

  async function loadMedia() {
    setLoading(true);
    try {
      const response = await fetch("/api/media", { cache: "no-store" });
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
      const response = await fetch(`/api/team-emblems?teamId=${encodeURIComponent(sectionId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { emblem: TeamEmblem | null };
      setEmblem(data.emblem);
    } catch {
      // The monogram remains visible when no uploaded emblem is available.
    }
  }

  async function loadProfileOverrides() {
    try {
      const response = await fetch(`/api/player-profiles?teamId=${encodeURIComponent(sectionId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { items: PlayerProfileOverride[] };
      setProfileOverrides(Object.fromEntries(data.items.map((item) => [item.playerId, item])));
    } catch {
      // Original roster information remains available if overrides cannot load.
    }
  }

  async function loadTeamBanner() {
    try {
      const response = await fetch(`/api/team-banners?teamId=${encodeURIComponent(sectionId)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { banner: TeamBanner | null };
      setTeamBanner(data.banner);
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

  useEffect(() => {
    void loadMedia();
    void loadLikes();
    void loadAdminAccess();
    void loadTeamEmblem();
    void loadProfileOverrides();
    void loadTeamBanner();
    void loadOriginSchools();
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
    setNotice(`${teamLabel} 엠블럼을 기본 표시로 되돌렸습니다.`);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("team") !== sectionId) return;
    const linkedPlayer = players.find((player) => player.id === params.get("player"));
    if (linkedPlayer) {
      setSelected(linkedPlayer);
      setSelectedCategory("photo");
    }
  }, [players, sectionId]);

  const mediaByPlayer = useMemo(() => {
    const grouped = new Map<string, MediaItem[]>();
    media.forEach((item) => grouped.set(item.playerId, [...(grouped.get(item.playerId) ?? []), item]));
    return grouped;
  }, [media]);

  async function uploadMultipartVideo(file: File, playerId: string, category: MediaCategory) {
    const chunkSize = 50 * 1024 * 1024;
    const maxVideoSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxVideoSize) throw new Error("영상은 최대 2GB까지 올릴 수 있습니다.");
    const contentType = file.type || (file.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : "video/mp4");
    let key = "";
    let uploadId = "";

    try {
      const createResponse = await fetch("/api/media?action=multipart-create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, category, fileName: file.name, contentType, size: file.size }),
      });
      const created = await createResponse.json().catch(() => null) as { key?: string; uploadId?: string; error?: string } | null;
      if (!createResponse.ok || !created?.key || !created.uploadId) throw new Error(created?.error ?? "대용량 영상 업로드를 시작하지 못했습니다.");
      key = created.key;
      uploadId = created.uploadId;

      const parts: Array<{ partNumber: number; etag: string }> = [];
      const partCount = Math.ceil(file.size / chunkSize);
      for (let index = 0; index < partCount; index += 1) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        let uploadedPart: { partNumber: number; etag: string } | null = null;

        for (let attempt = 1; attempt <= 3 && !uploadedPart; attempt += 1) {
          const partResponse = await fetch(`/api/media?action=multipart-part&key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${index + 1}`, {
            method: "PUT",
            headers: { "content-type": "application/octet-stream" },
            body: chunk,
          });
          const partData = await partResponse.json().catch(() => null) as { partNumber?: number; etag?: string; error?: string } | null;
          if (partResponse.ok && partData?.partNumber && partData.etag) uploadedPart = { partNumber: partData.partNumber, etag: partData.etag };
          else if (attempt === 3) throw new Error(partData?.error ?? `${index + 1}번째 영상 전송에 실패했습니다.`);
        }

        parts.push(uploadedPart as { partNumber: number; etag: string });
        setUploadProgress(Math.round((end / file.size) * 95));
      }

      const completeResponse = await fetch("/api/media?action=multipart-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, uploadId, parts }),
      });
      const completed = await completeResponse.json().catch(() => null) as { error?: string } | null;
      if (!completeResponse.ok) throw new Error(completed?.error ?? "전송된 영상을 합치지 못했습니다.");
      setUploadProgress(100);
    } catch (error) {
      if (key && uploadId) {
        void fetch(`/api/media?action=multipart-abort&key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}`, { method: "DELETE" });
      }
      throw error;
    }
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
        if (selectedCategory !== "photo" && isVideo) {
          setUploadProgress(0);
          await uploadMultipartVideo(file, selected.id, selectedCategory);
          continue;
        }
        const form = new FormData();
        form.append("playerId", selected.id);
        form.append("category", selectedCategory);
        form.append("file", file);
        const response = await fetch("/api/media", { method: "POST", body: form });
        if (!response.ok) {
          const data = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(data?.error ?? `${file.name} 업로드에 실패했습니다.`);
        }
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

  async function uploadPlayerPhoto(player: TeamPlayer, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPlayerId(player.id);
    setNotice("");

    try {
      const form = new FormData();
      form.append("playerId", player.id);
      form.append("category", "profile");
      form.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body: form });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? `${file.name} 업로드에 실패했습니다.`);
      }
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
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: item.key }),
    });
    if (!response.ok) return;
    const data = await response.json() as { key: string; count: number; liked: boolean };
    setLikes((current) => ({ ...current, [data.key]: { count: data.count, liked: data.liked } }));
  }

  async function deleteMedia(item: MediaItem) {
    if (!window.confirm("이 사진 또는 영상을 삭제할까요? 삭제하면 복구할 수 없습니다.")) return;
    const response = await fetch(`/api/media?action=delete&key=${encodeURIComponent(item.key)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string } | null;
      setNotice(data?.error ?? "삭제하지 못했습니다.");
      return;
    }
    setMedia((current) => current.filter((mediaItem) => mediaItem.key !== item.key));
    setNotice("사진 또는 영상을 삭제했습니다.");
  }

  const selectedMedia = selected ? mediaByPlayer.get(selected.id) ?? [] : [];
  const selectedCategoryMedia = selectedMedia.filter((item) => item.category === selectedCategory);
  const activeCategory = mediaCategories.find((category) => category.id === selectedCategory) ?? mediaCategories[0];
  const selectedDisplay = selected ? resolvePlayer(selected) : null;
  const selectedOrigins = selectedDisplay ? originSchools[selectedDisplay.id] ?? [] : [];
  const selectedDetails = selectedDisplay ? profileOverrides[selectedDisplay.id] : undefined;

  return (
    <section className="gd-section" id={sectionId}>
      <div className="gd-heading">
        <div className="gd-heading-main">
          <div className="gd-team-emblem">
            {emblem ? <img src={emblem.url} alt={`${teamLabel} 엠블럼`} /> : <strong>{monogram}</strong>}
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
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="gd-summary"><strong>{players.length}</strong><span>PLAYER PROFILES</span></div>
      </div>

      <div className="gd-grid">
        {players.map((player) => {
          const displayPlayer = resolvePlayer(player);
          const playerMedia = mediaByPlayer.get(player.id) ?? [];
          const newestFirst = (items: MediaItem[]) => [...items].sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
          const profilePortrait = newestFirst(playerMedia.filter((item) => item.type === "image" && item.category === "profile"))[0];
          const legacyPortrait = newestFirst(playerMedia.filter((item) => item.type === "image" && item.category === "photo"))[0];
          const portrait = profilePortrait ?? legacyPortrait;
          const galleryMediaCount = playerMedia.filter((item) => item.category !== "profile").length;
          return (
            <article className="gd-card" key={player.id}>
              <button className="gd-card-main" onClick={() => openPlayer(player)}>
                <div className="gd-portrait">
                  {portrait ? <img className="gd-uploaded-portrait" src={portrait.url} alt={`${player.name} 선수`} /> : <span className="gd-jersey-placeholder" aria-hidden="true"><b>{displayPlayer.number}</b><i>{monogram}</i></span>}
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
            <div className={`gd-modal-team-banner${teamBanner ? " has-image" : ""}`}>
              {teamBanner && <img src={teamBanner.url} alt={`${teamLabel} 팀 배너`} />}
              <div className="gd-team-banner-overlay" />
              <div className="gd-team-banner-brand">
                <span className="gd-team-banner-emblem">{emblem ? <img src={emblem.url} alt="" /> : monogram}</span>
                <div><small>PLAYER TEAM</small><strong>{teamLabel}</strong><b>{selectedDisplay.year} · U-18 BASEBALL</b></div>
              </div>
              {isAdmin && <div className="gd-team-banner-controls">
                <label className={bannerUploading ? "disabled" : ""}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadTeamBanner} disabled={bannerUploading} /><span>{bannerUploading ? "배너 적용 중…" : teamBanner ? "같은 팀 전체 배너 교체" : "같은 팀 전체에 배너 적용"}</span></label>
                {teamBanner && <button type="button" onClick={() => void deleteTeamBanner()}>기본 배너로</button>}
              </div>}
            </div>
            <div className="gd-modal-head">
              <div className="gd-modal-number">{selectedDisplay.number}</div>
              <div className="gd-modal-identity"><p>{teamLabel} · {selectedDisplay.year}</p><h2>{selectedDisplay.name}</h2><strong>{selectedDisplay.position} · {selectedDisplay.grade}</strong><button className="gd-share-link" onClick={() => void copyProfileLink()}>프로필 링크 복사</button>{isAdmin && <button className="gd-profile-edit-button" onClick={beginProfileEdit}>선수 정보 편집</button>}</div>
              <section className="gd-origin-panel">
                <div className="gd-origin-title"><div><small>PLAYER HISTORY</small><h3>출신학교</h3></div>{isAdmin && <button type="button" onClick={beginOriginEdit}>편집</button>}</div>
                {selectedOrigins.length ? <div className="gd-origin-table">
                  <div className="head"><span>지역</span><span>학교</span><span>연도</span><span>포지션</span></div>
                  {selectedOrigins.map((item) => <div className="row" key={`${item.sequence}-${item.school}-${item.year}`}><span>{item.region}</span><strong>{item.school}</strong><span>{item.year}</span><span>{item.position}</span></div>)}
                </div> : <p className="gd-origin-empty">등록된 출신학교가 없습니다.</p>}
              </section>
            </div>

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

            <section className="gd-player-story">
              <article className="introduction"><span>01 · ABOUT ME</span><h3>자기소개</h3><p>{selectedDetails?.introduction || "선수 자기소개가 준비 중입니다."}</p></article>
              <article><span>02 · MY STRENGTH</span><h3>나의 장점</h3><p>{selectedDetails?.strengths || "선수의 장점이 준비 중입니다."}</p></article>
              <article><span>03 · MY GOAL</span><h3>목표와 포부</h3><p>{selectedDetails?.aspiration || "선수의 목표와 포부가 준비 중입니다."}</p></article>
            </section>

            <div className="gd-media-head"><div><h3>사진 · 경기 영상</h3><p>카테고리를 선택하면 해당 항목만 모아서 볼 수 있습니다.</p></div>{isAdmin ? <label className={uploading ? "disabled" : ""}><input type="file" accept={selectedCategory === "photo" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/webm,video/quicktime"} multiple onChange={uploadFiles} disabled={uploading} /><span>{uploading ? `업로드 중${uploadProgress === null ? "…" : ` ${uploadProgress}%`}` : `+ ${activeCategory.label} 올리기`}</span></label> : <span className="gd-admin-note">관리자만 업로드할 수 있습니다</span>}</div>
            <div className="gd-media-categories" aria-label="미디어 카테고리">
              {mediaCategories.map((category) => (
                <button key={category.id} className={selectedCategory === category.id ? "active" : ""} onClick={() => { setSelectedCategory(category.id); setNotice(""); }}>
                  <span>{category.label}</span><small>{selectedMedia.filter((item) => item.category === category.id).length}</small>
                </button>
              ))}
            </div>
            {notice && <p className="gd-notice">{notice}</p>}
            <div className="gd-media-grid">
              {selectedCategoryMedia.map((item) => {
                const like = likes[item.key] ?? { count: 0, liked: false };
                return <figure key={item.key}>{item.type === "image" ? <img src={item.url} alt={`${selectedDisplay.name} 업로드 사진`} /> : <video src={item.url} controls preload="metadata" />}<figcaption>{activeCategory.shortLabel}</figcaption><div className="gd-media-actions"><button className={like.liked ? "liked" : ""} onClick={() => void toggleLike(item)} aria-label={like.liked ? "좋아요 취소" : "좋아요"}>♥ <span>{like.count}</span></button>{isAdmin && <button className="delete" onClick={() => void deleteMedia(item)}>삭제</button>}</div></figure>;
              })}
              {!selectedCategoryMedia.length && <div className="gd-media-empty"><span>＋</span><strong>아직 등록된 {activeCategory.label}이 없습니다.</strong><p>{selectedCategory === "photo" ? "JPG·PNG·WEBP 사진을 올려주세요." : "MP4·WEBM·MOV 영상을 올려주세요."}</p></div>}
            </div>
            <p className="gd-rights">선수·보호자 동의와 촬영물 사용 권리가 확인된 파일만 올려주세요. 사진은 100MB, 영상은 최대 2GB까지 올릴 수 있습니다.</p>
          </section>
        </div>
      )}
    </section>
  );
}

export default function GdRoster() {
  return <TeamRoster sectionId="gd-roster" kicker="GD CHALLENGERS · U-18" title="GD챌린저스 선수단" subtitle="2026 등록 선수 20명 · 감독 송구홍" teamLabel="GD CHALLENGERS" monogram="GD" players={gdPlayers} />;
}
