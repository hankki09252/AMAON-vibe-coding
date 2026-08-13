"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "convention-27", number: "27", name: "강동언", position: "포수", grade: "2학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "convention-5", number: "5", name: "고한결", position: "내야수", grade: "3학년", height: 175, weight: 76, batsThrows: "우투우타" },
  { id: "convention-20", number: "20", name: "권민재", position: "투수", grade: "2학년", height: 184, weight: 75, batsThrows: "우투좌타" },
  { id: "convention-57", number: "57", name: "권찬희", position: "투수", grade: "1학년", height: 179, weight: 85, batsThrows: "우투우타" },
  { id: "convention-12", number: "12", name: "권희수", position: "투수", grade: "3학년", height: 182, weight: 72, batsThrows: "우투우타" },
  { id: "convention-52", number: "52", name: "김규민", position: "내야수", grade: "2학년", height: 181, weight: 76, batsThrows: "우투우타" },
  { id: "convention-kim-daein", number: "미정", name: "김대인", position: "외야수", grade: "1학년", height: 176, weight: 90, batsThrows: "우투우타" },
  { id: "convention-41", number: "41", name: "김민서", position: "투수", grade: "1학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "convention-53", number: "53", name: "김서진", position: "내야수", grade: "1학년", height: 182, weight: 70, batsThrows: "우투우타" },
  { id: "convention-13", number: "13", name: "김세훈", position: "내야수", grade: "2학년", height: 176, weight: 72, batsThrows: "우투좌타" },
  { id: "convention-14", number: "14", name: "김영웅", position: "투수", grade: "2학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "convention-47", number: "47", name: "김진수", position: "투수", grade: "2학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "convention-51", number: "51", name: "김태린", position: "외야수", grade: "3학년", height: 180, weight: 76, batsThrows: "좌투좌타" },
  { id: "convention-10", number: "10", name: "김태민", position: "투수", grade: "2학년", height: 188, weight: 92, batsThrows: "우투우타" },
  { id: "convention-8", number: "8", name: "김하준", position: "외야수", grade: "2학년", height: 178, weight: 76, batsThrows: "우투양타" },
  { id: "convention-49", number: "49", name: "남서현", position: "투수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "convention-7", number: "7", name: "남현우", position: "내야수", grade: "3학년", height: 185, weight: 83, batsThrows: "우투우타" },
  { id: "convention-33", number: "33", name: "도경묵", position: "외야수", grade: "1학년", height: 185, weight: 76, batsThrows: "우투좌타" },
  { id: "convention-29", number: "29", name: "류지현", position: "투수", grade: "2학년", height: 178, weight: 82, batsThrows: "좌투좌타" },
  { id: "convention-56", number: "56", name: "박수현", position: "내야수", grade: "1학년", height: 185, weight: 80, batsThrows: "우투우타" },
  { id: "convention-24", number: "24", name: "박승현", position: "내야수", grade: "1학년", height: 183, weight: 85, batsThrows: "우투좌타" },
  { id: "convention-38", number: "38", name: "박재현", position: "내야수", grade: "1학년", height: 185, weight: 82, batsThrows: "우투우타" },
  { id: "convention-6", number: "6", name: "박준서", position: "내야수", grade: "3학년", height: 183, weight: 76, batsThrows: "우투우타" },
  { id: "convention-23", number: "23", name: "서승수", position: "외야수", grade: "3학년", height: 182, weight: 83, batsThrows: "우투우타" },
  { id: "convention-21", number: "21", name: "서재원", position: "투수", grade: "2학년", height: 181, weight: 82, batsThrows: "우투우타" },
  { id: "convention-45", number: "45", name: "손지환", position: "투수", grade: "2학년", height: 182, weight: 78, batsThrows: "우투우타" },
  { id: "convention-9", number: "9", name: "송우석", position: "내야수", grade: "2학년", height: 175, weight: 80, batsThrows: "우투우타" },
  { id: "convention-11", number: "11", name: "신동현", position: "투수", grade: "3학년", height: 187, weight: 105, batsThrows: "우투우타" },
  { id: "convention-25", number: "25", name: "심우현", position: "내야수", grade: "2학년", height: 186, weight: 97, batsThrows: "우투우타" },
  { id: "convention-18", number: "18", name: "양진후", position: "투수", grade: "3학년", height: 183, weight: 83, batsThrows: "우투우타" },
  { id: "convention-37", number: "37", name: "엄지후", position: "투수", grade: "1학년", height: 180, weight: 77, batsThrows: "우투우타" },
  { id: "convention-22", number: "22", name: "유성화", position: "포수", grade: "1학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "convention-31", number: "31", name: "유형석", position: "투수", grade: "2학년", height: 185, weight: 88, batsThrows: "우투우타" },
  { id: "convention-36", number: "36", name: "윤강희", position: "내야수", grade: "1학년", height: 174, weight: 78, batsThrows: "우투우타" },
  { id: "convention-32", number: "32", name: "윤준희", position: "외야수", grade: "2학년", height: 181, weight: 90, batsThrows: "우투양타" },
  { id: "convention-28", number: "28", name: "윤지후", position: "투수", grade: "1학년", height: 181, weight: 83, batsThrows: "우투우타" },
];

export default function SeoulConventionRoster() {
  return (
    <TeamRoster
      sectionId="seoul-convention-roster"
      kicker="SEOUL CONVENTION HIGH SCHOOL · U-18"
      title="서울컨벤션고 선수단"
      subtitle="2026 등록 선수 36명 · 감독 유영원"
      teamLabel="서울컨벤션고"
      monogram="SCHS"
      players={players}
    />
  );
}
