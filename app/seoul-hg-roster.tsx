"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "hg-19", number: "19", name: "권금재", position: "투수", grade: "2학년", height: 175, weight: 74, batsThrows: "우투우타" },
  { id: "hg-kim-dongyoung", number: "미정", name: "김동영", position: "미지정", grade: "3학년", height: 189, weight: 85, batsThrows: "미지정" },
  { id: "hg-27", number: "27", name: "김성준", position: "2루수", grade: "2학년", height: 176, weight: 83, batsThrows: "미지정" },
  { id: "hg-kim-yechan", number: "미정", name: "김예찬", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미지정" },
  { id: "hg-12", number: "12", name: "김유은", position: "포수", grade: "2학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "hg-3", number: "3", name: "노시훈", position: "내야수", grade: "1학년", height: 171, weight: 65, batsThrows: "우투우타" },
  { id: "hg-11", number: "11", name: "백경민", position: "투수", grade: "3학년", height: 195, weight: 88, batsThrows: "우투우타" },
  { id: "hg-22", number: "22", name: "범재원", position: "포수", grade: "3학년", height: 177, weight: 80, batsThrows: "우투양타" },
  { id: "hg-20", number: "20", name: "서요한", position: "외야수", grade: "3학년", height: 172, weight: 63, batsThrows: "우투우타" },
  { id: "hg-5", number: "5", name: "송병희", position: "내야수", grade: "3학년", height: 169, weight: 57, batsThrows: "우투우타" },
  { id: "hg-oh-seongmin", number: "미정", name: "오성민", position: "투수", grade: "2학년", height: 175, weight: 87, batsThrows: "우투우타" },
  { id: "hg-yu-mingyu", number: "미정", name: "유민규", position: "내야수", grade: "3학년", height: 170, weight: 85, batsThrows: "우투우타" },
  { id: "hg-16", number: "16", name: "이건호", position: "내야수", grade: "1학년", height: 171, weight: 64, batsThrows: "미지정" },
  { id: "hg-17", number: "17", name: "이주현", position: "투수", grade: "3학년", height: 188, weight: 75, batsThrows: "우투우타" },
  { id: "hg-23", number: "23", name: "전용주", position: "외야수", grade: "2학년", height: 185, weight: 99, batsThrows: "미지정" },
  { id: "hg-18", number: "18", name: "정성준", position: "투수", grade: "3학년", height: 179, weight: 76, batsThrows: "우투우타" },
  { id: "hg-9", number: "9", name: "태한결", position: "외야수", grade: "1학년", height: 180, weight: 80, batsThrows: "우투좌타" },
  { id: "hg-7", number: "7", name: "한선유", position: "내야수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투좌타" },
  { id: "hg-han-yejun", number: "미정", name: "한예준", position: "내야수", grade: "3학년", height: 178, weight: 61, batsThrows: "우투우타" },
  { id: "hg-24", number: "24", name: "한우진", position: "투수", grade: "3학년", height: 173, weight: 80, batsThrows: "좌투좌타" },
];

export default function SeoulHgRoster() {
  return (
    <TeamRoster
      sectionId="seoul-hg-roster"
      kicker="SEOUL HG BASEBALL CLUB · U-18"
      title="서울HG야구단 선수단"
      subtitle="2026 등록 선수 20명 · 감독 박상근"
      teamLabel="서울HG야구단(U-18)"
      monogram="HG"
      players={players}
    />
  );
}
