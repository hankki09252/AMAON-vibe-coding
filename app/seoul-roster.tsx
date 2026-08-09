"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "seoul-39", number: "39", name: "강민구", position: "투수", grade: "1학년", height: 188, weight: 95, batsThrows: "우투우타" },
  { id: "seoul-8", number: "8", name: "권상혁", position: "외야수", grade: "3학년", height: 178, weight: 76, batsThrows: "좌투좌타" },
  { id: "seoul-23", number: "23", name: "김규남", position: "내야수", grade: "1학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "seoul-37", number: "37", name: "김대성", position: "투수", grade: "1학년", height: 177, weight: 70, batsThrows: "우투좌타" },
  { id: "seoul-12", number: "12", name: "김동윤", position: "투수", grade: "2학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "seoul-21", number: "21", name: "김동현", position: "투수", grade: "3학년", height: 185, weight: 87, batsThrows: "우투우타" },
  { id: "seoul-1", number: "1", name: "김명현", position: "외야수", grade: "3학년", height: 178, weight: 76, batsThrows: "우투좌타" },
  { id: "seoul-11", number: "11", name: "김민진", position: "투수", grade: "3학년", height: 187, weight: 88, batsThrows: "우투우타" },
  { id: "seoul-7", number: "7", name: "김선빈", position: "유격수", grade: "3학년", height: 187, weight: 84, batsThrows: "우투우타" },
  { id: "seoul-49", number: "49", name: "김시우", position: "투수", grade: "1학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "seoul-51", number: "51", name: "김정우", position: "외야수", grade: "3학년", height: 181, weight: 79, batsThrows: "우투우타" },
  { id: "seoul-17", number: "17", name: "김준호", position: "투수", grade: "3학년", height: 185, weight: 86, batsThrows: "우투우타" },
  { id: "seoul-52", number: "52", name: "김지우", position: "내야수", grade: "3학년", height: 185, weight: 86, batsThrows: "우투우타" },
  { id: "seoul-53", number: "53", name: "김태현", position: "외야수", grade: "2학년", height: 184, weight: 88, batsThrows: "좌투좌타" },
  { id: "seoul-28", number: "28", name: "민서준", position: "외야수", grade: "1학년", height: 176, weight: 76, batsThrows: "우투우타" },
  { id: "seoul-15", number: "15", name: "박경민", position: "투수", grade: "2학년", height: 185, weight: 80, batsThrows: "좌투좌타" },
  { id: "seoul-36", number: "36", name: "박승민", position: "외야수", grade: "2학년", height: 182, weight: 83, batsThrows: "우투좌타" },
  { id: "seoul-33", number: "33", name: "박주빈", position: "내야수", grade: "2학년", height: 187, weight: 87, batsThrows: "우투우타" },
  { id: "seoul-25", number: "25", name: "박준성", position: "포수", grade: "3학년", height: 177, weight: 78, batsThrows: "우투우타" },
  { id: "seoul-19", number: "19", name: "박찬휘", position: "투수", grade: "2학년", height: 192, weight: 93, batsThrows: "우투우타" },
  { id: "seoul-14", number: "14", name: "방영웅", position: "투수", grade: "2학년", height: 188, weight: 86, batsThrows: "우투좌타" },
  { id: "seoul-22", number: "22", name: "방지용", position: "포수", grade: "2학년", height: 177, weight: 81, batsThrows: "우투우타" },
  { id: "seoul-10", number: "10", name: "서유현", position: "투수", grade: "3학년", height: 183, weight: 87, batsThrows: "우투우타" },
  { id: "seoul-59", number: "59", name: "송경찬", position: "투수", grade: "1학년", height: 191, weight: 97, batsThrows: "우투우타" },
  { id: "seoul-16", number: "16", name: "송지윤", position: "내야수", grade: "3학년", height: 181, weight: 78, batsThrows: "미정" },
  { id: "seoul-20", number: "20", name: "송재윤", position: "투수", grade: "2학년", height: 186, weight: 90, batsThrows: "우투우타" },
  { id: "seoul-5", number: "5", name: "신승원", position: "내야수", grade: "2학년", height: 178, weight: 75, batsThrows: "우투좌타" },
  { id: "seoul-56", number: "56", name: "양기성", position: "투수", grade: "2학년", height: 191, weight: 90, batsThrows: "미정" },
  { id: "seoul-40", number: "40", name: "어유담", position: "투수", grade: "1학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "seoul-24", number: "24", name: "엄백호", position: "투수", grade: "1학년", height: 194, weight: 94, batsThrows: "우투우타" },
  { id: "seoul-9", number: "9", name: "엄시우", position: "포수", grade: "1학년", height: 181, weight: 90, batsThrows: "우투우타" },
  { id: "seoul-47", number: "47", name: "유준상", position: "내야수", grade: "1학년", height: 184, weight: 88, batsThrows: "좌투좌타" },
  { id: "seoul-57", number: "57", name: "유준언", position: "외야수", grade: "1학년", height: 182, weight: 75, batsThrows: "우투우타" },
  { id: "seoul-26", number: "26", name: "이정수", position: "투수", grade: "2학년", height: 191, weight: 95, batsThrows: "우투좌타" },
  { id: "seoul-50", number: "50", name: "이승현", position: "외야수", grade: "1학년", height: 185, weight: 70, batsThrows: "좌투좌타" },
];

export default function SeoulRoster() {
  return (
    <TeamRoster
      sectionId="seoul-roster"
      kicker="SEOUL HIGH SCHOOL · U-18"
      title="서울고 선수단"
      subtitle="2026 등록 선수 35명 · 감독 김동수"
      teamLabel="서울고"
      monogram="서울"
      players={players}
    />
  );
}
