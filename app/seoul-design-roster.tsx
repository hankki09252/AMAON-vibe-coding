"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "design-21", number: "21", name: "강지완", position: "투수", grade: "3학년", height: 179, weight: 84, batsThrows: "우투우타" },
  { id: "design-kim-dohyeon", number: "미정", name: "김도현", position: "포수", grade: "3학년", height: 179, weight: 88, batsThrows: "우투우타" },
  { id: "design-52", number: "52", name: "김민건", position: "투수", grade: "2학년", height: 183, weight: 87, batsThrows: "우투우타" },
  { id: "design-34", number: "34", name: "김범승", position: "내야수", grade: "1학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "design-8", number: "8", name: "김용태", position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "design-53", number: "53", name: "김재찬", position: "외야수", grade: "3학년", height: 183, weight: 92, batsThrows: "우투우타" },
  { id: "design-28", number: "28", name: "김준우", position: "포수", grade: "1학년", height: 178, weight: 78, batsThrows: "우투우타" },
  { id: "design-17", number: "17", name: "김준하", position: "외야수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투좌타" },
  { id: "design-33", number: "33", name: "김지훈", position: "외야수", grade: "3학년", height: 175, weight: 77, batsThrows: "우투우타" },
  { id: "design-20", number: "20", name: "김진서", position: "투수", grade: "3학년", height: 184, weight: 88, batsThrows: "우투우타" },
  { id: "design-18", number: "18", name: "김찬희", position: "투수", grade: "3학년", height: 177, weight: 83, batsThrows: "우투우타" },
];

export default function SeoulDesignRoster() {
  return (
    <TeamRoster
      sectionId="seoul-design-roster"
      kicker="SEOUL DESIGN HIGH SCHOOL · U-18"
      title="서울디자인고 선수단"
      subtitle="2026 확인 선수 11명 · 감독 이호"
      teamLabel="서울디자인고"
      monogram="디자인"
      players={players}
    />
  );
}
