"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "bj-15", number: "15", name: "고강욱", position: "투수", grade: "1학년", height: 186, weight: 90, batsThrows: "우투우타" },
  { id: "bj-14", number: "14", name: "고규원", position: "투수", grade: "1학년", height: 176, weight: 68, batsThrows: "좌투좌타" },
  { id: "bj-20", number: "20", name: "고도현", position: "투수", grade: "2학년", height: 183, weight: 82, batsThrows: "좌투좌타" },
  { id: "bj-35", number: "35", name: "고현석", position: "외야수", grade: "3학년", height: 183, weight: 90, batsThrows: "우투우타" },
  { id: "bj-27", number: "27", name: "김보국", position: "외야수", grade: "2학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "bj-47", number: "47", name: "김시우", position: "투수", grade: "2학년", height: 186, weight: 86, batsThrows: "좌투좌타" },
  { id: "bj-11", number: "11", name: "김시후", position: "투수", grade: "3학년", height: 190, weight: 80, batsThrows: "미지정" },
  { id: "bj-16", number: "16", name: "김유찬", position: "내야수", grade: "3학년", height: 185, weight: 85, batsThrows: "우투우타" },
  { id: "bj-38", number: "38", name: "김유현", position: "내야수", grade: "1학년", height: 178, weight: 70, batsThrows: "우투좌타" },
  { id: "bj-18", number: "18", name: "김지호", position: "투수", grade: "3학년", height: 183, weight: 88, batsThrows: "우투우타" },
  { id: "bj-19", number: "19", name: "김진우", position: "투수", grade: "2학년", height: 177, weight: 76, batsThrows: "우투우타" },
  { id: "bj-21", number: "21", name: "김태전", position: "투수", grade: "3학년", height: 183, weight: 90, batsThrows: "우투우타" },
  { id: "bj-31", number: "31", name: "김태호", position: "투수", grade: "1학년", height: 185, weight: 103, batsThrows: "우투우타" },
  { id: "bj-3", number: "3", name: "김하랑", position: "외야수", grade: "3학년", height: 176, weight: 75, batsThrows: "우투좌타" },
  { id: "bj-41", number: "41", name: "노율언", position: "투수", grade: "1학년", height: 178, weight: 85, batsThrows: "우투우타" },
  { id: "bj-29", number: "29", name: "노하율", position: "투수", grade: "1학년", height: 183, weight: 75, batsThrows: "좌투좌타" },
  { id: "bj-25", number: "25", name: "문지석", position: "내야수", grade: "1학년", height: 175, weight: 80, batsThrows: "우투우타" },
  { id: "bj-5", number: "5", name: "박준혁", position: "유격수", grade: "3학년", height: 175, weight: 73, batsThrows: "우투우타" },
  { id: "bj-7", number: "7", name: "신준혁", position: "내야수", grade: "2학년", height: 180, weight: 79, batsThrows: "우투좌타" },
  { id: "bj-1", number: "1", name: "엄태성", position: "투수", grade: "3학년", height: 192, weight: 95, batsThrows: "우투우타" },
  { id: "bj-10", number: "10", name: "오준혁", position: "포수", grade: "2학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "bj-28", number: "28", name: "이재우", position: "외야수", grade: "2학년", height: 178, weight: 72, batsThrows: "우투좌타" },
  { id: "bj-13", number: "13", name: "이주빈", position: "내야수", grade: "2학년", height: 177, weight: 82, batsThrows: "우투우타" },
  { id: "bj-23", number: "23", name: "이준재", position: "투수", grade: "1학년", height: 179, weight: 75, batsThrows: "우투우타" },
  { id: "bj-33", number: "33", name: "이태석", position: "외야수", grade: "1학년", height: 175, weight: 73, batsThrows: "우투우타" },
  { id: "bj-22", number: "22", name: "이한율", position: "포수", grade: "1학년", height: 170, weight: 75, batsThrows: "우투우타" },
  { id: "bj-17", number: "17", name: "임서후", position: "투수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "bj-6", number: "6", name: "임종호", position: "내야수", grade: "3학년", height: 180, weight: 77, batsThrows: "우투우타" },
  { id: "bj-2", number: "2", name: "임태강", position: "포수", grade: "3학년", height: 183, weight: 90, batsThrows: "우투우타" },
  { id: "bj-32", number: "32", name: "전홍민", position: "외야수", grade: "3학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "bj-12", number: "12", name: "정유찬", position: "투수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "bj-8", number: "8", name: "최윤제", position: "외야수", grade: "2학년", height: 176, weight: 78, batsThrows: "좌투좌타" },
  { id: "bj-24", number: "24", name: "한민", position: "내야수", grade: "1학년", height: 184, weight: 82, batsThrows: "우투우타" },
  { id: "bj-30", number: "30", name: "허건호", position: "투수", grade: "2학년", height: 183, weight: 81, batsThrows: "좌투좌타" },
];

export default function BaekjaeRoster() {
  return (
    <TeamRoster
      sectionId="baekjae-roster"
      kicker="PAICHAI HIGH SCHOOL · U-18"
      title="배재고 선수단"
      subtitle="2026 등록 선수 34명 · 감독 권오영"
      teamLabel="배재고"
      monogram="PJ"
      players={players}
    />
  );
}
