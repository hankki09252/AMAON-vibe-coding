"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "dongsan-49", number: "49", name: "강동희", position: "투수", grade: "1학년", height: 173, weight: 70, batsThrows: "우투우타" },
  { id: "dongsan-56", number: "56", name: "곽성민", position: "포수", grade: "1학년", height: 167, weight: 69, batsThrows: "우투우타" },
  { id: "dongsan-22", number: "22", name: "권도경", position: "포수", grade: "3학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "dongsan-53", number: "53", name: "김건우", position: "내야수", grade: "2학년", height: 179, weight: 83, batsThrows: "우투우타" },
  { id: "dongsan-41", number: "41", name: "김기현", position: "투수", grade: "1학년", height: 165, weight: 65, batsThrows: "우투우타" },
  { id: "dongsan-43", number: "43", name: "김동빈", position: "내야수", grade: "1학년", height: 170, weight: 64, batsThrows: "우투좌타" },
  { id: "dongsan-17", number: "17", name: "김동환", position: "투수", grade: "3학년", height: 191, weight: 95, batsThrows: "좌투좌타" },
  { id: "dongsan-11", number: "11", name: "김범주", position: "투수", grade: "3학년", height: 184, weight: 77, batsThrows: "우투좌타" },
  { id: "dongsan-26", number: "26", name: "김재웅", position: "투수", grade: "2학년", height: 185, weight: 88, batsThrows: "우투우타" },
  { id: "dongsan-5", number: "5", name: "김준우", position: "내야수", grade: "2학년", height: 174, weight: 65, batsThrows: "우투우타" },
  { id: "dongsan-6", number: "6", name: "김찬우", position: "내야수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "dongsan-32", number: "32", name: "김창준", position: "외야수", grade: "1학년", height: 168, weight: 64, batsThrows: "우투우타" },
  { id: "dongsan-30", number: "30", name: "김혁진", position: "투수", grade: "1학년", height: 182, weight: 71, batsThrows: "우투우타" },
  { id: "dongsan-29", number: "29", name: "남인웅", position: "투수", grade: "2학년", height: 181, weight: 80, batsThrows: "좌투좌타" },
  { id: "dongsan-21", number: "21", name: "박도현", position: "투수", grade: "2학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "dongsan-7", number: "7", name: "박동연", position: "내야수", grade: "3학년", height: 184, weight: 83, batsThrows: "우투좌타" },
  { id: "dongsan-44", number: "44", name: "박민호", position: "투수", grade: "1학년", height: 172, weight: 74, batsThrows: "우투우타" },
  { id: "dongsan-12", number: "12", name: "박시훈", position: "포수", grade: "2학년", height: 187, weight: 90, batsThrows: "우투우타" },
  { id: "dongsan-3", number: "3", name: "박준하", position: "내야수", grade: "3학년", height: 177, weight: 73, batsThrows: "우투우타" },
  { id: "dongsan-10", number: "10", name: "배서준", position: "외야수", grade: "3학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "dongsan-45", number: "45", name: "백진하", position: "투수", grade: "2학년", height: 188, weight: 91, batsThrows: "우투우타" },
  { id: "dongsan-24", number: "24", name: "신승엽", position: "외야수", grade: "2학년", height: 178, weight: 73, batsThrows: "우투우타" },
  { id: "dongsan-28", number: "28", name: "심가온", position: "투수", grade: "2학년", height: 182, weight: 85, batsThrows: "우투우타" },
  { id: "dongsan-39", number: "39", name: "심재학", position: "투수", grade: "1학년", height: 184, weight: 86, batsThrows: "좌투좌타" },
  { id: "dongsan-46", number: "46", name: "양다혁", position: "내야수", grade: "1학년", height: 192, weight: 98, batsThrows: "우투우타" },
  { id: "dongsan-50", number: "50", name: "오정재", position: "내야수", grade: "1학년", height: 186, weight: 98, batsThrows: "우투우타" },
  { id: "dongsan-36", number: "36", name: "이서진", position: "투수", grade: "1학년", height: 187, weight: 83, batsThrows: "우투우타" },
  { id: "dongsan-55", number: "55", name: "이승언", position: "투수", grade: "3학년", height: 189, weight: 92, batsThrows: "우투우타" },
  { id: "dongsan-9", number: "9", name: "이연재", position: "외야수", grade: "3학년", height: 173, weight: 73, batsThrows: "좌투좌타" },
  { id: "dongsan-34", number: "34", name: "이준혁", position: "투수", grade: "1학년", height: 180, weight: 80, batsThrows: "우투좌타" },
  { id: "dongsan-4", number: "4", name: "이지용", position: "내야수", grade: "2학년", height: 180, weight: 78, batsThrows: "우투좌타" },
  { id: "dongsan-16", number: "16", name: "임동현", position: "투수", grade: "3학년", height: 182, weight: 83, batsThrows: "우투좌타" },
  { id: "dongsan-54", number: "54", name: "장한결", position: "투수", grade: "3학년", height: 185, weight: 86, batsThrows: "좌투좌타" },
  { id: "dongsan-52", number: "52", name: "전동건", position: "내야수", grade: "1학년", height: 174, weight: 78, batsThrows: "우투우타" },
  { id: "dongsan-27", number: "27", name: "정서준", position: "외야수", grade: "2학년", height: 180, weight: 88, batsThrows: "우투우타" },
  { id: "dongsan-47", number: "47", name: "정원석", position: "포수", grade: "2학년", height: 170, weight: 78, batsThrows: "우투우타" },
  { id: "dongsan-33", number: "33", name: "정원욱", position: "투수", grade: "1학년", height: 170, weight: 80, batsThrows: "우투우타" },
];

export default function SeoulDongsanRoster() {
  return (
    <TeamRoster
      sectionId="seoul-dongsan-roster"
      kicker="SEOUL DONGSAN HIGH SCHOOL · U-18"
      title="서울동산고 선수단"
      subtitle="2026 등록 선수 37명 · 감독 곽동성"
      teamLabel="서울동산고"
      monogram="동산"
      players={players}
    />
  );
}
