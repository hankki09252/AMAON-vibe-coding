"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./home-redesign.module.css";

export default function HomeIntroVideo({ src }: { src?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!src || !container.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [src]);
  return <div ref={container} className={styles.poster}>
    <Image src="/og.png" alt="아마ON — 오늘의 선수를 내일의 이름으로" width={1731} height={909} sizes="(max-width: 760px) 100vw, 45vw" />
    {src && ready && !failed && <video src={src} poster="/og.png" autoPlay muted loop playsInline preload="none" onError={() => setFailed(true)} aria-label="아마ON 소개 영상" />}
    <div className={styles.posterCaption}><span>AMATEUR BASEBALL ON AIR</span><strong>선수의 오늘, 더 많은 기회로.</strong></div>
  </div>;
}
