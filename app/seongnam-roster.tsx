"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "seongnam-43", number: "43", name: "강규명", position: "내야수", grade: "1학년", height: 179, weight: 73, batsThrows: "우투우타" },
  { id: "seongnam-54", number: "54", name: "강우진", position: "투수", grade: "2학년", height: 185, weight: 94, batsThrows: "좌투좌타" },
  { id: "seongnam-21", number: "21", name: "강준우", position: "투수", grade: "3학년", height: 187, weight: 93, batsThrows: "좌투우타" },
  { id: "seongnam-go-jibeom", number: "미정", name: "고지범", position: "포수", grade: "1학년", height: 178, weight: 84, batsThrows: "우투우타" },
  { id: "seongnam-17", number: "17", name: "곽민성", position: "투수", grade: "3학년", height: 186, weight: 88, batsThrows: "우투우타" },
  { id: "seongnam-34", number: "34", name: "구민준", position: "투수", grade: "1학년", height: 192, weight: 83, batsThrows: "좌투우타" },
  { id: "seongnam-13", number: "13", name: "김건우", position: "유격수", grade: "3학년", height: 176, weight: 70, batsThrows: "우투우타" },
  { id: "seongnam-53", number: "53", name: "김규대", position: "투수", grade: "2학년", height: 184, weight: 84, batsThrows: "우투우타" },
  { id: "seongnam-9", number: "9", name: "김민성", position: "내야수", grade: "2학년", height: 184, weight: 80, batsThrows: "우투좌타" },
  { id: "seongnam-19", number: "19", name: "김민준", position: "투수", grade: "3학년", height: 190, weight: 80, batsThrows: "우투우타" },
  { id: "seongnam-65", number: "65", name: "김상우", position: "투수", grade: "1학년", height: 189, weight: 98, batsThrows: "우투우타" },
  { id: "seongnam-40", number: "40", name: "김성록", position: "투수", grade: "2학년", height: 191, weight: 95, batsThrows: "우투우타" },
  { id: "seongnam-50", number: "50", name: "김세인", position: "내야수", grade: "1학년", height: 182, weight: 73, batsThrows: "우투우타" },
  { id: "seongnam-66", number: "66", name: "김원준", position: "내야수", grade: "2학년", height: 177, weight: 76, batsThrows: "우투우타" },
  { id: "seongnam-46", number: "46", name: "김재경", position: "투수", grade: "2학년", height: 182, weight: 85, batsThrows: "우투우타" },
  { id: "seongnam-52", number: "52", name: "김재호", position: "포수", grade: "2학년", height: 179, weight: 80, batsThrows: "우투우타" },
  { id: "seongnam-16", number: "16", name: "김정민", position: "투수", grade: "미정", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "seongnam-22", number: "22", name: "김준화", position: "포수", grade: "미정", height: 183, weight: 86, batsThrows: "우투우타" },
  { id: "seongnam-11", number: "11", name: "김지민", position: "투수", grade: "미정", height: 190, weight: 91, batsThrows: "우투우타" },
  { id: "seongnam-20", number: "20", name: "김진호", position: "투수", grade: "3학년", height: 187, weight: 85, batsThrows: "우투우타" },
  { id: "seongnam-25", number: "25", name: "김태욱", position: "포수", grade: "미정", height: 180, weight: 82, batsThrows: "우투우타" },
  { id: "seongnam-4", number: "4", name: "김하준", position: "내야수", grade: "1학년", height: 178, weight: 70, batsThrows: "우투좌타" },
  { id: "seongnam-31", number: "31", name: "김하진", position: "외야수", grade: "1학년", height: 178, weight: 72, batsThrows: "우투좌타" },
  { id: "seongnam-14", number: "14", name: "김현서", position: "투수", grade: "1학년", height: 179, weight: 78, batsThrows: "우투우타" },
  { id: "seongnam-8", number: "8", name: "김현우", position: "외야수", grade: "1학년", height: 176, weight: 75, batsThrows: "우투우타" },
  { id: "seongnam-15", number: "15", name: "문기웅", position: "투수", grade: "2학년", height: 188, weight: 88, batsThrows: "좌투좌타" },
  { id: "seongnam-48", number: "48", name: "박찬서", position: "외야수", grade: "1학년", height: 178, weight: 65, batsThrows: "우투좌타" },
  { id: "seongnam-55", number: "55", name: "방민석", position: "내야수", grade: "1학년", height: 188, weight: 95, batsThrows: "우투우타" },
  { id: "seongnam-1", number: "1", name: "봉승현", position: "투수", grade: "2학년", height: 185, weight: 84, batsThrows: "우투우타" },
  { id: "seongnam-12", number: "12", name: "부건우", position: "투수", grade: "3학년", height: 185, weight: 82, batsThrows: "우투우타" },
  { id: "seongnam-2", number: "2", name: "서민준", position: "투수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투좌타" },
  { id: "seongnam-51", number: "51", name: "서찬빈", position: "외야수", grade: "2학년", height: 180, weight: 71, batsThrows: "우투좌타" },
  { id: "seongnam-47", number: "47", name: "성민제", position: "투수", grade: "1학년", height: 181, weight: 79, batsThrows: "좌투좌타" },
  { id: "seongnam-36", number: "36", name: "소성하", position: "투수", grade: "1학년", height: 190, weight: 90, batsThrows: "좌투좌타" },
  { id: "seongnam-64", number: "64", name: "안수혁", position: "포수", grade: "1학년", height: 187, weight: 80, batsThrows: "우투우타" },
];

export default function SeongnamRoster() {
  return (
    <TeamRoster
      sectionId="seongnam-roster"
      kicker="SEONGNAM HIGH SCHOOL · U-18"
      title="성남고 선수단"
      subtitle="2026 등록 선수 35명 · 감독 박혁"
      teamLabel="성남고"
      monogram="성남"
      players={players}
    />
  );
}
