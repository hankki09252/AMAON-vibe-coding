"use client";

import { FormEvent, useMemo, useState } from "react";

type School = {
  name: string;
  region: string;
  players: number;
  coach: string;
  featured?: boolean;
};

type Player = {
  name: string;
  school: string;
  position: string;
  grade: string;
  number: string;
  stat: string;
  detail: string;
  tone: string;
};

const schools: School[] = [
  { name: "덕수고", region: "서울", players: 45, coach: "정윤진", featured: true },
  { name: "서울고", region: "서울", players: 51, coach: "김동수", featured: true },
  { name: "경기고", region: "서울", players: 60, coach: "오규택" },
  { name: "휘문고", region: "서울", players: 42, coach: "오태근" },
  { name: "충암고", region: "서울", players: 51, coach: "이영복" },
  { name: "야탑고", region: "경기", players: 38, coach: "최경훈", featured: true },
  { name: "유신고", region: "경기", players: 42, coach: "홍석무" },
  { name: "인천고", region: "인천", players: 46, coach: "계기범" },
  { name: "경남고", region: "부산", players: 53, coach: "전광열" },
  { name: "부산고", region: "부산", players: 45, coach: "박계원" },
  { name: "대구상원고", region: "대구", players: 63, coach: "김승관" },
  { name: "광주제일고", region: "광주", players: 38, coach: "조윤채" },
];

const players: Player[] = [
  {
    name: "김○현",
    school: "서울고",
    position: "우완 투수",
    grade: "3학년",
    number: "18",
    stat: "최고 148 km/h",
    detail: "직구 평균 144 km/h · 슬라이더 / 체인지업",
    tone: "lime",
  },
  {
    name: "박○준",
    school: "야탑고",
    position: "유격수",
    grade: "2학년",
    number: "07",
    stat: "AVG .378",
    detail: "42타석 · 14타점 · 도루 8",
    tone: "coral",
  },
  {
    name: "이○우",
    school: "경남고",
    position: "포수",
    grade: "3학년",
    number: "22",
    stat: "POP 1.91 sec",
    detail: "도루 저지율 41% · 경기 영상 6개",
    tone: "blue",
  },
];

const regions = ["전체", "서울", "경기", "인천", "부산", "대구", "광주"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState("선수 본인");

  const filteredSchools = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return schools.filter((school) => {
      const matchesRegion = region === "전체" || school.region === region;
      const matchesQuery = !keyword || `${school.name} ${school.region} ${school.coach}`.toLowerCase().includes(keyword);
      return matchesRegion && matchesQuery;
    });
  }, [query, region]);

  function openJoin() {
    setSubmitted(false);
    setJoinOpen(true);
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label="야마ON 홈">
          <img src="/yamaon-logo.png" alt="" />
          <span><b>야마ON</b><small>BY 한끼방패</small></span>
        </a>
        <nav aria-label="주요 메뉴">
          <a href="#schools">학교 찾기</a>
          <a href="#players">선수 프로필</a>
          <a href="#how">등록 안내</a>
        </nav>
        <button className="outline-button" onClick={openJoin}>프로필 등록</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> AMATEUR BASEBALL ON AIR</p>
          <h1>야구의 모든 순간,<br /><em>지금 ON.</em></h1>
          <p className="hero-lead">학교와 선수, 기록과 영상을 한곳에서.<br />고교야구의 모든 순간을 선명하게 남깁니다.</p>
          <div className="hero-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => document.getElementById("schools")?.scrollIntoView({ behavior: "smooth" })}
              placeholder="학교명, 지역, 감독 검색"
              aria-label="학교명, 지역, 감독 검색"
            />
            <a href="#schools">검색</a>
          </div>
          <div className="hero-counts" aria-label="서비스 현황 예시">
            <div><strong>103</strong><span>등록 학교</span></div>
            <div><strong>3,842</strong><span>선수 프로필</span></div>
            <div><strong>12,406</strong><span>경기 영상</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="이번 주 주목할 선수 샘플">
          <div className="score-grid" />
          <div className="broadcast-corner corner-a" />
          <div className="broadcast-corner corner-b" />
          <span className="on-air"><i /> ON AIR</span>
          <img className="hero-logo-image" src="/yamaon-logo.png" alt="야마ON by 한끼방패" />
          <div className="ticker"><b>LIVE</b><span>PLAYER · TEAM · RECORD · FILM · HIGH SCHOOL BASEBALL</span></div>
        </div>
      </section>

      <section className="school-section" id="schools">
        <div className="section-title">
          <div><p className="kicker dark"><span /> TEAM DIRECTORY</p><h2>학교별로 찾기</h2></div>
          <p>2026 고교야구 등록팀을 지역별로 살펴보세요.</p>
        </div>
        <div className="filters" aria-label="지역 필터">
          {regions.map((item) => (
            <button key={item} className={region === item ? "active" : ""} onClick={() => setRegion(item)}>{item}</button>
          ))}
        </div>
        <div className="directory-head"><span>TEAM / REGION</span><span>ROSTER</span></div>
        <div className="school-list">
          {filteredSchools.length ? filteredSchools.map((school, index) => (
            <article className="school-row" key={school.name}>
              <span className="school-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="school-emblem" aria-hidden="true">{school.name.slice(0, 1)}</div>
              <div className="school-name"><h3>{school.name}</h3><p>{school.region} · 감독 {school.coach}</p></div>
              {school.featured && <span className="verified">✓ 정보 확인</span>}
              <div className="roster"><strong>{school.players}</strong><span>명</span></div>
              <button className="arrow-button" aria-label={`${school.name} 상세 보기`}>↗</button>
            </article>
          )) : <div className="empty">조건에 맞는 학교가 없습니다. 다른 지역이나 검색어를 선택해 주세요.</div>}
        </div>
        <p className="data-note">학교·선수 수는 제공하신 2026년 자료를 바탕으로 구성한 시안 데이터입니다.</p>
      </section>

      <section className="player-section" id="players">
        <div className="section-title light">
          <div><p className="kicker"><span /> VERIFIED PLAYER PROFILE</p><h2>기록보다 더 깊게</h2></div>
          <p>숫자, 영상, 성장 과정까지 한 장의 프로필로 보여줍니다.</p>
        </div>
        <div className="player-grid">
          {players.map((player, index) => (
            <button className={`player-card ${player.tone}`} key={player.name} onClick={() => setSelectedPlayer(player)}>
              <div className="player-card-top"><span>0{index + 1}</span><small>샘플 프로필</small></div>
              <div className="player-figure"><span>{player.number}</span></div>
              <div className="player-data">
                <p>{player.school} · {player.grade}</p>
                <h3>{player.name}</h3>
                <div><span>{player.position}</span><strong>{player.stat}</strong></div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="how-copy">
          <p className="kicker dark"><span /> TRUSTED PROFILE SYSTEM</p>
          <h2>누구나 신청하고,<br />확인된 정보만 공개합니다.</h2>
          <p>운영자가 학교 기본 정보를 먼저 만들고, 선수·보호자·학교 관계자가 프로필을 신청하는 혼합형 운영입니다.</p>
          <button className="solid-button" onClick={openJoin}>내 프로필 등록 신청 <span>↗</span></button>
        </div>
        <ol className="steps">
          <li><span>01</span><div><strong>역할을 선택해 신청</strong><p>선수 본인, 보호자 또는 지도자가 기본 정보를 입력합니다.</p></div></li>
          <li><span>02</span><div><strong>소속과 보호자 동의 확인</strong><p>재학·소속 자료와 보호자 동의를 운영팀이 확인합니다.</p></div></li>
          <li><span>03</span><div><strong>사진·영상·기록 검수</strong><p>저작권과 공개 범위를 확인한 콘텐츠만 프로필에 게시합니다.</p></div></li>
          <li><span>04</span><div><strong>인증 배지와 함께 공개</strong><p>수정 이력을 관리하고 당사자는 언제든 비공개를 요청할 수 있습니다.</p></div></li>
        </ol>
      </section>

      <section className="safety-band">
        <div><span className="shield">✓</span><div><strong>미성년 선수 보호가 먼저입니다</strong><p>상세 생년월일, 연락처, 주소는 공개하지 않습니다. 영상·사진은 권리 확인 후 게시합니다.</p></div></div>
        <a href="#how">운영 원칙 보기 →</a>
      </section>

      <section className="cta-section">
        <p>YOUR STORY STARTS HERE</p>
        <h2>당신의 야구를<br /><em>기록으로 남기세요.</em></h2>
        <button onClick={openJoin}>프로필 등록 시작하기 <span>↗</span></button>
      </section>

      <footer>
        <a className="brand-lockup footer-brand" href="#top"><img src="/yamaon-logo.png" alt="" /><span><b>야마ON</b><small>BY 한끼방패</small></span></a>
        <p>고교야구 선수와 팀의 오늘을 기록합니다.</p>
        <small>© 2026 HANKKI AMATEUR BASEBALL</small>
      </footer>

      {selectedPlayer && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedPlayer(null)}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-label={`${selectedPlayer.name} 선수 프로필`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPlayer(null)} aria-label="닫기">×</button>
            <p className="kicker dark"><span /> PLAYER PROFILE · SAMPLE</p>
            <div className="modal-player-head"><div className="mini-jersey">{selectedPlayer.number}</div><div><small>{selectedPlayer.school} · {selectedPlayer.grade}</small><h2>{selectedPlayer.name}</h2><b>{selectedPlayer.position}</b></div></div>
            <div className="stat-panel"><strong>{selectedPlayer.stat}</strong><span>{selectedPlayer.detail}</span></div>
            <div className="video-strip"><div><span>▶</span><small>GAME FILM 01</small></div><div><span>▶</span><small>GAME FILM 02</small></div></div>
            <p className="modal-note">화면 구성 확인을 위한 익명 샘플 프로필입니다.</p>
          </section>
        </div>
      )}

      {joinOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setJoinOpen(false)}>
          <section className="join-modal" role="dialog" aria-modal="true" aria-label="프로필 등록 신청" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setJoinOpen(false)} aria-label="닫기">×</button>
            {submitted ? (
              <div className="success-state">
                <span>✓</span><p>REGISTRATION REQUEST</p><h2>신청서가 준비됐습니다.</h2>
                <p>현재 시안에서는 제출 화면까지만 제공됩니다. 실제 서비스에서는 보호자 동의와 소속 확인 후 운영팀 검수가 시작됩니다.</p>
                <button className="solid-button" onClick={() => setJoinOpen(false)}>확인</button>
              </div>
            ) : (
              <form onSubmit={submitProfile}>
                <p className="kicker dark"><span /> PROFILE REGISTRATION</p>
                <h2>프로필 등록 신청</h2>
                <p className="form-lead">신청자 역할을 먼저 선택해 주세요.</p>
                <div className="role-tabs">
                  {["선수 본인", "보호자", "지도자"].map((item) => <button type="button" key={item} className={role === item ? "active" : ""} onClick={() => setRole(item)}>{item}</button>)}
                </div>
                <label>선수 이름<input required placeholder="실명 입력" /></label>
                <label>소속 학교<input required placeholder="학교명 입력" /></label>
                <div className="form-row"><label>학년<select defaultValue=""><option value="" disabled>선택</option><option>1학년</option><option>2학년</option><option>3학년</option></select></label><label>포지션<input required placeholder="예: 우완 투수" /></label></div>
                <label className="upload-box"><input type="file" accept="image/*,video/*" multiple /><span>＋ 사진·영상 추가</span><small>JPG, PNG, MP4 · 실제 업로드는 저장소 연결 후 활성화됩니다.</small></label>
                <label className="agree"><input type="checkbox" required /><span>개인정보 처리 및 프로필 검수 절차에 동의합니다.</span></label>
                <button className="submit-button" type="submit">등록 신청서 확인 <span>↗</span></button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
