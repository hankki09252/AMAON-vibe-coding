"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

const players: TeamPlayer[] = [
  { id: "gl-39", number: "39", name: "권민수", position: "외야수", grade: "3학년", height: 181, weight: 88, batsThrows: "좌투좌타" },
  { id: "gl-7", number: "7", name: "김다원", position: "내야수", grade: "3학년", height: 183, weight: 82, batsThrows: "우투우타" },
  { id: "gl-15", number: "15", name: "김도훈", position: "외야수", grade: "1학년", height: 181, weight: 82, batsThrows: "우투좌타" },
  { id: "gl-17", number: "17", name: "김동현", position: "외야수", grade: "2학년", height: 179, weight: 78, batsThrows: "좌투좌타" },
  { id: "gl-8", number: "8", name: "김민석", position: "내야수", grade: "1학년", height: 178, weight: 78, batsThrows: "우투우타" },
  { id: "gl-1", number: "1", name: "김민찬", position: "투수", grade: "3학년", height: 187, weight: 90, batsThrows: "우투우타" },
  { id: "gl-19", number: "19", name: "김민혁", position: "투수", grade: "2학년", height: 185, weight: 84, batsThrows: "우투우타" },
  { id: "gl-9", number: "9", name: "김서우", position: "투수", grade: "1학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "gl-45", number: "45", name: "김예찬", position: "포수", grade: "1학년", height: 177, weight: 83, batsThrows: "우투우타" },
  { id: "gl-42", number: "42", name: "김지민", position: "포수", grade: "1학년", height: 170, weight: 79, batsThrows: "우투우타" },
  { id: "gl-55", number: "55", name: "김태윤", position: "내야수", grade: "2학년", height: 193, weight: 94, batsThrows: "우투좌타" },
  { id: "gl-29", number: "29", name: "김태하", position: "투수", grade: "1학년", height: 183, weight: 88, batsThrows: "좌투좌타" },
  { id: "gl-31", number: "31", name: "김태훈", position: "투수", grade: "1학년", height: 179, weight: 92, batsThrows: "좌투좌타" },
  { id: "gl-28", number: "28", name: "라윤환", position: "투수", grade: "1학년", height: 178, weight: 73, batsThrows: "좌투좌타" },
  { id: "gl-12", number: "12", name: "문정현", position: "포수", grade: "2학년", height: 177, weight: 82, batsThrows: "우투우타" },
  { id: "gl-41", number: "41", name: "박도영", position: "투수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투우타" },
  { id: "gl-50", number: "50", name: "박상준", position: "내야수", grade: "3학년", height: 186, weight: 99, batsThrows: "좌투좌타" },
  { id: "gl-5", number: "5", name: "박세진", position: "내야수", grade: "1학년", height: 178, weight: 68, batsThrows: "우투우타" },
  { id: "gl-27", number: "27", name: "박시우", position: "내야수", grade: "1학년", height: 187, weight: 89, batsThrows: "우투좌타" },
  { id: "gl-21", number: "21", name: "박의진", position: "투수", grade: "3학년", height: 193, weight: 98, batsThrows: "우투우타" },
  { id: "gl-43", number: "43", name: "박인후", position: "투수", grade: "2학년", height: 186, weight: 89, batsThrows: "우투우타" },
  { id: "gl-34", number: "34", name: "송관호", position: "외야수", grade: "3학년", height: 176, weight: 82, batsThrows: "우투우타" },
  { id: "gl-24", number: "24", name: "오승범", position: "외야수", grade: "1학년", height: 183, weight: 85, batsThrows: "좌투좌타" },
  { id: "gl-54", number: "54", name: "원종수", position: "투수", grade: "3학년", height: 189, weight: 90, batsThrows: "우투우타" },
  { id: "gl-47", number: "47", name: "원지우", position: "포수", grade: "3학년", height: 181, weight: 85, batsThrows: "우투우타" },
  { id: "gl-20", number: "20", name: "유건희", position: "투수", grade: "1학년", height: 181, weight: 80, batsThrows: "우투우타" },
  { id: "gl-33", number: "33", name: "유현석", position: "내야수", grade: "1학년", height: 176, weight: 70, batsThrows: "우투좌타" },
  { id: "gl-14", number: "14", name: "윤채완", position: "투수", grade: "2학년", height: 189, weight: 88, batsThrows: "우투우타" },
  { id: "gl-16", number: "16", name: "이건중", position: "내야수", grade: "3학년", height: 181, weight: 79, batsThrows: "우투우타" },
  { id: "gl-13", number: "13", name: "이범규", position: "외야수", grade: "2학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "gl-3", number: "3", name: "이산", position: "외야수", grade: "1학년", height: 175, weight: 64, batsThrows: "우투좌타" },
  { id: "gl-37", number: "37", name: "이준서", position: "투수", grade: "1학년", height: 179, weight: 76, batsThrows: "우투좌타" },
  { id: "gl-11", number: "11", name: "이해준", position: "투수", grade: "2학년", height: 182, weight: 85, batsThrows: "좌투좌타" },
  { id: "gl-22", number: "22", name: "임연준", position: "포수", grade: "1학년", height: 175, weight: 80, batsThrows: "우투우타" },
  { id: "gl-2", number: "2", name: "임예승", position: "투수", grade: "2학년", height: 187, weight: 77, batsThrows: "우투우타" },
  { id: "gl-23", number: "23", name: "임준원", position: "투수", grade: "3학년", height: 187, weight: 93, batsThrows: "좌투좌타" },
  { id: "gl-imhyeondam", number: "미정", name: "임현담", position: "투수", grade: "1학년", height: 172, weight: 85, batsThrows: "우투우타" },
  { id: "gl-53", number: "53", name: "전나엘", position: "내야수", grade: "2학년", height: 188, weight: 84, batsThrows: "우투좌타" },
  { id: "gl-18", number: "18", name: "정예준", position: "투수", grade: "2학년", height: 183, weight: 87, batsThrows: "우투우타" },
  { id: "gl-10", number: "10", name: "조영민", position: "내야수", grade: "2학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "gl-35", number: "35", name: "최윤우", position: "내야수", grade: "2학년", height: 183, weight: 76, batsThrows: "우투우타" },
  { id: "gl-51", number: "51", name: "최지석", position: "외야수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "gl-6", number: "6", name: "홍영록", position: "내야수", grade: "3학년", height: 179, weight: 75, batsThrows: "우투우타" },
];

export default function GangneungRoster() {
  return <TeamRoster sectionId="gangneung-roster" kicker="GANGNEUNG HIGH SCHOOL · U-18" title="강릉고 선수단" subtitle="2026 등록 선수 43명 · 감독 최재호" teamLabel="강릉고" monogram="GN" players={players} />;
}
