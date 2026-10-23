"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home-redesign.module.css";

const NOTICE_KEY = "amaon:sns-promotion-notice:v1";

export default function PromotionNotice({ onRegister }: { onRegister: () => void }) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setOpen(window.localStorage.getItem(NOTICE_KEY) !== "seen");
      } catch {
        setOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key !== "Tab") return;
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-promotion-dialog] button"));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [open]);

  function dismiss() {
    try {
      window.localStorage.setItem(NOTICE_KEY, "seen");
    } catch {
      // Browsers with disabled storage can still close the notice for this visit.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className={styles.promotionBackdrop}>
      <section data-promotion-dialog className={styles.promotionDialog} role="dialog" aria-modal="true" aria-labelledby="promotion-notice-title" aria-describedby="promotion-notice-description">
        <header>
          <span>AMAON NOTICE · SNS PROMOTION</span>
          <button ref={closeButtonRef} type="button" onClick={dismiss} aria-label="SNS 홍보 안내 닫기">×</button>
        </header>
        <h2 id="promotion-notice-title">선수 홍보를 위한<br /><em>등록 안내</em></h2>
        <p id="promotion-notice-description">선수 <strong>프로필·사진·영상이 모두 등록된 경우에만</strong> SNS 홍보 대상으로 검토됩니다.</p>
        <div className={styles.promotionChecklist} aria-label="필수 등록 항목">
          <span>프로필</span><span>사진</span><span>영상</span>
        </div>
        <p className={styles.promotionDetail}>한 가지라도 빠지면 홍보가 진행되지 않습니다. 모든 항목을 등록해도 자동으로 확정되는 것은 아니며, 운영팀 확인 후 진행됩니다.</p>
        <div className={styles.promotionActions}>
          <button type="button" onClick={() => { dismiss(); onRegister(); }}>선수 프로필 등록·수정 <span aria-hidden="true">→</span></button>
          <button type="button" onClick={dismiss}>확인했어요</button>
        </div>
      </section>
    </div>
  );
}
