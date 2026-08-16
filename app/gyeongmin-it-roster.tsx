"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "kmit-11", number: "11", name: "강병진", position: "투수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "kmit-12", number: "12", name: "강준구", position: "투수", grade: "3학년", height: 178, weight: 75, batsThrows: "우투우타" },
  { id: "kmit-13", number: "13", name: "곽대성", position: "내야수", grade: "3학년", height: 183, weight: 87, batsThrows: "미기재" },
  { id: "kmit-7", number: "7", name: "김건희", position: "외야수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "kmit-3", number: "3", name: "김동호", position: "투수", grade: "1학년", height: 180, weight: 90, batsThrows: "우투우타" },
  { id: "kmit-10", number: "10", name: "김래", position: "외야수", grade: "2학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "kmit-37", number: "37", name: "김보윤", position: "투수", grade: "1학년", height: 167, weight: 60, batsThrows: "우투우타" },
  { id: "kmit-30", number: "30", name: "김우진", position: "내야수", grade: "1학년", height: 170, weight: 52, batsThrows: "우투좌타" },
  { id: "kmit-6", number: "6", name: "김정환", position: "내야수", grade: "3학년", height: 180, weight: 72, batsThrows: "우투좌타" },
  { id: "kmit-0", number: "0", name: "김태운", position: "투수", grade: "1학년", height: 180, weight: 76, batsThrows: "우투우타" },
  { id: "kmit-15", number: "15", name: "김태준", position: "외야수", grade: "1학년", height: 171, weight: 58, batsThrows: "좌투우타" },
  { id: "kmit-21", number: "21", name: "문시우", position: "투수", grade: "1학년", height: 175, weight: 68, batsThrows: "우투우타" },
  { id: "kmit-44", number: "44", name: "방준원", position: "내야수", grade: "3학년", height: 188, weight: 93, batsThrows: "우투좌타" },
  { id: "kmit-31", number: "31", name: "서재원", position: "외야수", grade: "3학년", height: 163, weight: 77, batsThrows: "우투좌타" },
  { id: "kmit-25", number: "25", name: "손예찬", position: "포수", grade: "1학년", height: 171, weight: 83, batsThrows: "우투좌타" },
  { id: "kmit-4", number: "4", name: "손태욱", position: "외야수", grade: "1학년", height: 181, weight: 80, batsThrows: "우투우타" },
  { id: "kmit-song-yunchan", number: "미정", name: "송윤찬", position: "포수", grade: "2학년", height: 175, weight: 83, batsThrows: "우투우타" },
  { id: "kmit-8", number: "8", name: "엄태우", position: "내야수", grade: "2학년", height: 173, weight: 90, batsThrows: "우투우타" },
  { id: "kmit-1", number: "1", name: "원도형", position: "내야수", grade: "3학년", height: 184, weight: 82, batsThrows: "우투우타" },
  { id: "kmit-52", number: "52", name: "이재호", position: "내야수", grade: "3학년", height: 180, weight: 83, batsThrows: "우투좌타" },
  { id: "kmit-27", number: "27", name: "이준서", position: "외야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "kmit-28", number: "28", name: "이하엘", position: "투수", grade: "1학년", height: 178, weight: 77, batsThrows: "우투우타" },
  { id: "kmit-19", number: "19", name: "정민중", position: "투수", grade: "3학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "kmit-17", number: "17", name: "최의현", position: "내야수", grade: "3학년", height: 170, weight: 59, batsThrows: "우투좌타" },
  { id: "kmit-16", number: "16", name: "최재이", position: "외야수", grade: "3학년", height: 182, weight: 87, batsThrows: "우투우타" },
  { id: "kmit-18", number: "18", name: "최지우", position: "투수", grade: "2학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "kmit-45", number: "45", name: "홍지석", position: "투수", grade: "3학년", height: 185, weight: 92, batsThrows: "우투우타" },
  { id: "kmit-39", number: "39", name: "황찬빈", position: "투수", grade: "1학년", height: 181, weight: 78, batsThrows: "우투우타" },
];

export default function GyeongminItRoster() {
  return (
    <TeamRoster
      sectionId="gyeongmin-it-roster"
      kicker="GYEONGMIN IT HIGH SCHOOL · U-18"
      title="경민IT고 선수단"
      subtitle="2026 등록 선수 28명 · 감독 김종석"
      teamLabel="경민IT고"
      monogram="경민"
      players={players}
    />
  );
}
