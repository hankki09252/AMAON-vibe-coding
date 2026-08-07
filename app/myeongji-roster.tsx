"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "mj-gangjeongseok", number: "미정", name: "강정석", position: "미지정", grade: "3학년", height: 0, weight: 0, batsThrows: "미지정" },
  { id: "mj-25", number: "25", name: "고광운", position: "내야수", grade: "1학년", height: 174, weight: 72, batsThrows: "우투우타" },
  { id: "mj-14", number: "14", name: "김병준", position: "외야수", grade: "3학년", height: 171, weight: 76, batsThrows: "우투우타" },
  { id: "mj-16", number: "16", name: "김영준", position: "내야수", grade: "2학년", height: 180, weight: 57, batsThrows: "우투우타" },
  { id: "mj-51", number: "51", name: "김온유", position: "외야수", grade: "2학년", height: 184, weight: 75, batsThrows: "우투우타" },
  { id: "mj-5-kimjaehyeon", number: "5", name: "김재현", position: "외야수", grade: "1학년", height: 174, weight: 60, batsThrows: "좌투좌타" },
  { id: "mj-15", number: "15", name: "김현민", position: "1루수", grade: "3학년", height: 178, weight: 70, batsThrows: "좌투좌타" },
  { id: "mj-33-moongeonho", number: "33", name: "문건호", position: "투수", grade: "2학년", height: 187, weight: 70, batsThrows: "미지정" },
  { id: "mj-30-parkgeonwoo", number: "30", name: "박건우", position: "투수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "mj-30-parkoobin", number: "30", name: "박우빈", position: "외야수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "mj-8", number: "8", name: "배상호", position: "내야수", grade: "2학년", height: 185, weight: 77, batsThrows: "우투좌타" },
  { id: "mj-33-beomjunseo", number: "33", name: "범준서", position: "외야수", grade: "1학년", height: 177, weight: 77, batsThrows: "우투우타" },
  { id: "mj-sinyugeon", number: "미정", name: "신유건", position: "좌익수", grade: "1학년", height: 166, weight: 60, batsThrows: "우투우타" },
  { id: "mj-yangjiwoong", number: "미정", name: "양지웅", position: "투수", grade: "2학년", height: 172, weight: 60, batsThrows: "우투우타" },
  { id: "mj-13", number: "13", name: "원선호", position: "투수", grade: "2학년", height: 175, weight: 68, batsThrows: "우투우타" },
  { id: "mj-20", number: "20", name: "유준재", position: "내야수", grade: "1학년", height: 185, weight: 120, batsThrows: "우투우타" },
  { id: "mj-23", number: "23", name: "이경률", position: "외야수", grade: "3학년", height: 179, weight: 90, batsThrows: "우투우타" },
  { id: "mj-5-leeminkyu", number: "5", name: "이민규", position: "내야수", grade: "2학년", height: 162, weight: 42, batsThrows: "우투우타" },
  { id: "mj-4", number: "4", name: "이주인", position: "내야수", grade: "1학년", height: 170, weight: 60, batsThrows: "우투우타" },
  { id: "mj-6", number: "6", name: "장윤성", position: "내야수", grade: "3학년", height: 174, weight: 83, batsThrows: "우투우타" },
  { id: "mj-35", number: "35", name: "장종찬", position: "투수", grade: "3학년", height: 170, weight: 70, batsThrows: "우투우타" },
];

export default function MyeongjiRoster() {
  return <TeamRoster sectionId="myeongji-roster" kicker="MYEONGJI BC · U-18" title="명지BC 선수단" subtitle="2026 등록 선수 21명 · 감독 민상기" teamLabel="명지BC(U-18)" monogram="MJ" players={players} />;
}
