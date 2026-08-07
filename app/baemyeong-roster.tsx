"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "bm-23", number: "23", name: "강승재", position: "유격수", grade: "3학년", height: 174, weight: 75, batsThrows: "우투우타" },
  { id: "bm-34", number: "34", name: "강정운", position: "외야수", grade: "3학년", height: 178, weight: 65, batsThrows: "우투우타" },
  { id: "bm-36", number: "36", name: "강태윤", position: "내야수", grade: "2학년", height: 180, weight: 70, batsThrows: "우투우타" },
  { id: "bm-25", number: "25", name: "김강민", position: "포수", grade: "1학년", height: 180, weight: 86, batsThrows: "우투좌타" },
  { id: "bm-51", number: "51", name: "김대익", position: "내야수", grade: "1학년", height: 178, weight: 78, batsThrows: "우투우타" },
  { id: "bm-32", number: "32", name: "김동현", position: "외야수", grade: "2학년", height: 176, weight: 82, batsThrows: "우투우타" },
  { id: "bm-20", number: "20", name: "김민수", position: "투수", grade: "2학년", height: 189, weight: 94, batsThrows: "우투우타" },
  { id: "bm-40", number: "40", name: "김민준", position: "포수", grade: "1학년", height: 178, weight: 85, batsThrows: "우투우타" },
  { id: "bm-21", number: "21", name: "김세준", position: "투수", grade: "3학년", height: 185, weight: 97, batsThrows: "우투우타" },
  { id: "bm-29", number: "29", name: "김승준", position: "투수", grade: "1학년", height: 184, weight: 70, batsThrows: "우투우타" },
  { id: "bm-43", number: "43", name: "김영현", position: "외야수", grade: "1학년", height: 178, weight: 72, batsThrows: "우투우타" },
  { id: "bm-35", number: "35", name: "김윤우", position: "외야수", grade: "2학년", height: 182, weight: 88, batsThrows: "미지정" },
  { id: "bm-11", number: "11", name: "김지후", position: "투수", grade: "3학년", height: 186, weight: 90, batsThrows: "우투우타" },
  { id: "bm-17", number: "17", name: "김지훈", position: "투수", grade: "3학년", height: 183, weight: 92, batsThrows: "우투우타" },
  { id: "bm-5", number: "5", name: "김하진", position: "내야수", grade: "3학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "bm-7", number: "7", name: "김현진", position: "내야수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "bm-16", number: "16", name: "문도연", position: "외야수", grade: "3학년", height: 175, weight: 73, batsThrows: "우투우타" },
  { id: "bm-42", number: "42", name: "민경환", position: "내야수", grade: "1학년", height: 176, weight: 74, batsThrows: "우투우타" },
  { id: "bm-53", number: "53", name: "박민찬", position: "내야수", grade: "1학년", height: 179, weight: 75, batsThrows: "우투우타" },
  { id: "bm-49", number: "49", name: "박시원", position: "투수", grade: "3학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "bm-30", number: "30", name: "박시후", position: "투수", grade: "1학년", height: 184, weight: 86, batsThrows: "우투우타" },
  { id: "bm-48", number: "48", name: "박재민", position: "투수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투좌타" },
  { id: "bm-37", number: "37", name: "박준우", position: "투수", grade: "1학년", height: 178, weight: 77, batsThrows: "우투좌타" },
  { id: "bm-57", number: "57", name: "박희성", position: "투수", grade: "2학년", height: 190, weight: 91, batsThrows: "좌투우타" },
  { id: "bm-26", number: "26", name: "배지환", position: "외야수", grade: "1학년", height: 178, weight: 78, batsThrows: "우투우타" },
  { id: "bm-45", number: "45", name: "백종훈", position: "외야수", grade: "1학년", height: 177, weight: 72, batsThrows: "우투우타" },
  { id: "bm-13", number: "13", name: "신승헌", position: "투수", grade: "2학년", height: 179, weight: 78, batsThrows: "좌투좌타" },
  { id: "bm-12", number: "12", name: "안상혁", position: "내야수", grade: "3학년", height: 186, weight: 88, batsThrows: "우투우타" },
  { id: "bm-61", number: "61", name: "안준식", position: "외야수", grade: "1학년", height: 182, weight: 90, batsThrows: "우투좌타" },
  { id: "bm-10", number: "10", name: "양지훈", position: "외야수", grade: "3학년", height: 183, weight: 80, batsThrows: "우투좌타" },
  { id: "bm-3", number: "3", name: "엄서진", position: "외야수", grade: "2학년", height: 176, weight: 74, batsThrows: "우투좌타" },
  { id: "bm-50", number: "50", name: "오도영", position: "외야수", grade: "3학년", height: 173, weight: 85, batsThrows: "우투우타" },
  { id: "bm-15", number: "15", name: "오승민", position: "투수", grade: "2학년", height: 177, weight: 77, batsThrows: "좌투좌타" },
  { id: "bm-55", number: "55", name: "오윤호", position: "투수", grade: "1학년", height: 182, weight: 80, batsThrows: "우투좌타" },
  { id: "bm-62", number: "62", name: "유용주", position: "내야수", grade: "1학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "bm-22", number: "22", name: "윤한선", position: "포수", grade: "2학년", height: 173, weight: 85, batsThrows: "우투우타" },
  { id: "bm-18", number: "18", name: "이동현", position: "투수", grade: "3학년", height: 188, weight: 85, batsThrows: "우투우타" },
  { id: "bm-33", number: "33", name: "이서준", position: "투수", grade: "2학년", height: 191, weight: 105, batsThrows: "우투우타" },
  { id: "bm-39", number: "39", name: "이세민", position: "투수", grade: "3학년", height: 185, weight: 90, batsThrows: "우투우타" },
  { id: "bm-19", number: "19", name: "이재원", position: "투수", grade: "3학년", height: 181, weight: 83, batsThrows: "우투우타" },
  { id: "bm-8", number: "8", name: "이정원", position: "외야수", grade: "2학년", height: 183, weight: 79, batsThrows: "우투우타" },
  { id: "bm-1", number: "1", name: "이준한", position: "투수", grade: "3학년", height: 187, weight: 90, batsThrows: "좌투좌타" },
  { id: "bm-54", number: "54", name: "이찬", position: "내야수", grade: "1학년", height: 182, weight: 78, batsThrows: "우투좌타" },
  { id: "bm-44", number: "44", name: "이찬민", position: "투수", grade: "1학년", height: 188, weight: 86, batsThrows: "우투우타" },
  { id: "bm-9", number: "9", name: "이찬우", position: "외야수", grade: "3학년", height: 181, weight: 83, batsThrows: "우투우타" },
  { id: "bm-2", number: "2", name: "이태경", position: "투수", grade: "3학년", height: 183, weight: 87, batsThrows: "우투좌타" },
  { id: "bm-46", number: "46", name: "임현석", position: "투수", grade: "1학년", height: 183, weight: 84, batsThrows: "미지정" },
  { id: "bm-28", number: "28", name: "전도율", position: "투수", grade: "2학년", height: 180, weight: 78, batsThrows: "좌투좌타" },
  { id: "bm-52", number: "52", name: "정은찬", position: "내야수", grade: "2학년", height: 178, weight: 78, batsThrows: "우투좌타" },
  { id: "bm-24", number: "24", name: "정지승", position: "내야수", grade: "3학년", height: 176, weight: 84, batsThrows: "좌투좌타" },
  { id: "bm-31", number: "31", name: "조하진", position: "외야수", grade: "2학년", height: 185, weight: 74, batsThrows: "우투우타" },
  { id: "bm-47", number: "47", name: "지현민", position: "투수", grade: "2학년", height: 192, weight: 95, batsThrows: "우투우타" },
  { id: "bm-41", number: "41", name: "차보성", position: "투수", grade: "2학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "bm-27", number: "27", name: "최주환", position: "포수", grade: "3학년", height: 179, weight: 85, batsThrows: "우투우타" },
  { id: "bm-4", number: "4", name: "홍준서", position: "내야수", grade: "3학년", height: 179, weight: 70, batsThrows: "우투우타" },
  { id: "bm-14", number: "14", name: "황용범", position: "내야수", grade: "2학년", height: 175, weight: 70, batsThrows: "우투좌타" },
];

export default function BaemyeongRoster() {
  return (
    <TeamRoster
      sectionId="baemyeong-roster"
      kicker="BAEMYEONG HIGH SCHOOL · U-18"
      title="배명고 선수단"
      subtitle="2026 등록 선수 56명 · 감독 김경섭"
      teamLabel="배명고"
      monogram="BM"
      players={players}
    />
  );
}
