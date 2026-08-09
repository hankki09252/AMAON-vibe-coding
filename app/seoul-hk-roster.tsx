"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "hk-27", number: "27", name: "고민석", position: "포수", grade: "3학년", height: 180, weight: 90, batsThrows: "우투우타" },
  { id: "hk-16", number: "16", name: "구본우", position: "내야수", grade: "3학년", height: 183, weight: 80, batsThrows: "우투좌타" },
  { id: "hk-6", number: "6", name: "구본혁", position: "내야수", grade: "2학년", height: 178, weight: 78, batsThrows: "우투우타" },
  { id: "hk-5", number: "5", name: "김서희", position: "3루수", grade: "1학년", height: 171, weight: 78, batsThrows: "우투우타" },
  { id: "hk-kim-suhyeon", number: "미정", name: "김수현", position: "투수", grade: "3학년", height: 178, weight: 84, batsThrows: "우투우타" },
  { id: "hk-4", number: "4", name: "김시우", position: "내야수", grade: "2학년", height: 183, weight: 80, batsThrows: "우투우타" },
  { id: "hk-kim-ian", number: "미정", name: "김이안", position: "투수", grade: "2학년", height: 181, weight: 85, batsThrows: "우투좌타" },
  { id: "hk-53", number: "53", name: "김학빈", position: "포수", grade: "2학년", height: 171, weight: 83, batsThrows: "미정" },
  { id: "hk-29", number: "29", name: "김형준", position: "투수", grade: "2학년", height: 188, weight: 89, batsThrows: "좌투좌타" },
  { id: "hk-12", number: "12", name: "박도현", position: "투수", grade: "3학년", height: 172, weight: 71, batsThrows: "우투우타" },
  { id: "hk-21", number: "21", name: "박민준", position: "투수", grade: "2학년", height: 180, weight: 78, batsThrows: "좌투우타" },
  { id: "hk-8", number: "8", name: "박찬현", position: "외야수", grade: "3학년", height: 173, weight: 73, batsThrows: "좌투좌타" },
  { id: "hk-37", number: "37", name: "배강림", position: "투수", grade: "3학년", height: 182, weight: 78, batsThrows: "우투우타" },
  { id: "hk-62", number: "62", name: "소병인", position: "투수", grade: "1학년", height: 175, weight: 75, batsThrows: "우투좌타" },
  { id: "hk-28", number: "28", name: "송정민", position: "1루수", grade: "2학년", height: 181, weight: 90, batsThrows: "미정" },
  { id: "hk-30", number: "30", name: "송지호", position: "투수", grade: "2학년", height: 181, weight: 79, batsThrows: "우투우타" },
  { id: "hk-23", number: "23", name: "신지호", position: "중견수", grade: "3학년", height: 180, weight: 83, batsThrows: "우투우타" },
  { id: "hk-2", number: "2", name: "오현수", position: "투수", grade: "3학년", height: 184, weight: 90, batsThrows: "우투우타" },
  { id: "hk-24", number: "24", name: "원승민", position: "포수", grade: "1학년", height: 180, weight: 89, batsThrows: "우투우타" },
  { id: "hk-10", number: "10", name: "유승엽", position: "내야수", grade: "3학년", height: 177, weight: 78, batsThrows: "우투우타" },
  { id: "hk-41", number: "41", name: "유정우", position: "투수", grade: "1학년", height: 178, weight: 88, batsThrows: "우투우타" },
  { id: "hk-9", number: "9", name: "윤진우", position: "내야수", grade: "2학년", height: 181, weight: 83, batsThrows: "우투우타" },
  { id: "hk-33", number: "33", name: "이승준", position: "투수", grade: "2학년", height: 183, weight: 96, batsThrows: "우투우타" },
  { id: "hk-11", number: "11", name: "이시윤", position: "투수", grade: "2학년", height: 184, weight: 100, batsThrows: "우투좌타" },
  { id: "hk-26", number: "26", name: "이정우", position: "투수", grade: "3학년", height: 187, weight: 85, batsThrows: "우투좌타" },
  { id: "hk-51", number: "51", name: "이찬민", position: "투수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투우타" },
  { id: "hk-lee-taewoo", number: "미정", name: "이태우", position: "미지정", grade: "2학년", height: 182, weight: 82, batsThrows: "미정" },
  { id: "hk-19", number: "19", name: "임재현", position: "투수", grade: "2학년", height: 185, weight: 80, batsThrows: "우투우타" },
  { id: "hk-13", number: "13", name: "조광일", position: "외야수", grade: "2학년", height: 181, weight: 95, batsThrows: "우투우타" },
  { id: "hk-0", number: "0", name: "조근찬", position: "투수", grade: "3학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "hk-17", number: "17", name: "조형규", position: "투수", grade: "3학년", height: 180, weight: 82, batsThrows: "우투우타" },
  { id: "hk-15", number: "15", name: "지현우", position: "미지정", grade: "2학년", height: 180, weight: 78, batsThrows: "우투좌타" },
  { id: "hk-25", number: "25", name: "최성훈", position: "투수", grade: "2학년", height: 180, weight: 81, batsThrows: "우투우타" },
  { id: "hk-3", number: "3", name: "최준민", position: "내야수", grade: "3학년", height: 174, weight: 79, batsThrows: "우투우타" },
  { id: "hk-52", number: "52", name: "추승준", position: "외야수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "hk-7", number: "7", name: "현승준", position: "외야수", grade: "3학년", height: 168, weight: 64, batsThrows: "우투좌타" },
];

export default function SeoulHkRoster() {
  return (
    <TeamRoster
      sectionId="seoul-hk-roster"
      kicker="SEOUL HK BASEBALL CLUB · U-18"
      title="서울HK야구단 선수단"
      subtitle="2026 등록 선수 36명 · 감독 김진원"
      teamLabel="서울HK야구단(U-18)"
      monogram="HK"
      players={players}
    />
  );
}
