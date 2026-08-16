"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "sewon-01", number: "25", name: "강지환", year: 2026, position: "포수", grade: "2학년", height: 176, weight: 84, batsThrows: "우투우타" },
  { id: "sewon-02", number: "5", name: "권혁", year: 2026, position: "외야수", grade: "1학년", height: 173, weight: 70, batsThrows: "좌투좌타" },
  { id: "sewon-03", number: "51", name: "김근영", year: 2026, position: "외야수", grade: "3학년", height: 183, weight: 81, batsThrows: "우투우타" },
  { id: "sewon-04", number: "2", name: "김병철", year: 2026, position: "외야수", grade: "3학년", height: 168, weight: 70, batsThrows: "우투좌타" },
  { id: "sewon-05", number: "53", name: "김성현", year: 2026, position: "내야수", grade: "2학년", height: 173, weight: 75, batsThrows: "우투우타" },
  { id: "sewon-06", number: "4", name: "김예담", year: 2026, position: "내야수", grade: "2학년", height: 170, weight: 70, batsThrows: "우투우타" },
  { id: "sewon-07", number: "47", name: "김유민", year: 2026, position: "포수", grade: "3학년", height: 185, weight: 95, batsThrows: "우투우타" },
  { id: "sewon-08", number: "45", name: "김지현", year: 2026, position: "투수", grade: "3학년", height: 196, weight: 94, batsThrows: "우투우타" },
  { id: "sewon-09", number: "9", name: "김태현", year: 2026, position: "외야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투좌타" },
  { id: "sewon-10", number: "16", name: "김형민", year: 2026, position: "투수", grade: "3학년", height: 176, weight: 79, batsThrows: "우투우타" },
  { id: "sewon-11", number: "48", name: "나예준", year: 2026, position: "투수", grade: "1학년", height: 187, weight: 70, batsThrows: "우투우타" },
  { id: "sewon-12", number: "33", name: "류하준", year: 2026, position: "투수", grade: "2학년", height: 185, weight: 88, batsThrows: "우투우타" },
  { id: "sewon-13", number: "52", name: "문동영", year: 2026, position: "내야수", grade: "3학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "sewon-14", number: "22", name: "박시윤", year: 2026, position: "외야수", grade: "2학년", height: 181, weight: 87, batsThrows: "우투우타" },
  { id: "sewon-15", number: "31", name: "박시효", year: 2026, position: "투수", grade: "1학년", height: 171, weight: 74, batsThrows: "우투우타" },
  { id: "sewon-16", number: "17", name: "박준우", year: 2026, position: "투수", grade: "3학년", height: 181, weight: 90, batsThrows: "우투우타" },
  { id: "sewon-17", number: "6", name: "박차니", year: 2026, position: "내야수", grade: "2학년", height: 174, weight: 73, batsThrows: "우투좌타" },
  { id: "sewon-18", number: "18", name: "박한결", year: 2026, position: "투수", grade: "3학년", height: 179, weight: 84, batsThrows: "우투우타" },
  { id: "sewon-19", number: "23", name: "송준우", year: 2026, position: "내야수", grade: "3학년", height: 186, weight: 88, batsThrows: "우투우타" },
  { id: "sewon-20", number: "11", name: "송태한", year: 2026, position: "투수", grade: "3학년", height: 184, weight: 85, batsThrows: "좌투우타" },
  { id: "sewon-21", number: "3", name: "신우철", year: 2026, position: "외야수", grade: "1학년", height: 179, weight: 73, batsThrows: "우투우타" },
  { id: "sewon-22", number: "21", name: "신정환", year: 2026, position: "투수", grade: "3학년", height: 178, weight: 82, batsThrows: "좌투좌타" },
  { id: "sewon-23", number: "7", name: "유정윤", year: 2026, position: "내야수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "sewon-24", number: "1", name: "이이찬", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 86, batsThrows: "우투우타" },
  { id: "sewon-25", number: "12", name: "전은호", year: 2026, position: "투수", grade: "2학년", height: 174, weight: 70, batsThrows: "우투좌타" },
  { id: "sewon-26", number: "55", name: "정서준", year: 2026, position: "외야수", grade: "2학년", height: 184, weight: 90, batsThrows: "우투좌타" },
  { id: "sewon-27", number: "24", name: "최정우", year: 2026, position: "투수", grade: "1학년", height: 175, weight: 69, batsThrows: "우투우타" },
  { id: "sewon-28", number: "27", name: "최종민", year: 2026, position: "외야수", grade: "2학년", height: 177, weight: 77, batsThrows: "우투우타" },
  { id: "sewon-29", number: "10", name: "최현우", year: 2026, position: "투수", grade: "2학년", height: 187, weight: 87, batsThrows: "우투우타" },
  { id: "sewon-30", number: "29", name: "함수밀", year: 2026, position: "투수", grade: "2학년", height: 188, weight: 95, batsThrows: "좌투우타" },
];

export default function SewonRoster() {
  return (
    <TeamRoster
      sectionId="sewon-roster"
      kicker="SEWON HIGH SCHOOL · 2026"
      title="세원고 선수단"
      subtitle="2026 등록 선수 30명 · 감독 오현민"
      teamLabel="세원고"
      monogram="세원"
      players={players}
    />
  );
}
