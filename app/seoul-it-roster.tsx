"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "seoul-it-4", number: "4", name: "강민서", position: "내야수", grade: "1학년", height: 175, weight: 60, batsThrows: "우투좌타" },
  { id: "seoul-it-0", number: "0", name: "구현욱", position: "외야수", grade: "2학년", height: 173, weight: 72, batsThrows: "우투우타" },
  { id: "seoul-it-5", number: "5", name: "김도진", position: "미지정", grade: "3학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "seoul-it-12", number: "12", name: "김동현", position: "미지정", grade: "3학년", height: 173, weight: 85, batsThrows: "미정" },
  { id: "seoul-it-kim-minjun-infielder", number: "미정", name: "김민준", position: "내야수", grade: "3학년", height: 178, weight: 90, batsThrows: "우투우타" },
  { id: "seoul-it-1", number: "1", name: "김민준", position: "투수", grade: "1학년", height: 176, weight: 70, batsThrows: "미정" },
  { id: "seoul-it-2", number: "2", name: "김온유", position: "외야수", grade: "1학년", height: 176, weight: 70, batsThrows: "우투우타" },
  { id: "seoul-it-kim-ijun-27", number: "27", name: "김이준", position: "1루수", grade: "1학년", height: 178, weight: 72, batsThrows: "좌투좌타" },
  { id: "seoul-it-kim-jugwang", number: "미정", name: "김주광", position: "미지정", grade: "3학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "seoul-it-11", number: "11", name: "김주하", position: "투수", grade: "3학년", height: 181, weight: 89, batsThrows: "우투우타" },
  { id: "seoul-it-26", number: "26", name: "김현우", position: "내야수", grade: "2학년", height: 181, weight: 99, batsThrows: "우투우타" },
  { id: "seoul-it-31", number: "31", name: "김효정", position: "내야수", grade: "1학년", height: 160, weight: 45, batsThrows: "미정" },
  { id: "seoul-it-29", number: "29", name: "류종현", position: "투수", grade: "3학년", height: 177, weight: 77, batsThrows: "우투우타" },
  { id: "seoul-it-24", number: "24", name: "송재은", position: "내야수", grade: "1학년", height: 175, weight: 67, batsThrows: "우투우타" },
  { id: "seoul-it-21", number: "21", name: "오승윤", position: "투수", grade: "1학년", height: 180, weight: 77, batsThrows: "좌투좌타" },
  { id: "seoul-it-yun-dongjun", number: "미정", name: "윤동준", position: "투수", grade: "3학년", height: 183, weight: 84, batsThrows: "우투좌타" },
  { id: "seoul-it-17", number: "17", name: "이승호", position: "투수", grade: "2학년", height: 187, weight: 87, batsThrows: "미정" },
  { id: "seoul-it-3", number: "3", name: "임진혁", position: "외야수", grade: "1학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "seoul-it-im-chaehong-27", number: "27", name: "임채홍", position: "포수", grade: "2학년", height: 179, weight: 87, batsThrows: "우투우타" },
  { id: "seoul-it-39", number: "39", name: "정세현", position: "투수", grade: "2학년", height: 169, weight: 63, batsThrows: "우투우타" },
  { id: "seoul-it-25", number: "25", name: "조승규", position: "내야수", grade: "1학년", height: 177, weight: 85, batsThrows: "우투우타" },
  { id: "seoul-it-33", number: "33", name: "최권율", position: "미지정", grade: "3학년", height: 0, weight: 0, batsThrows: "미정" },
];

export default function SeoulItRoster() {
  return (
    <TeamRoster
      sectionId="seoul-it-roster"
      kicker="SEOUL IT HIGH SCHOOL BC · U-18"
      title="서울아이티고BC 선수단"
      subtitle="2026 등록 선수 22명 · 감독 조용준"
      teamLabel="서울아이티고BC"
      monogram="IT BC"
      players={players}
    />
  );
}
