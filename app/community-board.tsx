"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { COMMUNITY_CATEGORIES, MEMBER_ROLE_LABELS, MEMBER_ROLES, activityLevel } from "./community-model";

const VideoSubmissionAdmin = dynamic(() => import("./video-submission-admin"));
const PlayerSubmissionAdmin = dynamic(() => import("./player-submission-admin"));

type Profile = {
  user_id: string; display_name: string; member_role: string; school_name: string;
  identity_status: string; identityBadge: string; activityLevel: string; activity_points: number;
  isAdmin?: boolean; adminRole?: string; linked_team_id?: string | null; linked_player_id?: string | null;
};
type CommentItem = {
  id: string; post_id: string; author_id: string; content: string; created_at: string;
  author?: { display_name: string; activity_points: number; identity_badge: string } | null;
};
type Post = {
  id: string; author_id: string; category: string; title: string; content: string; created_at: string;
  author?: { display_name: string; member_role: string; identity_status: string; activity_points: number; identity_badge: string } | null;
  comments?: CommentItem[];
};
type NotificationItem = {
  id: string; notification_type: "post_comment" | "media_like"; post_id?: string | null; media_key?: string | null;
  team_id?: string | null; player_id?: string | null; read_at?: string | null; created_at: string; actorName: string;
};
type MemberStats = {
  total: number; verified: number; joinedToday: number;
  roleCounts: Record<string, number>;
};
type TrafficStats = {
  totalVisitors: number; totalPageViews: number; todayVisitors: number; todayPageViews: number;
};

export default function CommunityBoard({ signedIn = false }: { signedIn?: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [postsError, setPostsError] = useState(false);
  const [userId, setUserId] = useState("");
  const [category, setCategory] = useState("all");
  const [draftCategory, setDraftCategory] = useState("cheer");
  const [composeOpen, setComposeOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentBusy, setCommentBusy] = useState("");
  const [verificationBusyId, setVerificationBusyId] = useState("");
  const [adminNotice, setAdminNotice] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [trafficError, setTrafficError] = useState("");

  const categoryLabel = useMemo(() => Object.fromEntries(COMMUNITY_CATEGORIES), []);
  const playPosts = posts.filter((post) => post.category === "cheer");
  const featuredPost = playPosts[0];
  const storyPosts = playPosts.slice(1, 6);
  const visiblePosts = category === "all" ? posts : posts.filter((post) => post.category === category);

  function startStory(nextCategory = "cheer") {
    setDraftCategory(nextCategory);
    setComposeOpen(true);
    window.setTimeout(() => {
      document.getElementById("community-compose")?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus({ preventScroll: true });
    }, 50);
  }

  function openPost(post: Post) {
    setCategory(post.category);
    setExpandedPostId(post.id);
    window.setTimeout(() => document.getElementById(`community-post-${post.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const load = useCallback(async () => {
    try {
      const [memberResponse, postResponse, statsResponse, notificationResponse] = await Promise.all([
        signedIn ? fetch("/api/member-profile", { cache: "no-store" }) : Promise.resolve(Response.json({})),
        fetch("/api/community/posts", { cache: "no-store" }),
        fetch("/api/member-stats", { cache: "no-store" }),
        signedIn ? fetch("/api/community/notifications", { cache: "no-store" }) : Promise.resolve(Response.json({})),
      ]);
      const memberPayload = await memberResponse.json().catch(() => ({}));
      const postPayload = await postResponse.json().catch(() => ({}));
      const statsPayload = await statsResponse.json().catch(() => ({}));
      const notificationPayload = await notificationResponse.json().catch(() => ({}));
      if (memberResponse.ok) {
        setProfile(memberPayload.profile);
        setDisplayName(memberPayload.profile?.display_name === "아마ON 회원" ? "" : memberPayload.profile?.display_name || "");
        setSchoolName(memberPayload.profile?.school_name || "");
        setMembers(memberPayload.members || []);
        setStats(memberPayload.stats || null);
      }
      if (postResponse.ok) {
        setPosts(postPayload.items || []);
        setUserId(postPayload.userId || "");
        setPostsError(false);
      } else {
        setPostsError(true);
      }
      if (statsResponse.ok) setTotalMembers(Number(statsPayload.totalMembers || 0));
      if (notificationResponse.ok) setNotifications(notificationPayload.items || []);
      const error = memberPayload.error || postPayload.error || statsPayload.error;
      if (error) setNotice(error);
    } catch {
      setPostsError(true);
      setNotice("커뮤니티를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPostsLoaded(true);
    }
  }, [signedIn]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!adminOpen || !profile?.isAdmin || trafficStats) return;
    fetch("/api/site-analytics", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "방문 통계를 불러오지 못했습니다.");
        setTrafficStats(payload);
      })
      .catch((error) => setTrafficError(error instanceof Error ? error.message : "방문 통계를 불러오지 못했습니다."));
  }, [adminOpen, profile?.isAdmin, trafficStats]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setNotice("");
    const response = await fetch("/api/member-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, schoolName }) });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setNotice(payload.error || "회원 정보를 수정하지 못했습니다.");
    setProfileEditOpen(false);
    setNotice("닉네임과 소속 정보를 수정했습니다.");
    await load();
  }

  async function submitPost(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setNotice("");
    const response = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: draftCategory, title, content }) });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setNotice(payload.error || "글을 등록하지 못했습니다.");
    setTitle(""); setContent(""); setCategory(draftCategory); setComposeOpen(false); setExpandedPostId(payload.item?.id || null); setNotice("게시글을 등록했습니다. 활동 점수 +10");
    await load();
    window.setTimeout(() => document.getElementById(`community-post-${payload.item?.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  async function moderate(action: string, post: Post) {
    const reason = action === "report" ? window.prompt("신고 사유를 입력해 주세요.", "부적절한 게시물") : "";
    if (action === "report" && reason === null) return;
    const response = await fetch("/api/community/moderation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, postId: post.id, blockedUserId: post.author_id, targetUserId: post.author_id, reason }) });
    const payload = await response.json().catch(() => ({}));
    setNotice(response.ok ? action === "block" ? "해당 회원의 글을 차단했습니다." : action === "report" ? "운영팀에 신고했습니다." : "운영 조치를 적용했습니다." : payload.error || "처리하지 못했습니다.");
    if (response.ok) await load();
  }

  async function verify(member: Profile, identityStatus: "verified" | "rejected") {
    if (verificationBusyId) return;
    setVerificationBusyId(member.user_id);
    setAdminNotice(null);
    try {
      const response = await fetch("/api/member-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUserId: member.user_id, identityStatus }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "인증 상태를 변경하지 못했습니다.");
      await load();
      setAdminNotice({
        kind: "success",
        message: `${member.display_name} 회원을 ${identityStatus === "verified" ? "인증 완료" : "인증 반려"}로 변경했습니다.`,
      });
    } catch (error) {
      setAdminNotice({ kind: "error", message: error instanceof Error ? error.message : "인증 상태를 변경하지 못했습니다." });
    } finally {
      setVerificationBusyId("");
    }
  }

  async function linkMember(member: Profile) {
    const linkedTeamId = window.prompt("선수의 팀 ID를 입력하세요. (예: gd-roster)", member.linked_team_id || "");
    if (linkedTeamId === null) return;
    const linkedPlayerId = window.prompt("선수 프로필 ID를 입력하세요. (예: 13)", member.linked_player_id || "");
    if (linkedPlayerId === null) return;
    const response = await fetch("/api/member-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetUserId: member.user_id, linkedTeamId, linkedPlayerId }) });
    const payload = await response.json().catch(() => ({}));
    setNotice(response.ok ? "회원과 선수 프로필을 연결했습니다." : payload.error || "선수 프로필을 연결하지 못했습니다.");
    if (response.ok) await load();
  }

  async function submitComment(event: FormEvent, postId: string) {
    event.preventDefault();
    const comment = (commentDrafts[postId] || "").trim();
    if (!comment) return;
    setCommentBusy(postId); setNotice("");
    const response = await fetch("/api/community/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId, content: comment }) });
    const payload = await response.json().catch(() => ({}));
    setCommentBusy("");
    if (!response.ok) return setNotice(payload.error || "댓글을 등록하지 못했습니다.");
    setCommentDrafts((drafts) => ({ ...drafts, [postId]: "" }));
    await load();
  }

  async function deleteComment(commentId: string) {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    const response = await fetch(`/api/community/comments?id=${encodeURIComponent(commentId)}`, { method: "DELETE" });
    const payload = await response.json().catch(() => ({}));
    setNotice(response.ok ? "댓글을 삭제했습니다." : payload.error || "댓글을 삭제하지 못했습니다.");
    if (response.ok) await load();
  }

  async function markNotificationsRead() {
    if (!notifications.some((item) => !item.read_at)) return;
    const response = await fetch("/api/community/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    if (response.ok) setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
  }

  function toggleNotifications() {
    setNotificationOpen((open) => !open);
    if (!notificationOpen) void markNotificationsRead();
  }

  function openNotification(item: NotificationItem) {
    setNotificationOpen(false);
    if (item.notification_type === "media_like" && item.team_id && item.player_id) {
      window.location.assign(`/?team=${encodeURIComponent(item.team_id)}&player=${encodeURIComponent(item.player_id)}#${encodeURIComponent(item.team_id)}`);
      return;
    }
    const post = posts.find((entry) => entry.id === item.post_id);
    if (post) { setCategory(post.category); setExpandedPostId(post.id); }
    window.setTimeout(() => document.getElementById(`community-post-${item.post_id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  function downloadMembers(role: string = "all") {
    window.location.href = `/api/admin/members-export?role=${encodeURIComponent(role)}`;
  }

  return <section className="community-section" id="community">
    <div className="section-console-bar inverted">
      <span><i /> 04 · COMMUNITY CLUBHOUSE</span>
      <small>OPEN TO READ · MEMBERS TO WRITE</small>
    </div>
    <div className="community-story-hero">
      <div className="community-story-hero-copy">
        <p className="community-story-kicker">AMAON COMMUNITY</p>
        <h2>오늘의 <em>플레이</em></h2>
        <p>오늘 경기에서 기억에 남은 한 장면을 나눠요.</p>
        {signedIn
          ? <button type="button" className="community-story-cta" onClick={() => startStory("cheer")}>장면 남기기 <span aria-hidden="true">↗</span></button>
          : <a className="community-story-cta" href="/login?mode=signup&returnTo=%2F%23community">가입하고 장면 남기기 <span aria-hidden="true">↗</span></a>}
      </div>
      <small className="community-story-hero-note">{totalMembers > 0 ? `${totalMembers.toLocaleString()}명의 회원이 함께하고 있어요` : "기록 너머, 우리가 기억하는 순간"}</small>
    </div>
    <div className="community-story-feature-head"><div><span>01</span><h3>오늘의 장면</h3></div><small>회원이 남긴 경기 이야기</small></div>
    {featuredPost ? <button type="button" className="community-story-feature" onClick={() => openPost(featuredPost)} aria-label={`${featuredPost.title} 게시글 보기`}>
      <span className="community-story-feature-art" aria-hidden="true" />
      <span className="community-story-feature-copy"><small>경기 후기·응원</small><strong>{featuredPost.title}</strong><span>{featuredPost.content}</span><span className="community-story-feature-meta">{featuredPost.author?.display_name || "아마ON 회원"} <span>·</span> 댓글 {featuredPost.comments?.length || 0} <b>이야기 보기 ↗</b></span></span>
    </button> : <div className="community-story-feature community-story-feature-empty">
      <span className="community-story-feature-art" aria-hidden="true" />
      <div className="community-story-feature-copy"><small>{postsError ? "TRY AGAIN" : postsLoaded ? "FIRST PLAY" : "LOADING"}</small><strong>{postsError ? "경기 이야기를 불러오지 못했어요." : postsLoaded ? "첫 번째 장면을 기다리고 있어요." : "경기 이야기를 불러오는 중이에요."}</strong>{postsError ? <span>잠시 후 다시 방문하거나 아래에서 다시 불러와 주세요.</span> : postsLoaded && <span>마음에 남은 경기 장면이나 우리 팀을 향한 응원을 들려주세요.</span>}</div>
    </div>}
    <div className="community-story-rail-head"><h3>{storyPosts.length ? "지금, 다른 팀들의 이야기" : "이런 이야기를 남겨보세요"}</h3><span>옆으로 넘겨 보세요 →</span></div>
    <div className="community-story-rail" aria-label="경기 후기와 응원 이야기">
      {storyPosts.length ? storyPosts.map((post) => <button type="button" key={post.id} className="community-story-tile" onClick={() => openPost(post)}>
        <span className="community-story-tile-mark" aria-hidden="true">✦</span><strong>{post.title}</strong><small>{post.author?.display_name || "아마ON 회원"} · 댓글 {post.comments?.length || 0}</small>
      </button>) : postsLoaded && !postsError && [
        ["기억에 남는 장면", "오늘 경기에서 본 한 장면을 남겨보세요."],
        ["우리 팀 응원", "끝까지 뛰어준 선수들에게 한마디를 전해요."],
        ["경기 끝나고", "승패보다 오래 남을 이야기를 들려주세요."],
      ].map(([heading, description]) => <div className="community-story-tile community-story-prompt" key={heading}><span className="community-story-tile-mark" aria-hidden="true">✦</span><strong>{heading}</strong><small>{description}</small></div>)}
    </div>
    {!signedIn && <div className="member-badge-card community-join-card"><div><strong>함께 쓰면 더 즐거운 야구 이야기</strong><p>회원가입 후 글과 댓글을 남기고, 아마ON 활동 등급도 쌓아보세요. 읽기는 누구나 가능합니다.</p><a href="/login?mode=signup&returnTo=%2F%23community">회원가입하고 참여하기</a><a href="/login?returnTo=%2F%23community">로그인</a></div></div>}
    {signedIn && <div className="member-badge-card">
      <div><span className="identity-badge">{profile?.identityBadge || "회원 확인 중"}</span><strong>{profile?.display_name || "아마ON 회원"}</strong><small>{profile?.school_name || "소속 정보 미입력"}</small><button className="member-profile-edit-toggle" type="button" onClick={() => setProfileEditOpen((open) => !open)}>{profileEditOpen ? "수정 닫기" : "닉네임·소속 수정"}</button></div>
      <div><span>활동 등급</span><strong>{profile?.activityLevel || "루키"}</strong><small>{Number(profile?.activity_points || 0).toLocaleString()} P</small></div>
      <p>신원 배지는 운영팀 확인 후 부여되며, 활동 등급과는 별도로 표시됩니다.</p>
      {profile?.isAdmin && <button type="button" onClick={() => setAdminOpen((open) => !open)}>{adminOpen ? "회원 관리 닫기" : "회원 데이터·인증 관리"}</button>}
      <button className="community-notification-toggle" type="button" aria-expanded={notificationOpen} onClick={toggleNotifications}>알림 <strong>{notifications.filter((item) => !item.read_at).length}</strong></button>
    </div>}
    {notificationOpen && <div className="community-notification-panel">
      <div><h3>내 알림</h3><button type="button" onClick={() => setNotificationOpen(false)}>닫기</button></div>
      {notifications.map((item) => <button className={item.read_at ? "" : "unread"} type="button" key={item.id} onClick={() => openNotification(item)}>
        <strong>{item.actorName}</strong><span>{item.notification_type === "post_comment" ? "내 게시글에 댓글을 남겼습니다." : "내 영상에 좋아요를 눌렀습니다."}</span><small>{new Date(item.created_at).toLocaleString("ko-KR")}</small>
      </button>)}
      {!notifications.length && <p>아직 새 알림이 없습니다.</p>}
    </div>}
    {profileEditOpen && <form className="member-profile-edit" onSubmit={saveProfile}>
      <div><h3>내 회원 정보 수정</h3><p>커뮤니티에는 이메일이 아닌 닉네임만 공개됩니다.</p></div>
      <label>닉네임<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40} required placeholder="공개할 닉네임" /></label>
      <label>소속<input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} maxLength={80} placeholder="학교 또는 야구단" /></label>
      <button disabled={busy}>{busy ? "저장 중…" : "저장"}</button>
    </form>}
    {adminOpen && profile?.isAdmin && <div className="member-verification-panel">
      <PlayerSubmissionAdmin />
      <VideoSubmissionAdmin />
      <div className="member-admin-heading"><div><h3>사이트 방문 통계</h3><p>운영자에게만 표시되며, 페이지를 열 때 한 번만 불러옵니다.</p></div></div>
      <div className="member-stat-grid traffic-stat-grid">
        <article><span>전체 방문자</span><strong>{trafficStats ? trafficStats.totalVisitors.toLocaleString() : "—"}명</strong></article>
        <article><span>전체 페이지 조회</span><strong>{trafficStats ? trafficStats.totalPageViews.toLocaleString() : "—"}회</strong></article>
        <article><span>오늘 방문자</span><strong>{trafficStats ? trafficStats.todayVisitors.toLocaleString() : "—"}명</strong></article>
        <article><span>오늘 페이지 조회</span><strong>{trafficStats ? trafficStats.todayPageViews.toLocaleString() : "—"}회</strong></article>
      </div>
      {trafficError && <p className="member-verification-notice error" role="status">{trafficError}</p>}
      <div className="member-admin-heading"><div><h3>회원 데이터 관리</h3><p>회원가입 구분별 현황을 확인하고 엑셀로 내려받을 수 있습니다.</p></div><button type="button" onClick={() => downloadMembers()}>전체 회원 엑셀 다운로드</button></div>
      <div className="member-stat-grid">
        <article><span>전체 회원·팔로워</span><strong>{Number(stats?.total || totalMembers).toLocaleString()}명</strong></article>
        <article><span>신원 인증 완료</span><strong>{Number(stats?.verified || 0).toLocaleString()}명</strong></article>
        <article><span>오늘 가입</span><strong>{Number(stats?.joinedToday || 0).toLocaleString()}명</strong></article>
      </div>
      <div className="member-role-export-grid">{MEMBER_ROLES.map((role) => <button type="button" key={role} onClick={() => downloadMembers(role)}><span>{MEMBER_ROLE_LABELS[role]}</span><strong>{Number(stats?.roleCounts?.[role] || 0).toLocaleString()}명</strong><small>엑셀 받기 ↓</small></button>)}</div>
      <h3>회원 신원 인증</h3>
      {adminNotice && <p className={`member-verification-notice ${adminNotice.kind}`} role="status" aria-live="polite">{adminNotice.message}</p>}
      <div className="member-verification-list">
        {members.filter((member) => !member.isAdmin).map((member) => {
          const isProcessing = verificationBusyId === member.user_id;
          return <div className="member-verification-row" key={member.user_id}>
            <span><strong>{member.display_name}</strong><small>{member.school_name || "소속 미입력"} · {member.identityBadge}</small></span>
            <div className="member-verification-actions">
              <button type="button" disabled={Boolean(verificationBusyId) || member.identity_status === "verified"} onClick={() => verify(member, "verified")}>{isProcessing ? "처리 중…" : member.identity_status === "verified" ? "인증됨" : "인증"}</button>
              <button type="button" disabled={Boolean(verificationBusyId) || member.identity_status === "rejected"} onClick={() => verify(member, "rejected")}>{isProcessing ? "처리 중…" : member.identity_status === "rejected" ? "반려됨" : "반려"}</button>
              <button type="button" disabled={Boolean(verificationBusyId)} onClick={() => linkMember(member)}>선수 프로필 연결</button>
            </div>
          </div>;
        })}
      </div>
    </div>}
    {notice && !composeOpen && <p className="community-story-notice" role="status">{notice}</p>}
    <div className="community-layout community-story-layout">
      {signedIn && composeOpen && <form className="community-compose community-story-compose" id="community-compose" onSubmit={submitPost}>
        <div className="community-compose-intro"><h3>오늘의 야구 이야기,<br />여기서 시작해요.</h3><p>짧은 응원 한마디도 좋아요. 함께 나누고 싶은 이야기를 남겨주세요.</p></div>
        <div className="community-compose-prompts" aria-label="글쓰기 주제 선택">
          <button type="button" onClick={() => { setDraftCategory("cheer"); titleInputRef.current?.focus(); }}>경기 응원하기 <span aria-hidden="true">↗</span></button>
          <button type="button" onClick={() => { setDraftCategory("question"); titleInputRef.current?.focus(); }}>야구 질문하기 <span aria-hidden="true">↗</span></button>
        </div>
        <label>게시판<select value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)}>{COMMUNITY_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>제목<input ref={titleInputRef} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required placeholder="어떤 이야기를 나누고 싶으세요?" /></label>
        <label>내용<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} required placeholder="선수 개인정보, 연락처, 주소, SNS 아이디는 적지 마세요." /></label>
        <button disabled={busy}>{busy ? "등록 중…" : "이야기 올리기 →"}</button>
        {notice && <p className="community-notice">{notice}</p>}
      </form>}
      <div className="community-feed" id="community-feed">
        <div className="community-feed-head">
          <div><small>MORE STORIES</small><strong>아마ON 이야기 더 보기</strong></div>
          {signedIn ? <button type="button" onClick={() => startStory(category === "all" ? "cheer" : category)}>이야기 남기기 ↗</button> : <a href="/login?mode=signup&returnTo=%2F%23community">회원으로 참여하기 ↗</a>}
        </div>
        <div className="community-tabs" role="group" aria-label="커뮤니티 게시판"><button type="button" aria-pressed={category === "all"} className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>전체</button>{COMMUNITY_CATEGORIES.map(([value, label]) => <button key={value} type="button" aria-pressed={category === value} className={`${category === value ? "active" : ""} ${value === "report" ? "community-tab-report" : ""}`} onClick={() => setCategory(value)}>{label}</button>)}</div>
        {visiblePosts.map((post) => {
          const author = post.author;
          const badge = author?.identity_badge || "인증 대기";
          const expanded = expandedPostId === post.id;
          return <article className={`community-post community-story-post ${expanded ? "expanded" : ""}`} id={`community-post-${post.id}`} key={post.id}>
            <header><span className="identity-badge small">{badge}</span><strong>{author?.display_name || "아마ON 회원"}</strong><small>{activityLevel(author?.activity_points || 0)} · {new Date(post.created_at).toLocaleDateString("ko-KR")}</small></header>
            <button type="button" className="community-post-toggle" aria-expanded={expanded} onClick={() => setExpandedPostId(expanded ? null : post.id)}><span className="post-category">{categoryLabel[post.category]}</span><h3>{post.title}</h3><span className="community-post-excerpt">{post.content}</span><span className="community-post-summary">댓글 {post.comments?.length || 0} <b>{expanded ? "접기 ↑" : "이야기 보기 →"}</b></span></button>
            {expanded && <><p className="community-post-full-content">{post.content}</p>
            {signedIn && <footer>
              {signedIn && post.author_id !== userId && <><button onClick={() => moderate("report", post)}>신고</button><button onClick={() => moderate("block", post)}>작성자 차단</button></>}
              {profile?.isAdmin && <><button onClick={() => moderate("hide", post)}>운영자 숨김</button><button onClick={() => moderate("suspend", post)}>7일 정지</button></>}
            </footer>}
            <div className="community-comments">
              <h4>댓글 <span>{post.comments?.length || 0}</span></h4>
              <div className="community-comment-list">{post.comments?.map((comment) => <div key={comment.id}>
                <p><strong>{comment.author?.display_name || "아마ON 회원"}</strong><small>{new Date(comment.created_at).toLocaleString("ko-KR")}</small></p>
                <span>{comment.content}</span>
                {(comment.author_id === userId || profile?.isAdmin) && <button type="button" onClick={() => deleteComment(comment.id)}>삭제</button>}
              </div>)}</div>
              {signedIn ? <form onSubmit={(event) => submitComment(event, post.id)}>
                <input aria-label="댓글 내용" value={commentDrafts[post.id] || ""} onChange={(event) => setCommentDrafts((drafts) => ({ ...drafts, [post.id]: event.target.value }))} maxLength={500} placeholder="서로를 존중하는 댓글을 남겨주세요" />
                <button disabled={commentBusy === post.id}>{commentBusy === post.id ? "등록 중…" : "댓글 등록"}</button>
              </form> : <a href="/login?returnTo=%2F%23community">로그인하고 댓글 남기기 →</a>}
            </div></>}
          </article>;
        })}
        {postsLoaded && !visiblePosts.length && <div className="community-empty">{postsError ? <>이야기를 불러오지 못했어요. <button type="button" onClick={() => void load()}>다시 불러오기</button></> : "아직 이 주제의 이야기가 없어요. 첫 번째 이야기를 남겨주세요."}</div>}
      </div>
    </div>
  </section>;
}
