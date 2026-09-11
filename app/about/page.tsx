import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../info-pages.module.css";

export const metadata: Metadata = {
  title: "아마온이란? | 아마ON 아마야구 선수 포트폴리오",
  description: "아마온(아마ON)은 기록, 영상, 사진과 선수의 이야기를 하나의 링크로 연결하는 아마야구 선수 프로필·포트폴리오 플랫폼입니다.",
  alternates: { canonical: "https://www.amaon.kr/about" },
  openGraph: {
    title: "아마온이란? | 아마ON",
    description: "기록은 결과를, 영상은 과정을, 프로필은 선수의 이야기를 보여줍니다.",
    url: "https://www.amaon.kr/about",
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "아마온이란?",
  alternateName: "아마ON",
  url: "https://www.amaon.kr/about",
  description: "아마온(아마ON)은 아마야구 선수가 자신의 기록과 영상, 프로필을 하나의 링크로 알리는 포트폴리오 플랫폼입니다.",
  isPartOf: { "@type": "WebSite", name: "아마온", alternateName: ["아마ON", "AMAON"], url: "https://www.amaon.kr/" },
  publisher: { "@type": "Organization", name: "한끼방패 브랜드랩", url: "https://www.amaon.kr/", sameAs: ["https://www.instagram.com/hankki09252/"] },
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <script id="about-amaon-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="아마온 홈으로">
          <Image src="/yamaon-logo.png" alt="아마온 아마ON 로고" width={72} height={72} priority />
          <span><strong>아마온(아마ON)</strong><small>AMATEUR BASEBALL ON AIR</small></span>
        </Link>
        <nav className={styles.nav} aria-label="소개 페이지 메뉴"><Link href="/">홈</Link><Link href="/guide">사용설명서</Link><Link href="/#players">선수 찾기</Link></nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>WHAT IS AMAON</p>
        <h1>아마온(아마ON)은<br /><em>선수를 알리는 포트폴리오</em>입니다.</h1>
        <p className={styles.heroLead}>아마온은 학교별 선수 정보와 기록만 나열하는 곳을 넘어, 선수의 사진과 경기 영상, 장점과 목표를 한곳에 담아 세상과 연결하는 아마야구 선수 프로필 플랫폼입니다.</p>
        <div className={styles.heroActions}><Link className={styles.primary} href="/#players">선수 프로필 보기 →</Link><Link className={styles.secondary} href="/guide">아마온 사용설명서</Link></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><small>WHY AMAON</small><h2>기록은 결과를,<br />프로필은 선수를 설명합니다.</h2></div>
          <p><strong>기록이 선수의 결과라면, 영상은 그 결과가 만들어지는 과정입니다.</strong> 아마온(아마ON)은 숫자만으로 다 전하기 어려운 선수의 움직임과 강점, 성장 과정과 목표를 함께 보여줍니다. 기록이 좋은 선수만을 위한 서비스가 아니라 모든 선수가 자신을 제대로 소개할 수 있는 공간을 지향합니다.</p>
        </div>
        <div className={styles.grid3}>
          <article className={styles.card}><b>01</b><small>RECORD</small><h3>기록은 기본</h3><p>학교, 학년, 포지션과 공식 기록을 바탕으로 선수의 현재를 한눈에 확인합니다.</p></article>
          <article className={styles.card}><b>02</b><small>FILM</small><h3>영상은 증명</h3><p>투구·타격·수비 영상으로 기록 뒤에 있는 플레이 과정과 선수의 장점을 보여줍니다.</p></article>
          <article className={styles.card}><b>03</b><small>PROFILE</small><h3>프로필은 설명</h3><p>선수의 강점, 목표와 이야기를 사진과 함께 담아 하나의 포트폴리오로 완성합니다.</p></article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.highlight}>
          <div><small>ONE PLAYER · ONE LINK</small><h2>나의 아마온 프로필을<br />하나의 링크로 공유하세요.</h2><p>완성된 선수 프로필 링크를 인스타그램 소개, 스토리, 메시지 또는 다른 SNS에 올리면 보는 사람이 학교 목록을 다시 찾지 않고 해당 선수의 프로필로 바로 들어올 수 있습니다.</p></div>
          <div><small>OPERATED BY</small><strong>한끼방패 브랜드랩</strong><span>경기·인천에서 시작해 지역을 순차적으로 확대합니다.</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><small>HOW IT WORKS</small><h2>누구나 보고,<br />선수는 직접 알립니다.</h2></div>
          <p>학교와 선수 프로필, 사진과 영상은 로그인 없이 자유롭게 볼 수 있습니다. 선수 또는 보호자가 등록·수정을 요청하면 운영팀이 내용을 확인한 뒤 공개 프로필에 반영합니다.</p>
        </div>
        <ol className={styles.steps}>
          <li><span>01</span><div><h3>선수 또는 학교를 찾습니다</h3><p>메인 검색창에서 학교명이나 선수명을 입력해 공개된 정보를 확인합니다.</p></div></li>
          <li><span>02</span><div><h3>사진·영상·프로필 정보를 보냅니다</h3><p>필요한 항목만 간단히 접수할 수 있으며, 직접 등록이 어렵다면 한끼방패 인스타그램 DM으로 전달할 수 있습니다.</p></div></li>
          <li><span>03</span><div><h3>운영팀 확인 후 공개합니다</h3><p>잘못된 정보나 부적절한 콘텐츠가 올라가지 않도록 승인 과정을 거쳐 선수 프로필과 공유 링크에 반영합니다.</p></div></li>
        </ol>
        <div className={styles.heroActions}><Link className={styles.primary} href="/guide">등록·설치 방법 자세히 보기 →</Link><a className={styles.secondary} href="https://www.instagram.com/hankki09252/" target="_blank" rel="noreferrer">한끼방패 인스타그램</a></div>
      </section>

      <footer className={styles.footer}><span>© 2026 HANKKI AMATEUR BASEBALL · 아마온(아마ON)</span><Link href="/">www.amaon.kr</Link></footer>
    </main>
  );
}
