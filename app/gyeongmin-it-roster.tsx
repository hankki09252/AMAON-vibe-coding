"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "kmit-11", number: "11", name: "강병진", position: "투수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "kmit-12", number: "12", name: "강준구", position: "투수", grade: "3학년", height: 178, weight: 75, batsThrows: "우투우타" },
  { id: "kmit-13", number: "13", name: "곽대성", position: "내야수", grade: "3학년", height: 183, weight: 87, batsThrows: "미기재" },
  { id: "kmit-7", number: "7", name: "김건희", position: "외야수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "kmit-3", number: "3", name: "김동호", position: "투수", grade: "1학년", height: 180, weight: 90, batsThrows: "우투우타" },
  { id: "kmit-10", number: "10", name: "김래", position: "외야수", grade: "2학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "kmit-37", number: "37", name: "김보윤", position: "투수", grade: "1학년", height: 166, weight: 60, batsThrows: "우투우타" },
  { id: "kmit-30", number: "30", name: "김우진", position: "내야수", grade: "1학년", height: 170, weight: 52, batsThrows: "우투좌타" },
  { id: "kmit-6", number: "6", name: "김정환", position: "내야수", grade: "3학년", height: 180, weight: 72, batsThrows: "우투좌타" },
  { id: "kmit-0", number: "0", name: "김태윤", position: "투수", grade: "1학년", height: 180, weight: 76, batsThrows: "우투우타" },
  { id: "kmit-15", number: "15", name: "김태준", position: "외야수", grade: "1학년", height: 171, weight: 58, batsThrows: "좌투우타" },
  { id: "kmit-21", number: "21", name: "문시우", position: "투수", grade: "1학년", height: 175, weight: 68, batsThrows: "우투우타" },
];

export default function GyeongminItRoster() {
  return (
    <TeamRoster
      sectionId="gyeongmin-it-roster"
      kicker="GYEONGMIN IT HIGH SCHOOL · U-18"
      title="경민IT고 선수단"
      subtitle="2026 제공 자료 등록 선수 12명 · 감독 김종석"
      teamLabel="경민IT고"
      monogram="경민"
      players={players}
    />
  );
}
