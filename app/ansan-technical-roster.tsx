"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [];

export default function AnsanTechnicalRoster() {
  return (
    <TeamRoster
      sectionId="ansan-technical-roster"
      kicker="ANSAN TECHNICAL HIGH SCHOOL · 2026"
      title="안산공업고 선수단"
      subtitle="선수를 직접 등록해 명단을 만들어 주세요 · 감독 하성진"
      teamLabel="안산공업고"
      monogram="안"
      players={players}
    />
  );
}
