"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "buwon-01", number: "16", name: "강시우", year: 2026, position: "내야수", grade: "2학년", height: 181, weight: 84, batsThrows: "우투우타" },
  { id: "buwon-02", number: "14", name: "고근태", year: 2026, position: "내야수", grade: "2학년", height: 180, weight: 85, batsThrows: "우투좌타" },
  { id: "buwon-03", number: "23", name: "구채윤", year: 2026, position: "투수", grade: "2학년", height: 184, weight: 90, batsThrows: "우투우타" },
  { id: "buwon-04", number: "21", name: "김규현", year: 2026, position: "투수", grade: "1학년", height: 170, weight: 60, batsThrows: "우투우타" },
  { id: "buwon-05", number: "13", name: "김도영", year: 2026, position: "투수", grade: "1학년", height: 167, weight: 61, batsThrows: "우투우타" },
  { id: "buwon-06", number: "3", name: "김민성", year: 2026, position: "내야수", grade: "2학년", height: 163, weight: 65, batsThrows: "우투우타" },
  { id: "buwon-07", number: "7", name: "김하민", year: 2026, position: "외야수", grade: "3학년", height: 170, weight: 78, batsThrows: "좌투좌타" },
  { id: "buwon-08", number: "6", name: "류태식", year: 2026, position: "내야수", grade: "3학년", height: 173, weight: 70, batsThrows: "우투좌타" },
  { id: "buwon-09", number: "55", name: "박경호", year: 2026, position: "외야수", grade: "2학년", height: 179, weight: 85, batsThrows: "우투우타" },
  { id: "buwon-10", number: "45", name: "박계환", year: 2026, position: "투수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투우타" },
  { id: "buwon-11", number: "29", name: "박세민", year: 2026, position: "외야수", grade: "3학년", height: 176, weight: 70, batsThrows: "좌투좌타" },
  { id: "buwon-12", number: "2", name: "박준우", year: 2026, position: "내야수", grade: "1학년", height: 166, weight: 57, batsThrows: "우투우타" },
  { id: "buwon-13", number: "0", name: "석주영", year: 2026, position: "투수", grade: "2학년", height: 185, weight: 92, batsThrows: "우투우타" },
  { id: "buwon-14", number: "37", name: "소예성", year: 2026, position: "투수", grade: "2학년", height: 176, weight: 75, batsThrows: "우투우타" },
  { id: "buwon-15", number: "25", name: "신우주", year: 2026, position: "포수", grade: "2학년", height: 174, weight: 80, batsThrows: "우투우타" },
  { id: "buwon-16", number: "30", name: "오시언", year: 2026, position: "투수", grade: "1학년", height: 183, weight: 78, batsThrows: "우투우타" },
  { id: "buwon-17", number: "1", name: "원태웅", year: 2026, position: "내야수", grade: "3학년", height: 177, weight: 71, batsThrows: "우투우타" },
  { id: "buwon-18", number: "31", name: "이상효", year: 2026, position: "투수", grade: "1학년", height: 177, weight: 100, batsThrows: "미지정" },
  { id: "buwon-19", number: "41", name: "이준혁", year: 2026, position: "투수", grade: "2학년", height: 181, weight: 87, batsThrows: "우투우타" },
  { id: "buwon-20", number: "11", name: "이형규", year: 2026, position: "투수", grade: "3학년", height: 187, weight: 83, batsThrows: "우투우타" },
  { id: "buwon-21", number: "51", name: "정강별", year: 2026, position: "외야수", grade: "2학년", height: 180, weight: 72, batsThrows: "우투양타" },
  { id: "buwon-22", number: "47", name: "조희범", year: 2026, position: "투수", grade: "1학년", height: 177, weight: 68, batsThrows: "우투우타" },
  { id: "buwon-23", number: "22", name: "차도영", year: 2026, position: "포수", grade: "3학년", height: 183, weight: 90, batsThrows: "우투우타" },
  { id: "buwon-24", number: "15", name: "최우주", year: 2026, position: "투수", grade: "3학년", height: 182, weight: 82, batsThrows: "우투우타" },
  { id: "buwon-25", number: "17", name: "최은호", year: 2026, position: "외야수", grade: "3학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "buwon-26", number: "10", name: "한창오", year: 2026, position: "내야수", grade: "3학년", height: 180, weight: 90, batsThrows: "우투우타" },
  { id: "buwon-27", number: "12", name: "홍현민", year: 2026, position: "포수", grade: "1학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "buwon-28", number: "59", name: "황정빈", year: 2026, position: "투수", grade: "2학년", height: 184, weight: 84, batsThrows: "우투우타" },
  { id: "buwon-29", number: "36", name: "황주엽", year: 2026, position: "투수", grade: "2학년", height: 182, weight: 80, batsThrows: "좌투좌타" },
  { id: "buwon-30", number: "18", name: "황현우", year: 2026, position: "투수", grade: "2학년", height: 177, weight: 67, batsThrows: "우투우타" },
];

export default function BuwonRoster() {
  return (
    <TeamRoster
      sectionId="buwon-roster"
      kicker="BUWON BASEBALL CLUB · U-18"
      title="부원고야구단 선수단"
      subtitle="2026 등록 선수 30명 · 감독 김상현"
      teamLabel="부원고야구단"
      monogram="부원"
      players={players}
    />
  );
}
