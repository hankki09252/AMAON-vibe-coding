"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "bibong-01", number: "11", name: "곽민준", year: 2026, position: "투수", grade: "3학년", height: 175, weight: 80, batsThrows: "우투우타" },
  { id: "bibong-02", number: "22", name: "곽해찬", year: 2026, position: "포수", grade: "2학년", height: 178, weight: 86, batsThrows: "우투우타" },
  { id: "bibong-03", number: "19", name: "권대경", year: 2026, position: "투수", grade: "3학년", height: 181, weight: 79, batsThrows: "우투우타" },
  { id: "bibong-04", number: "14", name: "김건우", year: 2026, position: "투수", grade: "2학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "bibong-05", number: "51", name: "김동현", year: 2026, position: "투수", grade: "1학년", height: 173, weight: 63, batsThrows: "우투우타" },
  { id: "bibong-06", number: "24", name: "김병선", year: 2026, position: "내야수", grade: "1학년", height: 177, weight: 77, batsThrows: "우투우타" },
  { id: "bibong-07", number: "12", name: "김보현", year: 2026, position: "투수", grade: "2학년", height: 179, weight: 76, batsThrows: "우투우타" },
  { id: "bibong-08", number: "43", name: "김승유", year: 2026, position: "투수", grade: "2학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "bibong-09", number: "5", name: "김찬희", year: 2026, position: "내야수", grade: "2학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "bibong-10", number: "47", name: "김형준", year: 2026, position: "투수", grade: "1학년", height: 172, weight: 58, batsThrows: "좌투좌타" },
  { id: "bibong-11", number: "10", name: "남건욱", year: 2026, position: "내야수", grade: "3학년", height: 187, weight: 106, batsThrows: "우투우타" },
  { id: "bibong-12", number: "27", name: "박규정", year: 2026, position: "외야수", grade: "3학년", height: 180, weight: 79, batsThrows: "우투우타" },
  { id: "bibong-13", number: "53", name: "박도영", year: 2026, position: "외야수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "bibong-14", number: "1", name: "박진우", year: 2026, position: "투수", grade: "3학년", height: 188, weight: 89, batsThrows: "우투우타" },
  { id: "bibong-15", number: "40", name: "박태건", year: 2026, position: "투수", grade: "1학년", height: 172, weight: 75, batsThrows: "우투우타" },
  { id: "bibong-16", number: "20", name: "방진영", year: 2026, position: "투수", grade: "2학년", height: 187, weight: 85, batsThrows: "우투우타" },
  { id: "bibong-17", number: "17", name: "배종일", year: 2026, position: "투수", grade: "2학년", height: 170, weight: 70, batsThrows: "우투우타" },
  { id: "bibong-18", number: "41", name: "백승우", year: 2026, position: "투수", grade: "1학년", height: 174, weight: 75, batsThrows: "미지정" },
  { id: "bibong-19", number: "33", name: "서한울", year: 2026, position: "외야수", grade: "1학년", height: 173, weight: 72, batsThrows: "우투우타" },
  { id: "bibong-20", number: "2", name: "송민준", year: 2026, position: "내야수", grade: "2학년", height: 182, weight: 86, batsThrows: "우투좌타" },
  { id: "bibong-21", number: "3", name: "송지우", year: 2026, position: "외야수", grade: "2학년", height: 181, weight: 73, batsThrows: "우투우타" },
  { id: "bibong-22", number: "4", name: "유승수", year: 2026, position: "투수", grade: "2학년", height: 180, weight: 82, batsThrows: "우투우타" },
  { id: "bibong-23", number: "35", name: "유지석", year: 2026, position: "투수", grade: "1학년", height: 181, weight: 73, batsThrows: "우투우타" },
  { id: "bibong-24", number: "49", name: "유하랑", year: 2026, position: "투수", grade: "1학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "bibong-25", number: "31", name: "이윤서", year: 2026, position: "투수", grade: "1학년", height: 181, weight: 75, batsThrows: "미지정" },
  { id: "bibong-26", number: "37", name: "이제우", year: 2026, position: "투수", grade: "1학년", height: 182, weight: 75, batsThrows: "우투좌타" },
  { id: "bibong-27", number: "29", name: "이주안", year: 2026, position: "투수", grade: "2학년", height: 175, weight: 81, batsThrows: "좌투좌타" },
  { id: "bibong-28", number: "42", name: "이진호", year: 2026, position: "투수", grade: "1학년", height: 168, weight: 80, batsThrows: "우투우타" },
  { id: "bibong-29", number: "25", name: "이찬희", year: 2026, position: "1루수", grade: "1학년", height: 178, weight: 85, batsThrows: "우투우타" },
  { id: "bibong-30", number: "52", name: "이현서", year: 2026, position: "내야수", grade: "1학년", height: 178, weight: 75, batsThrows: "우투우타" },
  { id: "bibong-31", number: "49", name: "장지혁", year: 2026, position: "투수", grade: "2학년", height: 179, weight: 79, batsThrows: "우투우타" },
  { id: "bibong-32", number: "55", name: "전지후", year: 2026, position: "투수", grade: "2학년", height: 176, weight: 71, batsThrows: "우투우타" },
  { id: "bibong-33", number: "39", name: "정승우", year: 2026, position: "투수", grade: "1학년", height: 171, weight: 65, batsThrows: "우투우타" },
  { id: "bibong-34", number: "7", name: "최서윤", year: 2026, position: "내야수", grade: "3학년", height: 181, weight: 70, batsThrows: "우투우타" },
  { id: "bibong-35", number: "8", name: "최준영", year: 2026, position: "내야수", grade: "2학년", height: 180, weight: 76, batsThrows: "우투좌타" },
  { id: "bibong-36", number: "18", name: "최현우", year: 2026, position: "투수", grade: "3학년", height: 183, weight: 85, batsThrows: "좌투우타" },
  { id: "bibong-37", number: "21", name: "최훈", year: 2026, position: "투수", grade: "3학년", height: 181, weight: 87, batsThrows: "우투우타" },
  { id: "bibong-38", number: "16", name: "한예준", year: 2026, position: "내야수", grade: "2학년", height: 179, weight: 73, batsThrows: "우투우타" },
  { id: "bibong-39", number: "13", name: "허웅", year: 2026, position: "외야수", grade: "3학년", height: 182, weight: 89, batsThrows: "우투우타" },
];

export default function BibongRoster() {
  return (
    <TeamRoster
      sectionId="bibong-roster"
      kicker="BIBONG HIGH SCHOOL · U-18"
      title="비봉고 선수단"
      subtitle="2026 등록 선수 39명 · 감독 신현철"
      teamLabel="비봉고"
      monogram="비봉"
      players={players}
    />
  );
}
