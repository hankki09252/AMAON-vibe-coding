"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "gah-52", number: "52", name: "김도건", position: "내야수", grade: "3학년", height: 178, weight: 76, batsThrows: "우투좌타" },
  { id: "gah-40", number: "40", name: "김동윤", position: "투수", grade: "3학년", height: 186, weight: 90, batsThrows: "우투우타" },
  { id: "gah-14", number: "14", name: "김동호", position: "투수", grade: "1학년", height: 184, weight: 84, batsThrows: "우투우타" },
  { id: "gah-6", number: "6", name: "김민찬", position: "내야수", grade: "2학년", height: 173, weight: 73, batsThrows: "우투우타" },
  { id: "gah-20", number: "20", name: "김민후", position: "포수", grade: "1학년", height: 173, weight: 78, batsThrows: "우투우타" },
  { id: "gah-15", number: "15", name: "김예인", position: "외야수", grade: "1학년", height: 174, weight: 67, batsThrows: "좌투좌타" },
  { id: "gah-23", number: "23", name: "김용완", position: "포수", grade: "2학년", height: 185, weight: 82, batsThrows: "우투우타" },
  { id: "gah-42", number: "42", name: "김정혁", position: "포수", grade: "1학년", height: 177, weight: 83, batsThrows: "우투우타" },
  { id: "gah-53", number: "53", name: "김지후", position: "내야수", grade: "2학년", height: 173, weight: 68, batsThrows: "우투우타" },
  { id: "gah-16", number: "16", name: "김진하", position: "투수", grade: "3학년", height: 185, weight: 89, batsThrows: "우투우타" },
  { id: "gah-19", number: "19", name: "김진혁", position: "투수", grade: "1학년", height: 178, weight: 84, batsThrows: "우투우타" },
  { id: "gah-12", number: "12", name: "마주혁", position: "포수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "gah-32", number: "32", name: "박시우", position: "투수", grade: "3학년", height: 186, weight: 93, batsThrows: "좌투좌타" },
  { id: "gah-3", number: "3", name: "박현서", position: "외야수", grade: "2학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "gah-25", number: "25", name: "방선웅", position: "외야수", grade: "2학년", height: 180, weight: 78, batsThrows: "우투우타" },
  { id: "gah-44", number: "44", name: "배수인", position: "외야수", grade: "1학년", height: 180, weight: 87, batsThrows: "우투우타" },
  { id: "gah-8", number: "8", name: "배창렬", position: "외야수", grade: "3학년", height: 172, weight: 73, batsThrows: "우투우타" },
  { id: "gah-37", number: "37", name: "백아인", position: "투수", grade: "1학년", height: 183, weight: 88, batsThrows: "좌투좌타" },
  { id: "gah-24", number: "24", name: "송지환", position: "투수", grade: "1학년", height: 188, weight: 88, batsThrows: "우투우타" },
  { id: "gah-34", number: "34", name: "안지후", position: "투수", grade: "2학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "gah-22", number: "22", name: "유상연", position: "포수", grade: "1학년", height: 175, weight: 78, batsThrows: "우투좌타" },
  { id: "gah-29", number: "29", name: "유승주", position: "투수", grade: "2학년", height: 183, weight: 83, batsThrows: "좌투좌타" },
  { id: "gah-11", number: "11", name: "윤원석", position: "투수", grade: "2학년", height: 188, weight: 77, batsThrows: "우투우타" },
  { id: "gah-35", number: "35", name: "윤지승", position: "투수", grade: "1학년", height: 183, weight: 77, batsThrows: "우투우타" },
  { id: "gah-5", number: "5", name: "윤정후", position: "내야수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투좌타" },
  { id: "gah-41", number: "41", name: "이동형", position: "내야수", grade: "1학년", height: 181, weight: 77, batsThrows: "우투좌타" },
  { id: "gah-47", number: "47", name: "이서준", position: "투수", grade: "1학년", height: 189, weight: 82, batsThrows: "좌투좌타" },
  { id: "gah-17", number: "17", name: "이수빈", position: "투수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "gah-51", number: "51", name: "이주원", position: "외야수", grade: "3학년", height: 184, weight: 78, batsThrows: "우투우타" },
  { id: "gah-10", number: "10", name: "이지우", position: "내야수", grade: "2학년", height: 182, weight: 87, batsThrows: "우투우타" },
  { id: "gah-21", number: "21", name: "이지원", position: "투수", grade: "3학년", height: 188, weight: 85, batsThrows: "좌투좌타" },
  { id: "gah-1", number: "1", name: "이태성", position: "투수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "gah-50", number: "50", name: "이하민", position: "내야수", grade: "1학년", height: 171, weight: 70, batsThrows: "우투우타" },
  { id: "gah-4", number: "4", name: "임도훈", position: "내야수", grade: "1학년", height: 184, weight: 73, batsThrows: "우투좌타" },
  { id: "gah-45", number: "45", name: "정연호", position: "투수", grade: "2학년", height: 183, weight: 81, batsThrows: "우투우타" },
  { id: "gah-28", number: "28", name: "정윤호", position: "투수", grade: "2학년", height: 185, weight: 83, batsThrows: "우투우타" },
  { id: "gah-33", number: "33", name: "조지후", position: "투수", grade: "1학년", height: 186, weight: 72, batsThrows: "우투우타" },
  { id: "gah-18", number: "18", name: "진건언", position: "투수", grade: "3학년", height: 188, weight: 95, batsThrows: "우투우타" },
  { id: "gah-2", number: "2", name: "최유준", position: "내야수", grade: "2학년", height: 172, weight: 70, batsThrows: "우투우타" },
  { id: "gah-7", number: "7", name: "최현성", position: "2루수", grade: "3학년", height: 176, weight: 75, batsThrows: "우투우타" },
  { id: "gah-27", number: "27", name: "한동연", position: "포수", grade: "3학년", height: 183, weight: 87, batsThrows: "우투우타" },
  { id: "gah-9", number: "9", name: "홍성욱", position: "외야수", grade: "1학년", height: 177, weight: 65, batsThrows: "우투우타" },
  { id: "gah-31", number: "31", name: "황재원", position: "투수", grade: "2학년", height: 179, weight: 80, batsThrows: "우투우타" },
];

export default function GyeonggiAviationRoster() {
  return (
    <TeamRoster
      sectionId="gyeonggi-aviation-roster"
      kicker="GYEONGGI AVIATION HIGH SCHOOL · U-18"
      title="경기항공고 선수단"
      subtitle="2026 등록 선수 43명 · 감독 이동수"
      teamLabel="경기항공고"
      monogram="항공"
      players={players}
    />
  );
}
