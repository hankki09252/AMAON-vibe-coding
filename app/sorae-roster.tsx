"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "sorae-01", number: "16", name: "강연우", year: 2026, position: "내야수", grade: "3학년", height: 181, weight: 76, batsThrows: "우투우타" },
  { id: "sorae-02", number: "12", name: "공연수", year: 2026, position: "내야수", grade: "2학년", height: 172, weight: 67, batsThrows: "우투좌타" },
  { id: "sorae-03", number: "39", name: "김건호", year: 2026, position: "중견수", grade: "1학년", height: 175, weight: 73, batsThrows: "우투우타" },
  { id: "sorae-04", number: "19", name: "김동현", year: 2026, position: "투수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "sorae-05", number: "47", name: "김민영", year: 2026, position: "외야수", grade: "3학년", height: 181, weight: 75, batsThrows: "우투우타" },
  { id: "sorae-06", number: "미정", name: "김영준", year: 2026, position: "외야수", grade: "1학년", height: 184, weight: 86, batsThrows: "우투우타" },
  { id: "sorae-07", number: "46", name: "김윤구", year: 2026, position: "내야수", grade: "1학년", height: 171, weight: 70, batsThrows: "좌투좌타" },
  { id: "sorae-08", number: "17", name: "김종혁", year: 2026, position: "투수", grade: "2학년", height: 185, weight: 90, batsThrows: "우투우타" },
  { id: "sorae-09", number: "50", name: "김지훈", year: 2026, position: "내야수", grade: "1학년", height: 180, weight: 90, batsThrows: "우투우타" },
  { id: "sorae-10", number: "42", name: "김진효", year: 2026, position: "포수", grade: "2학년", height: 181, weight: 90, batsThrows: "우투우타" },
  { id: "sorae-11", number: "9", name: "문주찬", year: 2026, position: "내야수", grade: "1학년", height: 174, weight: 78, batsThrows: "우투좌타" },
  { id: "sorae-12", number: "33", name: "박리현", year: 2026, position: "포수", grade: "1학년", height: 167, weight: 73, batsThrows: "우투좌타" },
  { id: "sorae-13", number: "7", name: "박민서", year: 2026, position: "내야수", grade: "3학년", height: 179, weight: 72, batsThrows: "우투우타" },
  { id: "sorae-14", number: "32", name: "박범찬", year: 2026, position: "포수", grade: "1학년", height: 170, weight: 75, batsThrows: "우투우타" },
  { id: "sorae-15", number: "44", name: "박지우", year: 2026, position: "내야수", grade: "1학년", height: 174, weight: 77, batsThrows: "우투우타" },
  { id: "sorae-16", number: "1", name: "배준석", year: 2026, position: "투수", grade: "3학년", height: 190, weight: 95, batsThrows: "우투우타" },
  { id: "sorae-17", number: "51", name: "손우성", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 77, batsThrows: "우투우타" },
  { id: "sorae-18", number: "23", name: "신호준", year: 2026, position: "외야수", grade: "1학년", height: 180, weight: 76, batsThrows: "우투우타" },
  { id: "sorae-19", number: "35", name: "안태현", year: 2026, position: "투수", grade: "2학년", height: 177, weight: 83, batsThrows: "우투우타" },
  { id: "sorae-20", number: "27", name: "윤건혁", year: 2026, position: "투수", grade: "2학년", height: 179, weight: 80, batsThrows: "우투우타" },
  { id: "sorae-21", number: "28", name: "이동우", year: 2026, position: "포수", grade: "2학년", height: 180, weight: 77, batsThrows: "우투우타" },
  { id: "sorae-22", number: "26", name: "이민준", year: 2026, position: "내야수", grade: "1학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "sorae-23", number: "15", name: "이민혁", year: 2026, position: "투수", grade: "1학년", height: 175, weight: 74, batsThrows: "미정" },
  { id: "sorae-24", number: "5", name: "이승필", year: 2026, position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "sorae-25", number: "3", name: "이시후", year: 2026, position: "외야수", grade: "2학년", height: 180, weight: 70, batsThrows: "우투우타" },
  { id: "sorae-26", number: "52", name: "이주환", year: 2026, position: "외야수", grade: "3학년", height: 184, weight: 87, batsThrows: "우투우타" },
  { id: "sorae-27", number: "11", name: "이준혁", year: 2026, position: "투수", grade: "3학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "sorae-28", number: "31", name: "이찬구", year: 2026, position: "외야수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "sorae-29", number: "6", name: "이현서", year: 2026, position: "내야수", grade: "3학년", height: 181, weight: 75, batsThrows: "우투우타" },
  { id: "sorae-30", number: "2", name: "이현웅", year: 2026, position: "투수", grade: "3학년", height: 178, weight: 74, batsThrows: "우투우타" },
  { id: "sorae-31", number: "18", name: "이호성", year: 2026, position: "투수", grade: "3학년", height: 192, weight: 100, batsThrows: "우투우타" },
  { id: "sorae-32", number: "41", name: "장지원", year: 2026, position: "투수", grade: "3학년", height: 190, weight: 90, batsThrows: "우투우타" },
  { id: "sorae-33", number: "21", name: "정시온", year: 2026, position: "투수", grade: "3학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "sorae-34", number: "8", name: "정태훈", year: 2026, position: "내야수", grade: "2학년", height: 178, weight: 71, batsThrows: "우투좌타" },
  { id: "sorae-35", number: "10", name: "정하윤", year: 2026, position: "내야수", grade: "2학년", height: 174, weight: 72, batsThrows: "우투우타" },
  { id: "sorae-36", number: "14", name: "채수환", year: 2026, position: "내야수", grade: "1학년", height: 165, weight: 62, batsThrows: "우투우타" },
  { id: "sorae-37", number: "54", name: "최성호", year: 2026, position: "투수", grade: "1학년", height: 172, weight: 62, batsThrows: "좌투좌타" },
  { id: "sorae-38", number: "20", name: "최지건", year: 2026, position: "투수", grade: "1학년", height: 179, weight: 84, batsThrows: "우투우타" },
  { id: "sorae-39", number: "29", name: "최진혁", year: 2026, position: "내야수", grade: "1학년", height: 177, weight: 69, batsThrows: "우투우타" },
  { id: "sorae-40", number: "22", name: "함도윤", year: 2026, position: "포수", grade: "3학년", height: 181, weight: 83, batsThrows: "우투우타" },
  { id: "sorae-41", number: "13", name: "함준서", year: 2026, position: "외야수", grade: "2학년", height: 180, weight: 70, batsThrows: "우투우타" },
  { id: "sorae-42", number: "25", name: "홍준영", year: 2026, position: "내야수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "sorae-43", number: "53", name: "황우경", year: 2026, position: "외야수", grade: "3학년", height: 183, weight: 83, batsThrows: "우투우타" },
];

export default function SoraeRoster() {
  return (
    <TeamRoster
      sectionId="sorae-roster"
      kicker="SORAE HIGH SCHOOL · 2026"
      title="소래고 선수단"
      subtitle="2026 등록 선수 43명 · 감독 김석인"
      teamLabel="소래고"
      monogram="소래"
      players={players}
    />
  );
}
