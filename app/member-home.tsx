"use client";

// The signed-in member experience. Authentication is enforced by app/page.tsx.

import { FormEvent, useMemo, useState } from "react";
import GdRoster, { gdPlayers } from "./gd-roster";
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
import PwaInstallButton from "./pwa-install-button";

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
  { name: "라온고", region: "경기", players: 49, coach: "강봉수" },
  { name: "백송고", region: "경기", players: 32, coach: "박종호" },
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

const regions = ["전체", "서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "세종"];

const rosterSectionBySchool: Record<string, string> = {
  "GD챌린저스BC(U-18)": "gd-roster",
  "경기고": "gyeonggi-roster",
  "경기상업고": "gyeongsang-roster",
  "경동고": "kyungdong-roster",
  "강릉고": "gangneung-roster",
  "덕수고": "deoksu-roster",
  "명지BC(U-18)": "myeongji-roster",
  "배명고": "baemyeong-roster",
  "배재고": "baekjae-roster",
  "서울HG야구단(U-18)": "seoul-hg-roster",
  "서울HK야구단(U-18)": "seoul-hk-roster",
  "서울고": "seoul-roster",
  "서울동산고": "seoul-dongsan-roster",
  "서울디자인고": "seoul-design-roster",
  "서울아이티고BC": "seoul-it-roster",
  "서울자동차고": "seoul-auto-roster",
  "서울컨벤션고": "seoul-convention-roster",
  "선린인터넷고": "sunrin-roster",
  "성남고": "seongnam-roster",
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
];

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

  const matchingPlayers = useMemo(() => {
    const keyword = query.trim().replace(/\s+/g, "").toLowerCase();
    if (!keyword) return [];
    return playerSearchIndex.filter(({ player }) => player.name.replace(/\s+/g, "").toLowerCase().includes(keyword)).slice(0, 8);
  }, [query]);

  function jumpToSection(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, left: 0, behavior: "auto" });
    window.history.replaceState(null, "", `#${sectionId}`);
    requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = previousScrollBehavior; });
  }

  function openSearchedPlayer(result: (typeof playerSearchIndex)[number]) {
    const url = new URL(window.location.href);
    url.searchParams.set("team", result.sectionId);
    url.searchParams.set("player", result.player.id);
    url.hash = result.sectionId;
    window.location.assign(url.toString());
  }

  function searchSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = query.trim().replace(/\s+/g, "").toLowerCase();
    const exactPlayers = playerSearchIndex.filter(({ player }) => player.name.replace(/\s+/g, "").toLowerCase() === keyword);
    const playerMatch = exactPlayers.length === 1 ? exactPlayers[0] : exactPlayers.length === 0 && matchingPlayers.length === 1 ? matchingPlayers[0] : null;
    if (playerMatch) {
      openSearchedPlayer(playerMatch);
      return;
    }
    if (exactPlayers.length > 1 || matchingPlayers.length > 1) return;

    const exactMatch = schools.find((school) => school.name.replace(/\s+/g, "").toLowerCase() === keyword);
    const match = exactMatch ?? (filteredSchools.length === 1 ? filteredSchools[0] : null);

    if (match) setRegion(match.region);
    const sectionId = match ? rosterSectionBySchool[match.name] : undefined;
    requestAnimationFrame(() => jumpToSection(sectionId ?? "schools"));
  }

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
        <a className="brand-lockup" href="#top" aria-label="아마ON 홈">
          <span className="amaon-mark" aria-hidden="true"><i>●</i><strong>아마<em>ON</em></strong></span>
          <span><b>아마ON</b><small>BY 한끼방패</small></span>
        </a>
        <nav aria-label="주요 메뉴">
          <a href="#schools">학교 찾기</a>
          <a href="#gd-roster">GD 선수단</a>
          <a href="#players">선수 프로필</a>
          <a href="#how">등록 안내</a>
        </nav>
        <PwaInstallButton />
        <button className="outline-button" onClick={openJoin}>프로필 등록</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> AMATEUR BASEBALL ON AIR</p>
          <h1><span className="hero-title-line">야구의 모든 순간,</span><br /><em>지금 ON.</em></h1>
          <p className="hero-lead">학교와 선수, 기록과 영상을 한곳에서.<br />고교야구의 모든 순간을 선명하게 남깁니다.</p>
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
          <div className="hero-brand-mark" aria-label="아마ON by 한끼방패"><span className="hero-brand-signal">●</span><strong><span>아마</span><em>ON</em></strong><small>BY 한끼방패</small></div>
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
              {rosterSectionBySchool[school.name] ? (
                <button className="school-name school-name-link" onClick={() => jumpToSection(rosterSectionBySchool[school.name])}>
                  <h3>{school.name}</h3><p>{school.region} · 감독 {school.coach}</p>
                </button>
              ) : <div className="school-name"><h3>{school.name}</h3><p>{school.region} · 감독 {school.coach}</p></div>}
              {school.featured && <span className="verified">✓ 정보 확인</span>}
              <div className="roster"><strong>{school.players}</strong><span>명</span></div>
            </article>
          )) : <div className="empty">조건에 맞는 학교가 없습니다. 다른 지역이나 검색어를 선택해 주세요.</div>}
        </div>
        <p className="data-note">학교·선수 수는 제공하신 2026년 자료를 바탕으로 구성한 시안 데이터입니다.</p>
      </section>

      <GdRoster />
      <GyeonggiRoster />
      <GyeongsangRoster />
      <KyungdongRoster />
      <GangneungRoster />
      <DeoksuRoster />
      <MyeongjiRoster />
      <BaemyeongRoster />
      <BaekjaeRoster />
      <SeoulHgRoster />
      <SeoulHkRoster />
      <SeoulRoster />
      <SeoulDongsanRoster />
      <SeoulDesignRoster />
      <SeoulItRoster />
      <SeoulAutoRoster />
      <SeoulConventionRoster />
      <SunrinRoster />
      <SeongnamRoster />

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
        <a className="brand-lockup footer-brand" href="#top"><span className="amaon-mark" aria-hidden="true"><i>●</i><strong>아마<em>ON</em></strong></span><span><b>아마ON</b><small>BY 한끼방패</small></span></a>
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
