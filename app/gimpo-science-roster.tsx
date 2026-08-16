"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "gimpo-3", number: "3", name: "강동훈", position: "외야수", grade: "3학년", height: 180, weight: 78, batsThrows: "좌투좌타" },
  { id: "gimpo-36", number: "36", name: "강한성", position: "투수", grade: "2학년", height: 180, weight: 88, batsThrows: "우투우타" },
  { id: "gimpo-25", number: "25", name: "고대건", position: "내야수", grade: "2학년", height: 175, weight: 78, batsThrows: "우투우타" },
  { id: "gimpo-kim-gangjun", number: "미정", name: "김강준", position: "포수", grade: "2학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "gimpo-18", number: "18", name: "김대경", position: "외야수", grade: "2학년", height: 182, weight: 85, batsThrows: "우투우타" },
  { id: "gimpo-12", number: "12", name: "김동현", position: "투수", grade: "3학년", height: 173, weight: 75, batsThrows: "우투좌타" },
  { id: "gimpo-52", number: "52", name: "김동휘", position: "미지정", grade: "2학년", height: 180, weight: 100, batsThrows: "우투우타" },
  { id: "gimpo-28", number: "28", name: "김민성", position: "내야수", grade: "1학년", height: 175, weight: 77, batsThrows: "우투우타" },
  { id: "gimpo-1", number: "1", name: "김민찬", position: "내야수", grade: "3학년", height: 174, weight: 72, batsThrows: "우투우타" },
  { id: "gimpo-8", number: "8", name: "김여범", position: "내야수", grade: "2학년", height: 170, weight: 70, batsThrows: "우투좌타" },
  { id: "gimpo-16", number: "16", name: "김예서", position: "내야수", grade: "3학년", height: 183, weight: 83, batsThrows: "우투우타" },
];

export default function GimpoScienceRoster() {
  return (
    <TeamRoster
      sectionId="gimpo-science-roster"
      kicker="GIMPO SCIENCE TECHNOLOGY HIGH SCHOOL · U-18"
      title="김포과학기술고 선수단"
      subtitle="2026 제공 자료 등록 선수 11명 · 감독 김희상"
      teamLabel="김포과학기술고"
      monogram="김포"
      players={players}
    />
  );
}
