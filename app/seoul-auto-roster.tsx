"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "seoul-auto-17", number: "17", name: "강동훈", position: "투수", grade: "3학년", height: 186, weight: 90, batsThrows: "우투우타" },
  { id: "seoul-auto-1", number: "1", name: "강준영", position: "투수", grade: "3학년", height: 191, weight: 95, batsThrows: "미정" },
  { id: "seoul-auto-7", number: "7", name: "곽동엽", position: "투수", grade: "3학년", height: 187, weight: 90, batsThrows: "좌투좌타" },
  { id: "seoul-auto-21", number: "21", name: "권률이", position: "투수", grade: "3학년", height: 181, weight: 80, batsThrows: "우투우타" },
  { id: "seoul-auto-51", number: "51", name: "기화빈", position: "투수", grade: "3학년", height: 190, weight: 83, batsThrows: "우투우타" },
  { id: "seoul-auto-3", number: "3", name: "김강희", position: "외야수", grade: "3학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "seoul-auto-44", number: "44", name: "김예준", position: "3루수", grade: "2학년", height: 185, weight: 90, batsThrows: "우투우타" },
  { id: "seoul-auto-13", number: "13", name: "김태완", position: "투수", grade: "2학년", height: 175, weight: 78, batsThrows: "우투우타" },
  { id: "seoul-auto-24", number: "24", name: "김태원", position: "포수", grade: "3학년", height: 186, weight: 90, batsThrows: "미정" },
  { id: "seoul-auto-20", number: "20", name: "나결", position: "외야수", grade: "3학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "seoul-auto-12", number: "12", name: "박수현", position: "외야수", grade: "3학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "seoul-auto-31", number: "31", name: "배지환", position: "투수", grade: "2학년", height: 179, weight: 77, batsThrows: "우투우타" },
  { id: "seoul-auto-byeon-suyong", number: "미정", name: "변수용", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "seoul-auto-9", number: "9", name: "송예성", position: "외야수", grade: "1학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "seoul-auto-42", number: "42", name: "양민준", position: "외야수", grade: "2학년", height: 178, weight: 83, batsThrows: "우투우타" },
  { id: "seoul-auto-52", number: "52", name: "우승규", position: "내야수", grade: "3학년", height: 180, weight: 87, batsThrows: "우투우타" },
  { id: "seoul-auto-5", number: "5", name: "이강혁", position: "내야수", grade: "2학년", height: 172, weight: 63, batsThrows: "우투좌타" },
  { id: "seoul-auto-2", number: "2", name: "이준영", position: "투수", grade: "2학년", height: 176, weight: 75, batsThrows: "우투우타" },
  { id: "seoul-auto-4", number: "4", name: "이준혁", position: "내야수", grade: "3학년", height: 175, weight: 78, batsThrows: "우투좌타" },
  { id: "seoul-auto-39", number: "39", name: "이지원", position: "외야수", grade: "2학년", height: 173, weight: 74, batsThrows: "좌투좌타" },
  { id: "seoul-auto-10", number: "10", name: "이태경", position: "외야수", grade: "2학년", height: 174, weight: 65, batsThrows: "미정" },
  { id: "seoul-auto-11", number: "11", name: "임하진", position: "투수", grade: "3학년", height: 185, weight: 91, batsThrows: "우투우타" },
  { id: "seoul-auto-41", number: "41", name: "정도훈", position: "투수", grade: "3학년", height: 193, weight: 98, batsThrows: "우투우타" },
  { id: "seoul-auto-61", number: "61", name: "정민준", position: "투수", grade: "2학년", height: 182, weight: 75, batsThrows: "미정" },
  { id: "seoul-auto-25", number: "25", name: "정선우", position: "포수", grade: "3학년", height: 180, weight: 89, batsThrows: "우투우타" },
  { id: "seoul-auto-16", number: "16", name: "정수혁", position: "투수", grade: "3학년", height: 186, weight: 87, batsThrows: "우투우타" },
  { id: "seoul-auto-19", number: "19", name: "조성훈", position: "투수", grade: "2학년", height: 185, weight: 87, batsThrows: "미정" },
  { id: "seoul-auto-18", number: "18", name: "조의담", position: "투수", grade: "2학년", height: 180, weight: 75, batsThrows: "우투우타" },
  { id: "seoul-auto-8", number: "8", name: "최동현", position: "미지정", grade: "2학년", height: 175, weight: 85, batsThrows: "우투우타" },
  { id: "seoul-auto-choi-sion", number: "미정", name: "최시온", position: "미지정", grade: "1학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "seoul-auto-22", number: "22", name: "홍예권", position: "투수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "seoul-auto-53", number: "53", name: "홍지택", position: "내야수", grade: "2학년", height: 183, weight: 87, batsThrows: "우투우타" },
];

export default function SeoulAutoRoster() {
  return (
    <TeamRoster
      sectionId="seoul-auto-roster"
      kicker="SEOUL AUTOMOBILE HIGH SCHOOL · U-18"
      title="서울자동차고 선수단"
      subtitle="2026 등록 선수 32명 · 감독 이우종"
      teamLabel="서울자동차고"
      monogram="AUTO"
      players={players}
    />
  );
}
