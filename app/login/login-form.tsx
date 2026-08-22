"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../supabase/browser";
import "./style.css";
import { MEMBER_ROLES, MEMBER_ROLE_LABELS, type MemberRole } from "../community-model";

export default function LoginPage() {
  const params = useSearchParams();
  const returnTo = params.get("returnTo")?.startsWith("/") ? params.get("returnTo")! : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [memberRole, setMemberRole] = useState<MemberRole>("fan");
  const [schoolName, setSchoolName] = useState("");
  const [relatedPlayerName, setRelatedPlayerName] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim(), member_role: memberRole, school_name: schoolName.trim(), related_player_name: relatedPlayerName.trim(), identity_status: "pending" } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (result.data.session) window.location.assign(returnTo);
    else setMessage("가입 확인 메일을 확인한 뒤 로그인해 주세요.");
  }

  return <main className="login-shell">
    <section className="login-card">
      <span className="login-kicker">AMATEUR BASEBALL ON AIR</span>
      <h1>아마<span>ON</span></h1>
      <p>가입한 회원만 학교와 선수 프로필을 볼 수 있습니다.</p>
      <form onSubmit={submit}>
        {mode === "signup" && <>
          <label>이름 또는 활동명<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={40} autoComplete="name" /></label>
          <fieldset className="signup-roles"><legend>회원 유형</legend>{MEMBER_ROLES.map((item) => <button type="button" key={item} className={memberRole === item ? "active" : ""} onClick={() => setMemberRole(item)}>{MEMBER_ROLE_LABELS[item]}</button>)}</fieldset>
          <label>소속 학교·기관<input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder={memberRole === "fan" ? "선택 입력" : "학교 또는 기관명"} /></label>
          {(memberRole === "guardian") && <label>관련 선수 이름<input value={relatedPlayerName} onChange={(e) => setRelatedPlayerName(e.target.value)} placeholder="운영팀 인증에만 사용됩니다" /></label>}
          <p className="signup-safety">가입 즉시 학교·선수 검색과 커뮤니티를 이용할 수 있습니다. 신원 배지는 운영팀 확인 후 부여되며, 일반 회원에게 편집 권한은 제공되지 않습니다.</p>
        </>}
        <label>이메일<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        <button disabled={busy}>{busy ? "처리 중…" : mode === "login" ? "로그인" : "회원가입"}</button>
      </form>
      {message && <p className="login-message">{message}</p>}
      <button className="mode-button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
        {mode === "login" ? "처음이신가요? 회원가입" : "이미 가입했나요? 로그인"}
      </button>
    </section>
  </main>;
}
