import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readPublishedWeekly, weeklyCoverUrl } from "./weekly-data";
import styles from "./weekly.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AMAON WEEKLY | 선수와 부모를 위한 고교야구 주간 브리핑",
  description: "고교야구 선수와 부모가 이번 주에 알아둘 한 가지 이야기와 아마온 선수 프로필을 소개합니다.",
  alternates: { canonical: "https://www.amaon.kr/weekly" },
  openGraph: {
    title: "AMAON WEEKLY | 고교야구 주간 브리핑",
    description: "선수와 부모가 3분 안에 읽는 아마온 주간 브리핑",
    url: "https://www.amaon.kr/weekly",
    images: ["/og.png"],
  },
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

export default async function WeeklyArchivePage() {
  const posts = await readPublishedWeekly();
  return <main className={styles.page}>
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand}>아마ON</Link>
      <nav aria-label="WEEKLY 메뉴"><Link href="/">홈</Link><Link href="/about">아마온 소개</Link><Link href="/#players">선수 찾기</Link></nav>
    </header>
    <section className={styles.archiveHero}>
      <small>PLAYER · ONE ISSUE · ON</small>
      <h1>AMAON <em>WEEKLY</em></h1>
      <p>선수와 부모를 위한 고교야구 주간 브리핑</p>
      <span>매주 한 선수와 꼭 필요한 이야기 하나를 3분 안에 전합니다.</span>
    </section>
    <section className={styles.archive} aria-labelledby="weekly-list-title">
      <div className={styles.sectionHead}><div><small>WEEKLY ARCHIVE</small><h2 id="weekly-list-title">지난 브리핑</h2></div><span>{String(posts.length).padStart(2, "0")} STORIES</span></div>
      {posts.length ? <div className={styles.archiveGrid}>{posts.map((post, index) => <Link className={styles.archiveCard} href={`/weekly/${post.slug}`} key={post.id}>
        <span className={styles.cover}><Image src={weeklyCoverUrl(post)} alt={`${post.title} 대표 이미지`} fill sizes="(max-width: 760px) 100vw, 50vw" priority={index === 0} /></span>
        <span className={styles.cardCopy}><small>AMAON WEEKLY #{String(post.issueNumber).padStart(2, "0")} · {dateLabel(post.publishedAt)}</small><strong>{post.title}</strong><p>{post.summary}</p><b>{post.schoolName} · {post.playerName} 선수 <em>읽기 →</em></b></span>
      </Link>)}</div> : <div className={styles.empty}>첫 번째 AMAON WEEKLY를 준비하고 있습니다.</div>}
    </section>
    <footer className={styles.footer}><strong>AMAON WEEKLY</strong><span>© 2026 HANKKI AMATEUR BASEBALL</span></footer>
  </main>;
}
