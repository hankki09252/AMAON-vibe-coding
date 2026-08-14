"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../supabase/browser";
import "./style.css";

export default function LoginPage() {
  const params = useSearchParams();
  const returnTo = params.get("returnTo")?.startsWith("/") ? params.get("returnTo")! : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: email.split("@")[0] } } })
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
