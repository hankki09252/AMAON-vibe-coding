"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "semyeong-16", number: "16", name: "김건우", position: "투수", grade: "3학년", height: 185, weight: 90, batsThrows: "우투우타" },
  { id: "semyeong-54", number: "54", name: "김광현", position: "내야수", grade: "1학년", height: 173, weight: 73, batsThrows: "우투우타" },
  { id: "semyeong-kim-juhan", number: "미정", name: "김주한", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-11", number: "11", name: "김준연", position: "투수", grade: "3학년", height: 180, weight: 70, batsThrows: "우투우타" },
  { id: "semyeong-17", number: "17", name: "김지율", position: "미지정", grade: "3학년", height: 184, weight: 77, batsThrows: "우투우타" },
  { id: "semyeong-nam-inung", number: "미정", name: "남인웅", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-18", number: "18", name: "박시후", position: "투수", grade: "2학년", height: 175, weight: 65, batsThrows: "우투우타" },
  { id: "semyeong-46", number: "46", name: "방시현", position: "투수", grade: "2학년", height: 180, weight: 72, batsThrows: "우투우타" },
  { id: "semyeong-7", number: "7", name: "소재원", position: "내야수", grade: "3학년", height: 175, weight: 76, batsThrows: "우투우타" },
  { id: "semyeong-29", number: "29", name: "신제은", position: "투수", grade: "3학년", height: 178, weight: 75, batsThrows: "좌투좌타" },
  { id: "semyeong-sin-huisu", number: "미정", name: "신희수", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-an-ujin", number: "미정", name: "안우진", position: "미지정", grade: "1학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-an-uhyeon", number: "미정", name: "안우현", position: "외야수", grade: "3학년", height: 180, weight: 70, batsThrows: "좌투좌타" },
  { id: "semyeong-yang-hyeonmo", number: "미정", name: "양현모", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-yu-jaehyeon", number: "미정", name: "유재현", position: "포수", grade: "3학년", height: 177, weight: 78, batsThrows: "우투우타" },
  { id: "semyeong-0", number: "0", name: "이성빈", position: "투수", grade: "3학년", height: 182, weight: 77, batsThrows: "미정" },
  { id: "semyeong-8", number: "8", name: "이은석", position: "포수", grade: "3학년", height: 177, weight: 85, batsThrows: "미정" },
  { id: "semyeong-33", number: "33", name: "이준섭", position: "내야수", grade: "1학년", height: 178, weight: 92, batsThrows: "우투우타" },
  { id: "semyeong-51", number: "51", name: "이준율", position: "외야수", grade: "3학년", height: 179, weight: 75, batsThrows: "좌투좌타" },
  { id: "semyeong-23", number: "23", name: "이형재", position: "3루수", grade: "3학년", height: 178, weight: 72, batsThrows: "우투우타" },
  { id: "semyeong-44", number: "44", name: "임현성", position: "포수", grade: "3학년", height: 186, weight: 94, batsThrows: "우투우타" },
  { id: "semyeong-12", number: "12", name: "전준현", position: "투수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "semyeong-ji-mingyeom", number: "미정", name: "지민겸", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-13", number: "13", name: "천준오", position: "투수", grade: "2학년", height: 177, weight: 77, batsThrows: "우투우타" },
  { id: "semyeong-3", number: "3", name: "최규현", position: "외야수", grade: "3학년", height: 174, weight: 69, batsThrows: "좌투좌타" },
  { id: "semyeong-choi-juhwan", number: "미정", name: "최주환", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미정" },
  { id: "semyeong-5", number: "5", name: "최지민", position: "내야수", grade: "3학년", height: 174, weight: 72, batsThrows: "우투우타" },
];

export default function SemyeongRoster() {
  return (
    <TeamRoster
      sectionId="semyeong-roster"
      kicker="SEMYEONG COMPUTER HIGH SCHOOL · U-18"
      title="세명컴퓨터고야구단 선수단"
      subtitle="2026 등록 선수 27명 · 감독 안승찬"
      teamLabel="세명컴퓨터고야구단"
      monogram="세명"
      players={players}
    />
  );
}
