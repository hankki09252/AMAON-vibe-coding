"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "design-21", number: "21", name: "강지완", position: "투수", grade: "3학년", height: 179, weight: 84, batsThrows: "우투우타" },
  { id: "design-kim-dohyeon", number: "미정", name: "김도현", position: "포수", grade: "3학년", height: 179, weight: 88, batsThrows: "우투우타" },
  { id: "design-53", number: "53", name: "김재찬", position: "외야수", grade: "3학년", height: 183, weight: 92, batsThrows: "우투우타" },
  { id: "design-17", number: "17", name: "김준하", position: "외야수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투좌타" },
  { id: "design-33", number: "33", name: "김지훈", position: "외야수", grade: "3학년", height: 175, weight: 77, batsThrows: "우투우타" },
  { id: "design-20", number: "20", name: "김진서", position: "투수", grade: "3학년", height: 184, weight: 88, batsThrows: "우투우타" },
  { id: "design-18", number: "18", name: "김찬희", position: "투수", grade: "3학년", height: 177, weight: 83, batsThrows: "우투우타" },
  { id: "design-55", number: "55", name: "박근서", position: "투수", grade: "3학년", height: 188, weight: 95, batsThrows: "좌투좌타" },
  { id: "design-1", number: "1", name: "박주영", position: "투수", grade: "3학년", height: 188, weight: 84, batsThrows: "우투우타" },
  { id: "design-13", number: "13", name: "오동훈", position: "투수", grade: "3학년", height: 180, weight: 81, batsThrows: "좌투좌타" },
  { id: "design-7", number: "7", name: "유민준", position: "내야수", grade: "3학년", height: 183, weight: 75, batsThrows: "우투우타" },
  { id: "design-11", number: "11", name: "이은섭", position: "투수", grade: "3학년", height: 187, weight: 95, batsThrows: "우투좌타" },
  { id: "design-16", number: "16", name: "이준희", position: "내야수", grade: "3학년", height: 181, weight: 82, batsThrows: "우투우타" },
  { id: "design-31", number: "31", name: "임동현", position: "외야수", grade: "3학년", height: 180, weight: 75, batsThrows: "우투좌타" },
  { id: "design-2", number: "2", name: "임우섭", position: "내야수", grade: "3학년", height: 175, weight: 73, batsThrows: "우투좌타" },
  { id: "design-39", number: "39", name: "정은찬", position: "투수", grade: "3학년", height: 184, weight: 80, batsThrows: "우투우타" },
  { id: "design-51", number: "51", name: "한지호", position: "외야수", grade: "3학년", height: 183, weight: 78, batsThrows: "우투우타" },

  { id: "design-52", number: "52", name: "김민건", position: "투수", grade: "2학년", height: 183, weight: 87, batsThrows: "우투우타" },
  { id: "design-8", number: "8", name: "김용태", position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "design-23", number: "23", name: "노규민", position: "투수", grade: "2학년", height: 180, weight: 75, batsThrows: "우투우타" },
  { id: "design-45", number: "45", name: "박선규", position: "외야수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투우타" },
  { id: "design-48", number: "48", name: "신중원", position: "투수", grade: "2학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "design-27", number: "27", name: "양현모", position: "투수", grade: "2학년", height: 180, weight: 82, batsThrows: "우투우타" },
  { id: "design-22", number: "22", name: "어재원", position: "포수", grade: "2학년", height: 181, weight: 85, batsThrows: "우투좌타" },
  { id: "design-14", number: "14", name: "이동욱", position: "외야수", grade: "2학년", height: 181, weight: 78, batsThrows: "우투우타" },
  { id: "design-15", number: "15", name: "이종현", position: "투수", grade: "2학년", height: 185, weight: 90, batsThrows: "좌투우타" },
  { id: "design-5", number: "5", name: "장지혁", position: "내야수", grade: "2학년", height: 173, weight: 75, batsThrows: "우투우타" },
  { id: "design-3", number: "3", name: "전태빈", position: "외야수", grade: "2학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "design-41", number: "41", name: "조석희", position: "투수", grade: "2학년", height: 182, weight: 86, batsThrows: "우투좌타" },
  { id: "design-6", number: "6", name: "최승우", position: "내야수", grade: "2학년", height: 177, weight: 79, batsThrows: "우투좌타" },
  { id: "design-29", number: "29", name: "하늘", position: "투수", grade: "2학년", height: 187, weight: 88, batsThrows: "좌투좌타" },

  { id: "design-34", number: "34", name: "김범승", position: "내야수", grade: "1학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "design-28", number: "28", name: "김준우", position: "포수", grade: "1학년", height: 178, weight: 78, batsThrows: "우투우타" },
  { id: "design-19", number: "19", name: "손태준", position: "투수", grade: "1학년", height: 180, weight: 68, batsThrows: "우투우타" },
  { id: "design-4", number: "4", name: "신지성", position: "내야수", grade: "1학년", height: 178, weight: 76, batsThrows: "우투우타" },
  { id: "design-43", number: "43", name: "이민준", position: "투수", grade: "1학년", height: 183, weight: 83, batsThrows: "우투우타" },
  { id: "design-26", number: "26", name: "이은수", position: "투수", grade: "1학년", height: 180, weight: 76, batsThrows: "좌투좌타" },
  { id: "design-9", number: "9", name: "이재우", position: "유격수", grade: "1학년", height: 176, weight: 76, batsThrows: "우투우타" },
  { id: "design-35", number: "35", name: "정우민", position: "투수", grade: "1학년", height: 177, weight: 90, batsThrows: "우투우타" },
  { id: "design-12", number: "12", name: "정준형", position: "투수", grade: "1학년", height: 180, weight: 82, batsThrows: "우투우타" },
  { id: "design-24", number: "24", name: "편정준", position: "외야수", grade: "1학년", height: 175, weight: 64, batsThrows: "우투우타" },
  { id: "design-25", number: "25", name: "홍명진", position: "내야수", grade: "1학년", height: 172, weight: 68, batsThrows: "미정" },
];

export default function SeoulDesignRoster() {
  return (
    <TeamRoster
      sectionId="seoul-design-roster"
      kicker="SEOUL DESIGN HIGH SCHOOL · U-18"
      title="서울디자인고 선수단"
      subtitle="2026 등록 선수 42명 · 감독 이호"
      teamLabel="서울디자인고"
      monogram="디자인"
      players={players}
    />
  );
}
