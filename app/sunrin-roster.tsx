"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "sunrin-33", number: "33", name: "강현준", position: "외야수", grade: "1학년", height: 176, weight: 80, batsThrows: "우투좌타" },
  { id: "sunrin-gu-taegeon", number: "미정", name: "구태건", position: "미지정", grade: "1학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "sunrin-61", number: "61", name: "권동규", position: "투수", grade: "2학년", height: 190, weight: 90, batsThrows: "우투우타" },
  { id: "sunrin-46", number: "46", name: "권지우", position: "투수", grade: "1학년", height: 180, weight: 74, batsThrows: "우투우타" },
  { id: "sunrin-20", number: "20", name: "김도우", position: "내야수", grade: "1학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "sunrin-8", number: "8", name: "김동규", position: "외야수", grade: "2학년", height: 180, weight: 68, batsThrows: "우투좌타" },
  { id: "sunrin-17", number: "17", name: "김명빈", position: "외야수", grade: "2학년", height: 182, weight: 88, batsThrows: "우투좌타" },
  { id: "sunrin-38", number: "38", name: "김민준", position: "내야수", grade: "1학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "sunrin-47", number: "47", name: "김상민", position: "외야수", grade: "2학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "sunrin-28", number: "28", name: "김윤혁", position: "투수", grade: "3학년", height: 187, weight: 90, batsThrows: "우투우타" },
  { id: "sunrin-55", number: "55", name: "김주호", position: "투수", grade: "3학년", height: 183, weight: 97, batsThrows: "좌투좌타" },
  { id: "sunrin-57", number: "57", name: "김준성", position: "외야수", grade: "1학년", height: 172, weight: 64, batsThrows: "좌투좌타" },
  { id: "sunrin-27", number: "27", name: "김태양", position: "포수", grade: "2학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "sunrin-14", number: "14", name: "김하윤", position: "내야수", grade: "3학년", height: 188, weight: 87, batsThrows: "우투우타" },
  { id: "sunrin-3", number: "3", name: "김현서", position: "외야수", grade: "2학년", height: 184, weight: 82, batsThrows: "우투좌타" },
  { id: "sunrin-16", number: "16", name: "박선우", position: "외야수", grade: "3학년", height: 179, weight: 78, batsThrows: "우투우타" },
  { id: "sunrin-7", number: "7", name: "박성빈", position: "포수", grade: "3학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "sunrin-52", number: "52", name: "박수현", position: "내야수", grade: "3학년", height: 182, weight: 78, batsThrows: "우투좌타" },
  { id: "sunrin-23", number: "23", name: "박승원", position: "투수", grade: "3학년", height: 185, weight: 92, batsThrows: "우투좌타" },
  { id: "sunrin-24", number: "24", name: "박주현", position: "투수", grade: "1학년", height: 186, weight: 78, batsThrows: "우투우타" },
  { id: "sunrin-25", number: "25", name: "박현민", position: "외야수", grade: "1학년", height: 175, weight: 67, batsThrows: "우투우타" },
  { id: "sunrin-50", number: "50", name: "송강", position: "내야수", grade: "1학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "sunrin-6", number: "6", name: "신영준", position: "내야수", grade: "2학년", height: 175, weight: 68, batsThrows: "우투좌타" },
  { id: "sunrin-10", number: "10", name: "안준서", position: "내야수", grade: "3학년", height: 186, weight: 88, batsThrows: "우투우타" },
  { id: "sunrin-35", number: "35", name: "안준혁", position: "투수", grade: "2학년", height: 181, weight: 78, batsThrows: "우투우타" },
  { id: "sunrin-2", number: "2", name: "양연종", position: "포수", grade: "1학년", height: 182, weight: 82, batsThrows: "우투우타" },
  { id: "sunrin-19", number: "19", name: "오해성", position: "투수", grade: "2학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "sunrin-30", number: "30", name: "왕인", position: "투수", grade: "1학년", height: 177, weight: 70, batsThrows: "우투우타" },
  { id: "sunrin-26", number: "26", name: "이규용", position: "투수", grade: "2학년", height: 172, weight: 75, batsThrows: "우투우타" },
  { id: "sunrin-41", number: "41", name: "이동경", position: "투수", grade: "2학년", height: 182, weight: 78, batsThrows: "우투우타" },
  { id: "sunrin-5", number: "5", name: "이동하", position: "내야수", grade: "2학년", height: 178, weight: 70, batsThrows: "우투우타" },
  { id: "sunrin-13", number: "13", name: "이석재", position: "투수", grade: "3학년", height: 183, weight: 86, batsThrows: "우투우타" },
  { id: "sunrin-15", number: "15", name: "이성재", position: "투수", grade: "2학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "sunrin-32", number: "32", name: "이정후", position: "포수", grade: "1학년", height: 177, weight: 90, batsThrows: "우투우타" },
  { id: "sunrin-45", number: "45", name: "정시후", position: "투수", grade: "1학년", height: 173, weight: 72, batsThrows: "우투우타" },
  { id: "sunrin-18", number: "18", name: "정우성", position: "투수", grade: "2학년", height: 175, weight: 66, batsThrows: "좌투우타" },
];

export default function SunrinRoster() {
  return (
    <TeamRoster
      sectionId="sunrin-roster"
      kicker="SUNRIN INTERNET HIGH SCHOOL · U-18"
      title="선린인터넷고 선수단"
      subtitle="2026 등록 선수 36명 · 감독 박덕희"
      teamLabel="선린인터넷고"
      monogram="SUNRIN"
      players={players}
    />
  );
}
