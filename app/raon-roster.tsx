"use client";

import { TeamPlayer, TeamRoster } from "./gd-roster";

export const players: TeamPlayer[] = [
  { id: "raon-201802003436", number: "0", name: "이주원", position: "투수", grade: "3학년", height: 188, weight: 90, batsThrows: "우투우타" },
  { id: "raon-201702000457", number: "1", name: "김지혁", position: "투수", grade: "3학년", height: 187, weight: 93, batsThrows: "우투우타" },
  { id: "raon-201901001434", number: "2", name: "유강빈", position: "투수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "raon-201801002417", number: "3", name: "김민제", position: "투수", grade: "2학년", height: 180, weight: 87, batsThrows: "우투우타" },
  { id: "raon-201802000488", number: "10", name: "김수빈", position: "투수", grade: "2학년", height: 184, weight: 100, batsThrows: "우투우타" },
  { id: "raon-201901001787", number: "11", name: "송민국", position: "투수", grade: "3학년", height: 188, weight: 85, batsThrows: "우투우타" },
  { id: "raon-201802005332", number: "15", name: "김주형", position: "투수", grade: "3학년", height: 177, weight: 74, batsThrows: "좌투좌타" },
  { id: "raon-201901000151", number: "18", name: "유수혁", position: "투수", grade: "3학년", height: 194, weight: 100, batsThrows: "우투우타" },
  { id: "raon-201802006507", number: "19", name: "장우진", position: "투수", grade: "3학년", height: 192, weight: 95, batsThrows: "우투우타" },
  { id: "raon-201808001428", number: "20", name: "박현서", position: "투수", grade: "2학년", height: 187, weight: 81, batsThrows: "우투우타" },
  { id: "raon-202003005370", number: "21", name: "오승현", position: "투수", grade: "2학년", height: 177, weight: 65, batsThrows: "미지정" },
  { id: "raon-202002002846", number: "21", name: "하동준", position: "투수", grade: "3학년", height: 189, weight: 81, batsThrows: "좌투좌타" },
  { id: "raon-202301003531", number: "24", name: "최지호", position: "투수", grade: "2학년", height: 180, weight: 74, batsThrows: "우투우타" },
  { id: "raon-202005000056", number: "28", name: "김태우", position: "투수", grade: "1학년", height: 180, weight: 72, batsThrows: "우투우타" },
  { id: "raon-201901001468", number: "29", name: "이윤호", position: "투수", grade: "3학년", height: 190, weight: 95, batsThrows: "좌투좌타" },
  { id: "raon-202002003741", number: "30", name: "김강민", position: "투수", grade: "1학년", height: 177, weight: 85, batsThrows: "우투우타" },
  { id: "raon-202208024245", number: "31", name: "안현우", position: "투수", grade: "2학년", height: 177, weight: 75, batsThrows: "미지정" },
  { id: "raon-201903004591", number: "32", name: "신무경", position: "투수", grade: "3학년", height: 182, weight: 93, batsThrows: "우투우타" },
  { id: "raon-201902004655", number: "32", name: "임호길", position: "투수", grade: "3학년", height: 184, weight: 85, batsThrows: "우투우타" },
  { id: "raon-201801002188", number: "33", name: "이순혁", position: "투수", grade: "3학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "raon-201901002994", number: "37", name: "임대성", position: "투수", grade: "1학년", height: 177, weight: 71, batsThrows: "좌투좌타" },
  { id: "raon-202001002539", number: "39", name: "우효준", position: "투수", grade: "2학년", height: 181, weight: 95, batsThrows: "우투우타" },
  { id: "raon-202301003866", number: "45", name: "김동준", position: "투수", grade: "2학년", height: 180, weight: 85, batsThrows: "우투우타" },
  { id: "raon-201601008899", number: "47", name: "송원영", position: "투수", grade: "3학년", height: 184, weight: 86, batsThrows: "우투우타" },
  { id: "raon-202301003169", number: "47", name: "이채성", position: "투수", grade: "2학년", height: 173, weight: 73, batsThrows: "좌투좌타" },
  { id: "raon-202308012731", number: "48", name: "최원영", position: "투수", grade: "2학년", height: 177, weight: 80, batsThrows: "우투우타" },
  { id: "raon-201802002309", number: "49", name: "조승용", position: "투수", grade: "3학년", height: 183, weight: 86, batsThrows: "좌투좌타" },
  { id: "raon-202102002876", number: "51", name: "이용준", position: "투수", grade: "2학년", height: 185, weight: 83, batsThrows: "우투우타" },
  { id: "raon-201901000670", number: "51", name: "정준모", position: "투수", grade: "3학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "raon-201802007017", number: "12", name: "오민혁", position: "포수", grade: "3학년", height: 180, weight: 87, batsThrows: "우투좌타" },
  { id: "raon-201708002349", number: "16", name: "박예훈", position: "포수", grade: "3학년", height: 176, weight: 80, batsThrows: "우투우타" },
  { id: "raon-202102001382", number: "22", name: "양재혁", position: "포수", grade: "2학년", height: 175, weight: 75, batsThrows: "우투우타" },
  { id: "raon-201802006717", number: "25", name: "조승우", position: "포수", grade: "3학년", height: 185, weight: 91, batsThrows: "우투우타" },
  { id: "raon-202001000795", number: "27", name: "최환희", position: "포수", grade: "1학년", height: 180, weight: 70, batsThrows: "우투우타" },
  { id: "raon-202201001286", number: "40", name: "진석현", position: "포수", grade: "1학년", height: 175, weight: 90, batsThrows: "우투우타" },
  { id: "raon-202008002942", number: "42", name: "정우빈", position: "포수", grade: "2학년", height: 185, weight: 90, batsThrows: "우투좌타" },
  { id: "raon-201504001459", number: "2", name: "하승민", position: "내야수", grade: "3학년", height: 170, weight: 74, batsThrows: "우투우타" },
  { id: "raon-201802006143", number: "5", name: "김성윤", position: "내야수", grade: "1학년", height: 177, weight: 74, batsThrows: "우투우타" },
  { id: "raon-202001001943", number: "5", name: "지건호", position: "내야수", grade: "2학년", height: 179, weight: 80, batsThrows: "우투우타" },
  { id: "raon-201601005771", number: "7", name: "박서호", position: "내야수", grade: "3학년", height: 181, weight: 81, batsThrows: "우투우타" },
  { id: "raon-202103000522", number: "7", name: "이원경", position: "내야수", grade: "3학년", height: 181, weight: 80, batsThrows: "우투우타" },
  { id: "raon-201807001386", number: "8", name: "김민서", position: "내야수", grade: "3학년", height: 183, weight: 89, batsThrows: "우투좌타" },
  { id: "raon-201802002104", number: "13", name: "신윤수", position: "내야수", grade: "3학년", height: 175, weight: 70, batsThrows: "우투우타" },
  { id: "raon-202005000094", number: "14", name: "최서원", position: "내야수", grade: "1학년", height: 183, weight: 68, batsThrows: "우투좌타" },
  { id: "raon-202101001035", number: "16", name: "박주원", position: "내야수", grade: "2학년", height: 186, weight: 75, batsThrows: "우투우타" },
  { id: "raon-201802002469", number: "16", name: "황연우", position: "내야수", grade: "3학년", height: 181, weight: 80, batsThrows: "우투좌타" },
  { id: "raon-202101000464", number: "23", name: "장은성", position: "내야수", grade: "2학년", height: 185, weight: 98, batsThrows: "우투우타" },
  { id: "raon-201602012988", number: "50", name: "김성우", position: "내야수", grade: "3학년", height: 172, weight: 90, batsThrows: "우투좌타" },
  { id: "raon-201904004345", number: "52", name: "유준휘", position: "내야수", grade: "3학년", height: 178, weight: 80, batsThrows: "우투우타" },
  { id: "raon-201602007149", number: "55", name: "조성철", position: "내야수", grade: "3학년", height: 189, weight: 102, batsThrows: "우투좌타" },
  { id: "raon-201906002245", number: "2", name: "김도윤", position: "외야수", grade: "3학년", height: 172, weight: 67, batsThrows: "우투우타" },
  { id: "raon-202205007292", number: "8", name: "이재문", position: "외야수", grade: "2학년", height: 178, weight: 73, batsThrows: "우투좌타" },
  { id: "raon-201804002298", number: "13", name: "허웅", position: "외야수", grade: "3학년", height: 182, weight: 89, batsThrows: "우투우타" },
  { id: "raon-201901000913", number: "17", name: "나주안", position: "외야수", grade: "3학년", height: 182, weight: 85, batsThrows: "우투우타" },
  { id: "raon-202302003204", number: "33", name: "성시원", position: "외야수", grade: "1학년", height: 180, weight: 80, batsThrows: "우투우타" },
  { id: "raon-202101001096", number: "36", name: "전우진", position: "외야수", grade: "1학년", height: 175, weight: 64, batsThrows: "좌투좌타" },
  { id: "raon-201808000646", number: "58", name: "이시헌", position: "외야수", grade: "2학년", height: 178, weight: 72, batsThrows: "우투우타" },
  { id: "raon-201803007621", number: "66", name: "정윤호", position: "외야수", grade: "3학년", height: 188, weight: 95, batsThrows: "우투우타" },
  { id: "raon-202001000371", number: "미정", name: "구현욱", position: "미지정", grade: "3학년", height: 0, weight: 0, batsThrows: "미지정" },
  { id: "raon-202203000090", number: "미정", name: "김예찬", position: "미지정", grade: "2학년", height: 0, weight: 0, batsThrows: "미지정" },
  { id: "raon-202401002553", number: "4", name: "한대형", position: "미지정", grade: "2학년", height: 175, weight: 67, batsThrows: "미지정" },
  { id: "raon-201902001246", number: "9", name: "김예담", position: "유격수", grade: "1학년", height: 179, weight: 65, batsThrows: "우투우타" },
  { id: "raon-201703012844", number: "17", name: "이주찬", position: "미지정", grade: "3학년", height: 183, weight: 87, batsThrows: "좌투좌타" },
  { id: "raon-202002004583", number: "26", name: "권민재", position: "1루수", grade: "2학년", height: 179, weight: 85, batsThrows: "우투우타" },
  { id: "raon-202302003220", number: "34", name: "양경필", position: "미지정", grade: "1학년", height: 179, weight: 87, batsThrows: "우투우타" },
  { id: "raon-202301003398", number: "35", name: "김규민", position: "미지정", grade: "1학년", height: 176, weight: 83, batsThrows: "우투우타" },
  { id: "raon-202105002045", number: "38", name: "이우찬", position: "미지정", grade: "1학년", height: 170, weight: 59, batsThrows: "미지정" },
  { id: "raon-202103012313", number: "41", name: "박리호", position: "미지정", grade: "1학년", height: 184, weight: 90, batsThrows: "미지정" },
  { id: "raon-202205117966", number: "44", name: "김예준", position: "미지정", grade: "2학년", height: 185, weight: 90, batsThrows: "우투우타" },
  { id: "raon-202101000414", number: "53", name: "백인규", position: "미지정", grade: "2학년", height: 176, weight: 74, batsThrows: "우투우타" },
];

export default function RaonRoster() {
  return (
    <TeamRoster
      sectionId="raon-roster"
      kicker="RAON HIGH SCHOOL · U-18"
      title="라온고 선수단"
      subtitle="2026 등록 선수 70명 · 감독 강봉수"
      teamLabel="라온고"
      monogram="라온"
      players={players}
    />
  );
}
