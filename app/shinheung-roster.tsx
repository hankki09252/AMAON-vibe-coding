"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "shinheung-01", number: "14", name: "권상균", year: 2026, position: "외야수", grade: "3학년", height: 180, weight: 79, batsThrows: "우투좌타" },
  { id: "shinheung-02", number: "9", name: "권준희", year: 2026, position: "유격수", grade: "1학년", height: 183, weight: 63, batsThrows: "우투좌타" },
  { id: "shinheung-03", number: "51", name: "김선우", year: 2026, position: "미지정", grade: "1학년", height: 179, weight: 75, batsThrows: "좌투좌타" },
  { id: "shinheung-04", number: "11", name: "김유찬", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 75, batsThrows: "미지정" },
  { id: "shinheung-05", number: "39", name: "김지후", year: 2026, position: "투수", grade: "1학년", height: 165, weight: 54, batsThrows: "미지정" },
  { id: "shinheung-06", number: "47", name: "김희재", year: 2026, position: "투수", grade: "1학년", height: 175, weight: 74, batsThrows: "우투우타" },
  { id: "shinheung-07", number: "7", name: "문규빈", year: 2026, position: "포수", grade: "2학년", height: 173, weight: 75, batsThrows: "우투우타" },
  { id: "shinheung-08", number: "50", name: "문서진", year: 2026, position: "투수", grade: "3학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "shinheung-09", number: "1", name: "박도현", year: 2026, position: "내야수", grade: "3학년", height: 182, weight: 78, batsThrows: "우투좌타" },
  { id: "shinheung-10", number: "53", name: "박준혁", year: 2026, position: "외야수", grade: "2학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "shinheung-11", number: "17", name: "백미르", year: 2026, position: "투수", grade: "3학년", height: 177, weight: 73, batsThrows: "우투우타" },
  { id: "shinheung-12", number: "12", name: "봉경민", year: 2026, position: "투수", grade: "2학년", height: 177, weight: 75, batsThrows: "미지정" },
  { id: "shinheung-13", number: "3", name: "선민형", year: 2026, position: "투수", grade: "1학년", height: 170, weight: 60, batsThrows: "좌투좌타" },
  { id: "shinheung-14", number: "16", name: "오서진", year: 2026, position: "투수", grade: "2학년", height: 184, weight: 80, batsThrows: "미지정" },
  { id: "shinheung-15", number: "5", name: "이석민", year: 2026, position: "내야수", grade: "3학년", height: 178, weight: 82, batsThrows: "우투우타" },
  { id: "shinheung-16", number: "52", name: "이수찬", year: 2026, position: "외야수", grade: "3학년", height: 178, weight: 75, batsThrows: "우투우타" },
  { id: "shinheung-17", number: "36", name: "이예준", year: 2026, position: "내야수", grade: "1학년", height: 170, weight: 68, batsThrows: "미지정" },
  { id: "shinheung-18", number: "41", name: "이창록", year: 2026, position: "투수", grade: "1학년", height: 183, weight: 74, batsThrows: "미지정" },
  { id: "shinheung-19", number: "34", name: "장하담", year: 2026, position: "3루수", grade: "1학년", height: 179, weight: 73, batsThrows: "미지정" },
  { id: "shinheung-20", number: "55", name: "전희준", year: 2026, position: "외야수", grade: "1학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "shinheung-21", number: "8", name: "정기범", year: 2026, position: "3루수", grade: "3학년", height: 188, weight: 98, batsThrows: "우투우타" },
  { id: "shinheung-22", number: "27", name: "정우찬", year: 2026, position: "투수", grade: "3학년", height: 186, weight: 88, batsThrows: "우투우타" },
  { id: "shinheung-23", number: "18", name: "정재훈", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 82, batsThrows: "우투우타" },
  { id: "shinheung-24", number: "10", name: "정재훈", year: 2026, position: "포수", grade: "3학년", height: 177, weight: 90, batsThrows: "우투우타" },
  { id: "shinheung-25", number: "23", name: "채명진", year: 2026, position: "외야수", grade: "1학년", height: 167, weight: 68, batsThrows: "미지정" },
  { id: "shinheung-26", number: "25", name: "최은우", year: 2026, position: "포수", grade: "1학년", height: 183, weight: 97, batsThrows: "우투우타" },
  { id: "shinheung-27", number: "13", name: "최하진", year: 2026, position: "내야수", grade: "2학년", height: 179, weight: 88, batsThrows: "우투우타" },
  { id: "shinheung-28", number: "6", name: "최현준", year: 2026, position: "2루수", grade: "2학년", height: 171, weight: 70, batsThrows: "우투우타" },
  { id: "shinheung-29", number: "22", name: "한대호", year: 2026, position: "포수", grade: "1학년", height: 173, weight: 78, batsThrows: "우투우타" },
  { id: "shinheung-30", number: "31", name: "홍정우", year: 2026, position: "투수", grade: "1학년", height: 178, weight: 0, batsThrows: "미지정" },
];

export default function ShinheungRoster() {
  return (
    <TeamRoster
      sectionId="shinheung-roster"
      kicker="SHINHEUNG HIGH SCHOOL · 2026"
      title="신흥고 선수단"
      subtitle="2026 등록 선수 30명 · 감독 곽연수"
      teamLabel="신흥고"
      monogram="신"
      players={players}
    />
  );
}
