"use client";

import { useEffect } from "react";

function currentPage() {
  return `${window.location.pathname}${window.location.hash || "#top"}`.slice(0, 160);
}

export default function SiteAnalytics() {
  useEffect(() => {
    let lastPage = "";

    const record = () => {
      const page = currentPage();
      if (page === lastPage) return;
      lastPage = page;
      void fetch("/api/site-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page }),
        keepalive: true,
      }).catch(() => undefined);
    };

    const schedule = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(record, { timeout: 1500 });
      } else {
        globalThis.setTimeout(record, 700);
      }
    };

    schedule();
    window.addEventListener("hashchange", schedule);
    return () => window.removeEventListener("hashchange", schedule);
  }, []);

  return null;
}
