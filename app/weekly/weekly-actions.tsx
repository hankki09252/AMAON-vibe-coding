"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type WeeklyEventType = "player_profile" | "player_video" | "profile_submission";

export default function WeeklyTrackedLink({ weeklyId, eventType, href, className, children }: {
  weeklyId: string;
  eventType: WeeklyEventType;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  function track() {
    void fetch("/api/weekly/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ weeklyId, eventType }),
      keepalive: true,
    }).catch(() => undefined);
  }

  return <Link href={href} className={className} onClick={track}>{children}</Link>;
}
