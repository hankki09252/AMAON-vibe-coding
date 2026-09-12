import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WeeklyTrackedLink from "../weekly-actions";
import { readWeeklyBySlug, weeklyCoverUrl, weeklyPlayerUrl } from "../weekly-data";
import styles from "../weekly.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await readWeeklyBySlug(slug);
  if (!post) return { title: "AMAON WEEKLY" };
  const url = `https://www.amaon.kr/weekly/${post.slug}`;
  const image = post.coverStorageKey ? `https://www.amaon.kr${weeklyCoverUrl(post)}` : "https://www.amaon.kr/og.png";
  return {
    title: `${post.title} | AMAON WEEKLY`,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.summary, url, type: "article", publishedTime: post.publishedAt, images: [image] },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: [image] },
  };
}

export default async function WeeklyDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await readWeeklyBySlug(slug);
  if (!post) notFound();
  const profileUrl = weeklyPlayerUrl(post);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: `https://www.amaon.kr${weeklyCoverUrl(post)}`,
    author: { "@type": "Organization", name: "아마온(아마ON)" },
    publisher: { "@type": "Organization", name: "아마온(아마ON)", url: "https://www.amaon.kr/" },
    mainEntityOfPage: `https://www.amaon.kr/weekly/${post.slug}`,
  };

  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand}>아마ON</Link>
      <nav aria-label="WEEKLY 메뉴"><Link href="/weekly">전체 WEEKLY</Link><Link href="/#players">선수 찾기</Link></nav>
    </header>
    <article className={styles.article}>
      <header className={styles.articleHead}>
        <div><small>AMAON WEEKLY #{String(post.issueNumber).padStart(2, "0")}</small><span>{dateLabel(post.publishedAt)} · 3분 읽기</span></div>
        <h1>{post.title}</h1>
        <p>{post.summary}</p>
      </header>
      <figure className={styles.heroImage}><Image src={weeklyCoverUrl(post)} alt={`${post.title} 대표 이미지`} fill sizes="(max-width: 900px) 100vw, 1100px" priority /></figure>

      <section className={styles.playerSpotlight} aria-labelledby="weekly-player-title">
        <span className={styles.number}>01</span><div><small>PLAYER · THIS WEEK</small><h2 id="weekly-player-title">{post.playerName}</h2><p>{post.schoolName} · {post.position || "고교야구 선수"}</p></div>
        <WeeklyTrackedLink weeklyId={post.id} eventType="player_profile" href={profileUrl}>선수 프로필 보기 →</WeeklyTrackedLink>
      </section>

      <section className={styles.issue} aria-labelledby="weekly-issue-title">
        <header><span className={styles.number}>02</span><div><small>ONE ISSUE</small><h2 id="weekly-issue-title">{post.oneIssueTitle}</h2></div></header>
        <div className={styles.body}>{post.body.split(/\n{2,}/).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}</div>
      </section>

      <section className={styles.on} aria-labelledby="weekly-on-title">
        <span className={styles.number}>03</span><div><small>ON · CONNECT TO AMAON</small><h2 id="weekly-on-title">{post.onMessage}</h2><p>기록은 기본. 영상은 증명. 프로필은 나를 설명합니다.</p></div>
        <div className={styles.actions}>
          <WeeklyTrackedLink weeklyId={post.id} eventType="player_profile" href={profileUrl}>선수 프로필 보기</WeeklyTrackedLink>
          <WeeklyTrackedLink weeklyId={post.id} eventType="player_video" href={profileUrl}>선수 영상 보기</WeeklyTrackedLink>
          <WeeklyTrackedLink weeklyId={post.id} eventType="profile_submission" href="/#top">사진·영상 등록하기</WeeklyTrackedLink>
        </div>
      </section>
      <Link className={styles.back} href="/weekly">← AMAON WEEKLY 전체 보기</Link>
    </article>
    <footer className={styles.footer}><strong>AMAON WEEKLY</strong><span>© 2026 HANKKI AMATEUR BASEBALL</span></footer>
  </main>;
}
