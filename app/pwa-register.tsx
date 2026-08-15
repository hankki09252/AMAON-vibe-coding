"use client";

import { useEffect, useRef } from "react";

const VERSION_CHECK_INTERVAL = 60_000;

export default function PwaRegister() {
  const currentVersion = useRef<string | null>(null);
  const isReloading = useRef(false);

  useEffect(() => {
    let disposed = false;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => undefined);
    }

    const checkForUpdate = async () => {
      if (disposed || isReloading.current || !navigator.onLine) return;

      try {
        const response = await fetch(`/api/version?checkedAt=${Date.now()}`, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (!response.ok) return;

        const data = (await response.json()) as { version?: string };
        if (!data.version) return;

        if (currentVersion.current === null) {
          currentVersion.current = data.version;
          return;
        }

        if (currentVersion.current !== data.version) {
          isReloading.current = true;
          window.location.reload();
        }
      } catch {
        // A temporary network error should not interrupt the installed app.
      }
    };

    void checkForUpdate();
    const timer = window.setInterval(() => void checkForUpdate(), VERSION_CHECK_INTERVAL);
    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkForUpdate();
    };

    window.addEventListener("focus", checkForUpdate);
    window.addEventListener("online", checkForUpdate);
    document.addEventListener("visibilitychange", checkWhenVisible);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", checkForUpdate);
      window.removeEventListener("online", checkForUpdate);
      document.removeEventListener("visibilitychange", checkWhenVisible);
    };
  }, []);

  return null;
}
