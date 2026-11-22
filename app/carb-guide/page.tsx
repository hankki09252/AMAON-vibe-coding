import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const pdfUrl = "/nutrition/amaon-athlete-carbohydrate-guide.pdf";

export const metadata: Metadata = {
  title: "운동선수 탄수화물 실전 가이드 | AMAON",
  description: "선수와 부모가 바로 보는 운동 전·중·후 탄수화물 실전 가이드. 아마온 자료를 휴대폰에서 읽거나 PDF로 열어보세요.",
  alternates: { canonical: "https://www.amaon.kr/carb-guide" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "아마온 운동선수 탄수화물 실전 가이드",
    description: "훈련 전·중·후 언제, 얼마나, 무엇을 먹어야 할까요?",
    url: "https://www.amaon.kr/carb-guide",
    images: [{ url: "https://www.amaon.kr/nutrition/carb-guide-pages/page-01.jpg", width: 848, height: 1200 }],
  },
};

export default function CarbGuidePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="아마온 홈으로">AMA<span>ON</span><small>by 한끼방패</small></Link>
        <Link className={styles.calculator} href="/carb-calculator">내 탄수화물 계산하기 ↗</Link>
      </header>
      <div className={styles.intro}>
        <p>AMAON PRACTICAL GUIDE</p>
        <h1>운동선수<br /><em>탄수화물 실전 가이드</em></h1>
        <span>선수와 부모가 휴대폰에서 바로 읽을 수 있는 10쪽 자료입니다. 아래로 넘겨 읽어보세요.</span>
        <a className={styles.pdfLink} href={pdfUrl} target="_blank" rel="noopener noreferrer">PDF 원본 열기 ↗</a>
      </div>
      <section className={styles.pages} aria-label="운동선수 탄수화물 실전 가이드 10쪽">
        {Array.from({ length: 10 }, (_, index) => {
          const number = String(index + 1).padStart(2, "0");
          return <figure key={number}>
            <Image src={`/nutrition/carb-guide-pages/page-${number}.jpg`} width={848} height={1200} sizes="(max-width: 900px) 100vw, 848px" alt={`운동선수 탄수화물 실전 가이드 ${index + 1}쪽`} priority={index === 0} unoptimized />
            <figcaption>{number} / 10</figcaption>
          </figure>;
        })}
      </section>
      <footer className={styles.footer}>
        <p>일반적인 스포츠영양 교육자료입니다. 성장기 선수의 필요량은 개인 상태와 훈련량에 따라 달라질 수 있습니다.</p>
        <div><a href={pdfUrl} target="_blank" rel="noopener noreferrer">PDF 원본 열기</a><Link href="/carb-calculator">탄수화물 계산기</Link></div>
      </footer>
    </main>
  );
}
