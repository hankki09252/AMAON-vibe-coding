"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "suwon-01", number: "2", name: "고은찬", year: 2026, position: "투수", grade: "2학년", height: 184, weight: 92, batsThrows: "우투우타" },
  { id: "suwon-02", number: "21", name: "김범서", year: 2026, position: "투수", grade: "3학년", height: 185, weight: 88, batsThrows: "좌투좌타" },
  { id: "suwon-03", number: "29", name: "김예찬", year: 2026, position: "투수", grade: "3학년", height: 185, weight: 85, batsThrows: "미지정" },
  { id: "suwon-04", number: "8", name: "류호빈", year: 2026, position: "외야수", grade: "2학년", height: 178, weight: 67, batsThrows: "우투우타" },
  { id: "suwon-05", number: "5", name: "류호진", year: 2026, position: "미지정", grade: "3학년", height: 184, weight: 80, batsThrows: "우투우타" },
  { id: "suwon-06", number: "22", name: "박세원", year: 2026, position: "포수", grade: "3학년", height: 175, weight: 90, batsThrows: "우투우타" },
  { id: "suwon-07", number: "23", name: "박율", year: 2026, position: "외야수", grade: "1학년", height: 168, weight: 83, batsThrows: "우투우타" },
  { id: "suwon-08", number: "18", name: "변승리", year: 2026, position: "투수", grade: "3학년", height: 185, weight: 88, batsThrows: "미지정" },
  { id: "suwon-09", number: "3", name: "신희준", year: 2026, position: "내야수", grade: "1학년", height: 176, weight: 64, batsThrows: "우투우타" },
  { id: "suwon-10", number: "1", name: "오하민", year: 2026, position: "투수", grade: "3학년", height: 187, weight: 90, batsThrows: "우투우타" },
  { id: "suwon-11", number: "7", name: "이강은", year: 2026, position: "내야수", grade: "3학년", height: 173, weight: 68, batsThrows: "우투우타" },
  { id: "suwon-12", number: "19", name: "이상혁", year: 2026, position: "내야수", grade: "3학년", height: 193, weight: 114, batsThrows: "미지정" },
  { id: "suwon-13", number: "16", name: "이시영", year: 2026, position: "내야수", grade: "3학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "suwon-14", number: "24", name: "이준서", year: 2026, position: "포수", grade: "3학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "suwon-15", number: "35", name: "이진서", year: 2026, position: "투수", grade: "1학년", height: 183, weight: 70, batsThrows: "미지정" },
  { id: "suwon-16", number: "17", name: "임승현", year: 2026, position: "투수", grade: "3학년", height: 180, weight: 82, batsThrows: "좌투좌타" },
  { id: "suwon-17", number: "6", name: "전민혁", year: 2026, position: "내야수", grade: "3학년", height: 183, weight: 72, batsThrows: "우투좌타" },
  { id: "suwon-18", number: "27", name: "최시현", year: 2026, position: "포수", grade: "2학년", height: 175, weight: 78, batsThrows: "우투우타" },
  { id: "suwon-19", number: "13", name: "최윤우", year: 2026, position: "내야수", grade: "1학년", height: 172, weight: 65, batsThrows: "우투우타" },
  { id: "suwon-20", number: "9", name: "하성철", year: 2026, position: "외야수", grade: "3학년", height: 165, weight: 65, batsThrows: "좌투좌타" },
  { id: "suwon-21", number: "15", name: "한규현", year: 2026, position: "투수", grade: "2학년", height: 183, weight: 98, batsThrows: "좌투좌타" },
];

export default function SuwonRoster() {
  return (
    <TeamRoster
      sectionId="suwon-roster"
      kicker="SUWON BASEBALL CLUB · 2026"
      title="수원야구단(U-18) 선수단"
      subtitle="2026 등록 선수 21명 · 감독 이덕진"
      teamLabel="수원야구단(U-18)"
      monogram="수"
      players={players}
    />
  );
}
