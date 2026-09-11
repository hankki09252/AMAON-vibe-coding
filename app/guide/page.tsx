import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../info-pages.module.css";

export const metadata: Metadata = {
  title: "아마온 사용설명서 | 선수 프로필 등록·공유·앱 설치",
  description: "아마온(아마ON)에서 선수 프로필과 사진·영상을 등록하고, 운영팀 승인 후 프로필 링크를 공유하고 휴대폰 앱처럼 설치하는 방법을 안내합니다.",
  alternates: { canonical: "https://www.amaon.kr/guide" },
  openGraph: {
    title: "아마온 사용설명서 | 아마ON",
    description: "선수 프로필 등록부터 공유 링크와 휴대폰 설치까지 한 번에 확인하세요.",
    url: "https://www.amaon.kr/guide",
    type: "article",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "아마온(아마ON) 선수 프로필 사용설명서",
  description: "아마온 선수 프로필 등록, 승인, 공유와 휴대폰 설치 방법",
  step: [
    { "@type": "HowToStep", name: "선수 찾기", text: "아마온 홈에서 학교명 또는 선수명으로 선수를 찾습니다." },
    { "@type": "HowToStep", name: "자료 등록", text: "선수 영상, 대표 프로필 사진, 경기 사진 또는 프로필 수정 내용을 접수합니다." },
    { "@type": "HowToStep", name: "운영팀 확인", text: "운영팀이 접수 자료를 확인하고 승인한 뒤 공개 프로필에 반영합니다." },
    { "@type": "HowToStep", name: "프로필 공유", text: "완성된 선수 프로필 링크를 SNS에 공유합니다." },
  ],
};

export default function GuidePage() {
  return (
    <main className={styles.page}>
      <script id="amaon-guide-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="아마온 홈으로">
          <Image src="/yamaon-logo.png" alt="아마온 아마ON 로고" width={72} height={72} priority />
          <span><strong>아마온 사용설명서</strong><small>AMAON PLAYER GUIDE</small></span>
        </Link>
        <nav className={styles.nav} aria-label="사용설명서 메뉴"><Link href="/">홈</Link><Link href="/about">아마온 소개</Link><Link href="/#players">선수 찾기</Link></nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>AMAON · PLAYER PORTFOLIO GUIDE</p>
        <h1>처음이어도 쉽게,<br /><em>아마온 사용설명서</em></h1>
        <p className={styles.heroLead}>아마온(아마ON)은 누구나 로그인 없이 학교와 선수 프로필을 볼 수 있습니다. 선수 또는 보호자는 필요한 자료만 직접 접수하고, 운영팀 승인 후 하나의 선수 포트폴리오 링크로 공유할 수 있습니다.</p>
        <div className={styles.heroActions}><Link className={styles.primary} href="/">아마온 시작하기 →</Link><Link className={styles.secondary} href="/about">아마온이란?</Link></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><small>01 · BROWSE</small><h2>가입 없이<br />먼저 둘러보세요.</h2></div>
          <p>아마온의 학교 정보, 선수 프로필, 사진과 영상, 커뮤니티 게시글 읽기는 로그인 없이 이용할 수 있습니다. 회원가입은 게시글·댓글·좋아요·신고 등 직접 참여할 때만 필요합니다.</p>
        </div>
        <div className={styles.note}>홈의 검색창에 학교명 또는 선수명을 입력하면 해당 학교와 선수 프로필을 확인할 수 있습니다. 선수의 공유 링크를 받은 경우에는 링크를 누르면 프로필로 바로 연결됩니다.</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><small>02 · REGISTER</small><h2>필요한 항목<br />하나만 보내세요.</h2></div>
          <p><strong>홈 화면의 ‘선수 프로필 등록·수정’ 버튼</strong>을 누른 뒤 기존 선수를 찾고, 대표 프로필 사진·경기 사진·영상·프로필 내용 중 필요한 항목을 선택합니다. 한 번에 모든 정보를 작성하지 않아도 됩니다.</p>
        </div>
        <ol className={styles.steps}>
          <li><span>01</span><div><h3>선수를 검색합니다</h3><p>선수 이름이나 학교명으로 기존 선수를 찾습니다. 전학한 경우에는 전학 요청을 별도로 선택해 새 학교를 검색할 수 있습니다.</p></div></li>
          <li><span>02</span><div><h3>사진·영상·프로필 중 필요한 자료를 등록합니다</h3><p>대표 사진과 추가 사진, 90초 이내 영상 또는 선수의 장점·목표 같은 프로필 정보를 접수합니다.</p></div></li>
          <li><span>03</span><div><h3>연락처와 필수 동의를 확인합니다</h3><p>선수 본인 또는 보호자임을 선택하고, 운영팀 확인 결과를 안내받을 연락처를 남깁니다.</p></div></li>
          <li><span>04</span><div><h3>운영팀 승인 후 프로필에 반영됩니다</h3><p>접수 자료는 바로 공개되지 않습니다. 운영팀이 선수와 내용을 확인한 뒤 승인된 사진·영상·정보만 공개합니다.</p></div></li>
        </ol>
        <div className={styles.heroActions}><Link className={styles.primary} href="/#top">홈에서 직접 등록하기 →</Link><a className={styles.secondary} href="https://www.instagram.com/hankki09252/" target="_blank" rel="noreferrer">어렵다면 한끼방패 DM</a></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><small>03 · SHARE</small><h2>완성된 프로필을<br />SNS에 공유하세요.</h2></div>
          <p>선수 프로필의 <strong>‘프로필 공유’</strong>를 누르면 개인 링크를 복사할 수 있습니다. 인스타그램 소개, 스토리, 게시물 또는 다른 SNS에 붙여 넣으면 링크를 누른 사람이 선수 프로필로 바로 이동합니다.</p>
        </div>
        <div className={styles.highlight}>
          <div><small>ONE LINK PORTFOLIO</small><h2>PROFILE · STORY · FILM</h2><p>학교, 기록, 사진, 선수의 이야기와 경기 영상을 하나의 아마온 링크에 담습니다.</p></div>
          <div><small>AMAON PLAYER LINK</small><strong>나의 선수 프로필로<br />바로 연결</strong><span>링크가 선수의 온라인 포트폴리오가 됩니다.</span></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.install}>
          <div className={styles.installCopy}>
            <small className={styles.eyebrow}>04 · INSTALL AMAON</small>
            <h2>휴대폰에<br />앱처럼 설치하세요.</h2>
            <p>안드로이드 휴대폰의 크롬 주소창에 <strong>www.amaon.kr</strong>을 입력하면 ‘아마ON by 한끼방패 설치’ 안내가 나타납니다. 설치를 누르면 홈 화면에 아마온 아이콘이 생깁니다.</p>
            <ol className={styles.steps}>
              <li><span>01</span><div><h3>크롬에서 www.amaon.kr 접속</h3><p>주소창에 공식 주소를 직접 입력합니다.</p></div></li>
              <li><span>02</span><div><h3>‘설치’ 또는 ‘홈 화면에 추가’ 선택</h3><p>안내가 없다면 크롬 오른쪽 위 메뉴에서 앱 설치를 선택합니다.</p></div></li>
              <li><span>03</span><div><h3>홈 화면 아이콘으로 실행</h3><p>앱스토어나 Vercel 가입 없이 아마온을 바로 실행할 수 있습니다.</p></div></li>
            </ol>
          </div>
          <div className={styles.installImages}>
            <figure><Image src="/guide/amaon-chrome-install.jpg" alt="안드로이드 크롬의 아마온 설치 안내 화면" width={1440} height={2783} sizes="(max-width: 760px) 65vw, 330px" /><figcaption>크롬의 아마온 설치 안내</figcaption></figure>
            <figure><Image src="/guide/amaon-installed-app.png" alt="휴대폰 홈 화면에 설치된 아마온 앱 아이콘" width={125} height={123} /><figcaption>설치된 앱 아이콘</figcaption></figure>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><small>05 · KEEP AMAON ON</small><h2>커피 한 잔으로<br />아마온을 응원해 주세요.</h2></div>
          <p>아마온은 서버, 데이터베이스, 영상·이미지 트래픽, 도메인과 유지보수 비용으로 운영됩니다. 보내주신 후원은 더 많은 아마야구 선수의 프로필과 영상을 안정적으로 알리는 데 사용합니다. 후원은 전적으로 자유이며 서비스 이용이나 선수 등록 여부와 무관합니다.</p>
        </div>
        <div className={styles.highlight}>
          <div><small>COFFEE SUPPORT</small><h2>이 앱이 도움이 되셨다면,<br />커피 한 잔으로 응원해 주세요.</h2><p>작은 응원이 아마야구 선수들의 이야기를 계속 연결하는 힘이 됩니다.</p></div>
          <div><small>NH농협은행</small><strong>302-2177-2877-01</strong><span>한끼방패 브랜드랩</span></div>
        </div>
      </section>

      <footer className={styles.footer}><span>© 2026 HANKKI AMATEUR BASEBALL · 아마온(아마ON)</span><Link href="/">아마온 홈으로 →</Link></footer>
    </main>
  );
}
