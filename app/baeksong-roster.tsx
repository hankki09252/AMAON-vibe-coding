"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "baeksong-202001000039", number: "미정", name: "김주헌", position: "투수", grade: "3학년", height: 184, weight: 95, batsThrows: "우투우타" },
  { id: "baeksong-201805000840", number: "1", name: "장노아", position: "투수", grade: "3학년", height: 182, weight: 80, batsThrows: "우투우타" },
  { id: "baeksong-202212000696", number: "10", name: "용태익", position: "투수", grade: "3학년", height: 186, weight: 90, batsThrows: "우투우타" },
  { id: "baeksong-201806001830", number: "11", name: "윤준수", position: "투수", grade: "3학년", height: 183, weight: 85, batsThrows: "우투우타" },
  { id: "baeksong-201803001007", number: "11", name: "주지훈", position: "투수", grade: "3학년", height: 184, weight: 86, batsThrows: "좌투좌타" },
  { id: "baeksong-201802000837", number: "12", name: "김준민", position: "투수", grade: "3학년", height: 178, weight: 75, batsThrows: "우투우타" },
  { id: "baeksong-202007000777", number: "12", name: "이강민", position: "투수", grade: "3학년", height: 183, weight: 83, batsThrows: "우투우타" },
  { id: "baeksong-201708000563", number: "15", name: "이태현", position: "투수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "baeksong-202102001908", number: "18", name: "송민우", position: "투수", grade: "3학년", height: 185, weight: 83, batsThrows: "우투좌타" },
  { id: "baeksong-201804002988", number: "19", name: "노준서", position: "투수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투우타" },
  { id: "baeksong-201806001378", number: "19", name: "윤재효", position: "투수", grade: "3학년", height: 182, weight: 72, batsThrows: "우투우타" },
  { id: "baeksong-202104001117", number: "21", name: "장재형", position: "투수", grade: "2학년", height: 185, weight: 80, batsThrows: "우투우타" },
  { id: "baeksong-201805000580", number: "24", name: "정성조", position: "투수", grade: "3학년", height: 182, weight: 75, batsThrows: "우투좌타" },
  { id: "baeksong-202301002470", number: "33", name: "이유민", position: "투수", grade: "1학년", height: 172, weight: 67, batsThrows: "좌투좌타" },
  { id: "baeksong-202002002296", number: "44", name: "김태환", position: "투수", grade: "3학년", height: 182, weight: 85, batsThrows: "우투우타" },
  { id: "baeksong-201907002070", number: "54", name: "김승모", position: "투수", grade: "3학년", height: 184, weight: 85, batsThrows: "좌투좌타" },
  { id: "baeksong-202108000906", number: "57", name: "윤서완", position: "투수", grade: "3학년", height: 192, weight: 90, batsThrows: "우투우타" },
  { id: "baeksong-201805000836", number: "4", name: "장래이", position: "포수", grade: "3학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "baeksong-202103011964", number: "15", name: "모현민", position: "포수", grade: "2학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "baeksong-201907002081", number: "26", name: "김준모", position: "포수", grade: "2학년", height: 182, weight: 88, batsThrows: "우투우타" },
  { id: "baeksong-201704002177", number: "43", name: "정회림", position: "포수", grade: "3학년", height: 184, weight: 90, batsThrows: "우투우타" },
  { id: "baeksong-201806002621", number: "52", name: "박진", position: "포수", grade: "3학년", height: 177, weight: 75, batsThrows: "우투우타" },
  { id: "baeksong-201901002043", number: "55", name: "이현서", position: "포수", grade: "3학년", height: 177, weight: 85, batsThrows: "우투좌타" },
  { id: "baeksong-201802002142", number: "2", name: "권한준", position: "내야수", grade: "3학년", height: 177, weight: 75, batsThrows: "우투좌타" },
  { id: "baeksong-202001003061", number: "5", name: "송준혁", position: "내야수", grade: "1학년", height: 176, weight: 85, batsThrows: "우투우타" },
  { id: "baeksong-202102001139", number: "6", name: "김태윤", position: "내야수", grade: "2학년", height: 178, weight: 73, batsThrows: "우투좌타" },
  { id: "baeksong-201702004744", number: "6", name: "한성빈", position: "내야수", grade: "3학년", height: 179, weight: 75, batsThrows: "우투우타" },
  { id: "baeksong-201803004889", number: "7", name: "김연수", position: "내야수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투좌타" },
  { id: "baeksong-201703002777", number: "13", name: "김윤서", position: "내야수", grade: "3학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "baeksong-202303014683", number: "13", name: "서성준", position: "내야수", grade: "2학년", height: 182, weight: 82, batsThrows: "우투우타" },
  { id: "baeksong-202301001865", number: "14", name: "천종훈", position: "내야수", grade: "1학년", height: 173, weight: 65, batsThrows: "우투우타" },
  { id: "baeksong-201805002447", number: "17", name: "선우상윤", position: "내야수", grade: "3학년", height: 183, weight: 86, batsThrows: "우투우타" },
  { id: "baeksong-201901000969", number: "23", name: "김이안", position: "내야수", grade: "2학년", height: 182, weight: 80, batsThrows: "우투좌타" },
  { id: "baeksong-202202004633", number: "25", name: "김유겸", position: "내야수", grade: "1학년", height: 177, weight: 85, batsThrows: "우투우타" },
  { id: "baeksong-202006001127", number: "28", name: "이인준", position: "내야수", grade: "3학년", height: 185, weight: 77, batsThrows: "우투좌타" },
  { id: "baeksong-202202001821", number: "32", name: "안홍규", position: "내야수", grade: "1학년", height: 178, weight: 85, batsThrows: "우투좌타" },
  { id: "baeksong-202103011947", number: "34", name: "심하람", position: "내야수", grade: "1학년", height: 172, weight: 68, batsThrows: "우투우타" },
  { id: "baeksong-201908001917", number: "44", name: "김동욱", position: "내야수", grade: "1학년", height: 178, weight: 82, batsThrows: "우투우타" },
  { id: "baeksong-202101000838", number: "52", name: "권구빈", position: "내야수", grade: "2학년", height: 170, weight: 80, batsThrows: "우투우타" },
  { id: "baeksong-201905000541", number: "53", name: "유현", position: "내야수", grade: "3학년", height: 183, weight: 75, batsThrows: "우투우타" },
  { id: "baeksong-202103012016", number: "3", name: "조창민", position: "외야수", grade: "3학년", height: 177, weight: 80, batsThrows: "좌투좌타" },
  { id: "baeksong-202103012502", number: "3", name: "황제인", position: "외야수", grade: "2학년", height: 173, weight: 65, batsThrows: "좌투좌타" },
  { id: "baeksong-202001000413", number: "9", name: "황백두", position: "외야수", grade: "2학년", height: 185, weight: 85, batsThrows: "우투좌타" },
  { id: "baeksong-202103011975", number: "13", name: "윤찬혁", position: "외야수", grade: "3학년", height: 175, weight: 81, batsThrows: "우투우타" },
  { id: "baeksong-202301001799", number: "22", name: "이온찬", position: "외야수", grade: "1학년", height: 175, weight: 68, batsThrows: "우투우타" },
  { id: "baeksong-202201001964", number: "27", name: "서재민", position: "외야수", grade: "3학년", height: 176, weight: 74, batsThrows: "우투우타" },
  { id: "baeksong-202103006083", number: "28", name: "이주호", position: "외야수", grade: "2학년", height: 186, weight: 79, batsThrows: "좌투좌타" },
  { id: "baeksong-202204000702", number: "31", name: "홍석진", position: "외야수", grade: "2학년", height: 175, weight: 74, batsThrows: "미지정" },
  { id: "baeksong-201906000976", number: "33", name: "정지후", position: "외야수", grade: "3학년", height: 170, weight: 70, batsThrows: "좌투좌타" },
  { id: "baeksong-201601004146", number: "50", name: "이준서", position: "외야수", grade: "3학년", height: 176, weight: 78, batsThrows: "우투우타" },
  { id: "baeksong-202010003153", number: "16", name: "전재홍", position: "미지정", grade: "3학년", height: 185, weight: 83, batsThrows: "우투우타" },
];

export default function BaeksongRoster() {
  return (
    <TeamRoster
      sectionId="baeksong-roster"
      kicker="BAEKSONG HIGH SCHOOL · U-18"
      title="백송고 선수단"
      subtitle="2026 등록 선수 51명 · 감독 박종호"
      teamLabel="백송고"
      monogram="백송"
      players={players}
    />
  );
}
