"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./product-banner.module.css";

const products = [
  { name: "벤플로", category: "헬멧 관리", description: "훈련 후 헬멧과 장비 관리에 관심 있다면", image: "/benflo-product-cutout.png", thumbnail: "/benflo-helmet-detail.png", href: "https://slit.to/s/n73h83", theme: "violet" },
  { name: "바로 먹는 고구마", category: "간편 간식", description: "훈련 전후 간편하게 챙기는 간식", image: "/sweet-potato-product-cutout.png", thumbnail: "/amaon-sweet-potato-banner.png", href: "https://slit.to/@hankki09252/objet/o20261031bd2cc4da6e7a16f6", theme: "amber" },
] as const;

export default function ProductShowcase() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const impactTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const product = products[selectedIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    if (!dialog.open) dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [isOpen]);

  useEffect(() => () => {
    if (impactTimerRef.current !== null) window.clearTimeout(impactTimerRef.current);
  }, []);

  function openProducts() {
    if (isPressed) return;
    setIsPressed(true);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    impactTimerRef.current = window.setTimeout(() => {
      setIsPressed(false);
      setSelectedIndex(0);
      setBurstKey((key) => key + 1);
      setIsOpen(true);
      impactTimerRef.current = null;
    }, reduceMotion ? 0 : 160);
  }

  function selectProduct(index: number) {
    setSelectedIndex((index + products.length) % products.length);
    setBurstKey((key) => key + 1);
  }

  function closeProducts() {
    dialogRef.current?.close();
    setIsOpen(false);
  }

  return (
    <aside className={styles.banner} aria-label="아마ON 추천 상품">
      <button className={`${styles.trigger} ${isPressed ? styles.pressed : ""}`} type="button" onClick={openProducts} aria-haspopup="dialog" aria-expanded={isOpen} aria-controls="amaon-product-dialog">
        <span className={styles.preview} aria-hidden="true">
          <Image src="/benflo-helmet-detail.png" alt="" width={94} height={94} loading="lazy" sizes="(max-width: 640px) 72px, 94px" />
          <Image src="/amaon-sweet-potato-banner.png" alt="" width={43} height={43} loading="lazy" sizes="43px" />
        </span>
        <span className={styles.copy}><small>광고 · 아마ON 추천 상품</small><strong>훈련 끝, 다음 준비까지</strong><span>벤플로와 바로 먹는 고구마를 만나보세요.</span></span>
        <span className={styles.action} aria-hidden="true">상품 2개 보기 <span>→</span></span>
        <span className={styles.impact} aria-hidden="true" />
      </button>

      <dialog id="amaon-product-dialog" ref={dialogRef} className={`${styles.dialog} ${product.theme === "violet" ? styles.violet : styles.amber}`} aria-labelledby="amaon-product-title" onClose={() => setIsOpen(false)}>
        <div className={styles.showcase}>
          <header className={styles.showcaseHeader}>
            <div><small>AMAON PICKS · 광고</small><h2 id="amaon-product-title">{product.name}</h2><p>{product.category} · {product.description}</p></div>
            <button className={styles.close} type="button" onClick={closeProducts} aria-label="추천 상품 창 닫기">×</button>
          </header>

          <div className={styles.stage} onTouchStart={(event) => { touchStartRef.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={(event) => {
            if (touchStartRef.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartRef.current;
            touchStartRef.current = null;
            if (Math.abs(delta) > 50) selectProduct(selectedIndex + (delta < 0 ? 1 : -1));
          }}>
            {isOpen && <div key={`${selectedIndex}-${burstKey}`} className={styles.burst} aria-hidden="true">
              <span className={styles.rays} /><span className={styles.halo} /><span className={styles.shockwave} />
              <span className={`${styles.spark} ${styles.sparkOne}`}>✦</span><span className={`${styles.spark} ${styles.sparkTwo}`}>✦</span><span className={`${styles.spark} ${styles.sparkThree}`}>✦</span>
              <span className={styles.object}><Image src={product.image} alt="" fill loading="lazy" sizes="(max-width: 640px) 90vw, 560px" style={{ objectFit: "contain" }} /></span>
            </div>}
            <button className={`${styles.arrow} ${styles.arrowLeft}`} type="button" onClick={() => selectProduct(selectedIndex - 1)} aria-label="이전 상품">‹</button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} type="button" onClick={() => selectProduct(selectedIndex + 1)} aria-label="다음 상품">›</button>
          </div>

          <div className={styles.showcaseFooter}>
            <span className={styles.counter}>0{selectedIndex + 1} <span>/ 0{products.length}</span></span>
            <div className={styles.tabs} aria-label="상품 선택">{products.map((item, index) => (
              <button key={item.name} className={`${styles.tab} ${selectedIndex === index ? styles.selected : ""}`} type="button" onClick={() => selectProduct(index)} aria-pressed={selectedIndex === index}>
                <Image src={item.thumbnail} alt="" width={50} height={50} loading="lazy" sizes="50px" /><span>{item.name}</span>
              </button>
            ))}</div>
            <a className={styles.visit} href={product.href} target="_blank" rel="sponsored noopener noreferrer" aria-label={`${product.name} 상품 페이지 보기 (새 창)`}>상품 자세히 보기 <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </dialog>
    </aside>
  );
}
