"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "sangwoo-01", number: "37", name: "강성광", year: 2026, position: "투수", grade: "2학년", height: 185, weight: 83, batsThrows: "좌투좌타" },
  { id: "sangwoo-02", number: "20", name: "강예석", year: 2026, position: "내야수", grade: "1학년", height: 179, weight: 91, batsThrows: "우투우타" },
  { id: "sangwoo-03", number: "미정", name: "구현욱", year: 2026, position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미지정" },
  { id: "sangwoo-04", number: "8", name: "권대환", year: 2026, position: "투수", grade: "3학년", height: 178, weight: 75, batsThrows: "우투우타" },
  { id: "sangwoo-05", number: "11", name: "김도윤", year: 2026, position: "투수", grade: "3학년", height: 184, weight: 83, batsThrows: "우투우타" },
  { id: "sangwoo-06", number: "18", name: "김민준", year: 2026, position: "투수", grade: "3학년", height: 185, weight: 89, batsThrows: "우투우타" },
  { id: "sangwoo-07", number: "3", name: "김승준", year: 2026, position: "내야수", grade: "3학년", height: 174, weight: 65, batsThrows: "우투우타" },
  { id: "sangwoo-08", number: "미정", name: "김영광", year: 2026, position: "미지정", grade: "1학년", height: 0, weight: 0, batsThrows: "미지정" },
  { id: "sangwoo-09", number: "2", name: "김종현", year: 2026, position: "내야수", grade: "3학년", height: 180, weight: 75, batsThrows: "우투우타" },
  { id: "sangwoo-10", number: "7", name: "김준우", year: 2026, position: "내야수", grade: "3학년", height: 170, weight: 68, batsThrows: "우투좌타" },
  { id: "sangwoo-11", number: "28", name: "김진완", year: 2026, position: "외야수", grade: "3학년", height: 179, weight: 72, batsThrows: "우투우타" },
  { id: "sangwoo-12", number: "23", name: "김진웅", year: 2026, position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "sangwoo-13", number: "29", name: "김현우", year: 2026, position: "투수", grade: "2학년", height: 188, weight: 90, batsThrows: "우투우타" },
  { id: "sangwoo-14", number: "9", name: "문성빈", year: 2026, position: "외야수", grade: "3학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "sangwoo-15", number: "40", name: "박범석", year: 2026, position: "포수", grade: "1학년", height: 172, weight: 91, batsThrows: "우투우타" },
  { id: "sangwoo-16", number: "10", name: "박윤민", year: 2026, position: "외야수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "sangwoo-17", number: "14", name: "박은호", year: 2026, position: "내야수", grade: "1학년", height: 178, weight: 72, batsThrows: "우투우타" },
  { id: "sangwoo-18", number: "16", name: "박주원", year: 2026, position: "내야수", grade: "2학년", height: 186, weight: 75, batsThrows: "우투우타" },
  { id: "sangwoo-19", number: "1", name: "이시원", year: 2026, position: "투수", grade: "3학년", height: 186, weight: 88, batsThrows: "우투우타" },
  { id: "sangwoo-20", number: "22", name: "이준영", year: 2026, position: "포수", grade: "1학년", height: 172, weight: 75, batsThrows: "우투우타" },
  { id: "sangwoo-21", number: "4", name: "이현준", year: 2026, position: "포수", grade: "2학년", height: 183, weight: 84, batsThrows: "우투우타" },
  { id: "sangwoo-22", number: "31", name: "임장원", year: 2026, position: "내야수", grade: "2학년", height: 188, weight: 100, batsThrows: "우투우타" },
  { id: "sangwoo-23", number: "13", name: "정연우", year: 2026, position: "내야수", grade: "1학년", height: 170, weight: 68, batsThrows: "우투우타" },
  { id: "sangwoo-24", number: "5", name: "정지원", year: 2026, position: "외야수", grade: "3학년", height: 177, weight: 72, batsThrows: "우투우타" },
  { id: "sangwoo-25", number: "6", name: "정한결", year: 2026, position: "외야수", grade: "3학년", height: 172, weight: 68, batsThrows: "우투우타" },
  { id: "sangwoo-26", number: "21", name: "조채훈", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 83, batsThrows: "우투우타" },
  { id: "sangwoo-27", number: "15", name: "채정원", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 78, batsThrows: "좌투좌타" },
  { id: "sangwoo-28", number: "17", name: "최서원", year: 2026, position: "외야수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투좌타" },
  { id: "sangwoo-29", number: "25", name: "한시후", year: 2026, position: "포수", grade: "3학년", height: 175, weight: 81, batsThrows: "우투우타" },
  { id: "sangwoo-30", number: "19", name: "홍서호", year: 2026, position: "투수", grade: "1학년", height: 185, weight: 80, batsThrows: "우투우타" },
];

export default function SangwooRoster() {
  return (
    <TeamRoster
      sectionId="sangwoo-roster"
      kicker="SANGWOO BASEBALL CLUB · U-18"
      title="상우고야구단 선수단"
      subtitle="2026 등록 선수 30명 · 감독 신명철"
      teamLabel="상우고야구단"
      monogram="상우"
      players={players}
    />
  );
}
