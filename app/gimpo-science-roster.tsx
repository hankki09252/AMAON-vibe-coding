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
  { id: "gimpo-41", number: "41", name: "김이준", position: "투수", grade: "3학년", height: 186, weight: 95, batsThrows: "우투우타" },
  { id: "gimpo-17", number: "17", name: "김재민", position: "투수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투좌타" },
  { id: "gimpo-11", number: "11", name: "김주환", position: "투수", grade: "2학년", height: 185, weight: 80, batsThrows: "우투우타" },
  { id: "gimpo-27", number: "27", name: "김지왕", position: "투수", grade: "3학년", height: 189, weight: 84, batsThrows: "우투우타" },
  { id: "gimpo-30", number: "30", name: "김태윤", position: "포수", grade: "3학년", height: 175, weight: 85, batsThrows: "우투우타" },
  { id: "gimpo-21", number: "21", name: "박경원", position: "투수", grade: "2학년", height: 184, weight: 85, batsThrows: "좌투좌타" },
  { id: "gimpo-53", number: "53", name: "박우진", position: "내야수", grade: "2학년", height: 178, weight: 78, batsThrows: "우투좌타" },
  { id: "gimpo-40", number: "40", name: "박준후", position: "투수", grade: "1학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "gimpo-15", number: "15", name: "신용재", position: "외야수", grade: "1학년", height: 178, weight: 80, batsThrows: "좌투좌타" },
  { id: "gimpo-20", number: "20", name: "양석호", position: "투수", grade: "1학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "gimpo-22", number: "22", name: "오윤원", position: "포수", grade: "1학년", height: 185, weight: 75, batsThrows: "우투양타" },
  { id: "gimpo-29", number: "29", name: "이승리", position: "투수", grade: "3학년", height: 181, weight: 73, batsThrows: "좌투좌타" },
  { id: "gimpo-7", number: "7", name: "이재국", position: "내야수", grade: "3학년", height: 179, weight: 79, batsThrows: "우투좌타" },
  { id: "gimpo-2", number: "2", name: "임선엽", position: "외야수", grade: "3학년", height: 176, weight: 75, batsThrows: "좌투좌타" },
  { id: "gimpo-31", number: "31", name: "전하랑", position: "투수", grade: "1학년", height: 176, weight: 71, batsThrows: "우투좌타" },
  { id: "gimpo-5", number: "5", name: "정예성", position: "내야수", grade: "1학년", height: 177, weight: 77, batsThrows: "우투우타" },
  { id: "gimpo-19", number: "19", name: "정예찬", position: "투수", grade: "3학년", height: 178, weight: 87, batsThrows: "우투좌타" },
  { id: "gimpo-6", number: "6", name: "최상", position: "외야수", grade: "2학년", height: 173, weight: 65, batsThrows: "미정" },
  { id: "gimpo-13", number: "13", name: "최재우", position: "투수", grade: "3학년", height: 176, weight: 73, batsThrows: "우투우타" },
];

export default function GimpoScienceRoster() {
  return (
    <TeamRoster
      sectionId="gimpo-science-roster"
      kicker="GIMPO SCIENCE TECHNOLOGY HIGH SCHOOL · U-18"
      title="김포과학기술고 선수단"
      subtitle="2026 등록 선수 30명 · 감독 김희상"
      teamLabel="김포과학기술고"
      monogram="김포"
      players={players}
    />
  );
}
