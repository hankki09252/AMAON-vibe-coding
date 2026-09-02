import { createRoot } from "react-dom/client";
import VideoRankings from "../../app/video-rankings";

const players = [1, 2].map((number) => ({
  player: { id: `test-${number}`, number: String(number), name: `테스트선수${number}`, position: "투수", grade: "2학년", height: 180, weight: 75, batsThrows: "우투우타" },
  school: "테스트학교", sectionId: "test-roster",
}));

createRoot(document.getElementById("root")!).render(
  <VideoRankings players={players} visibleRegions={["경기"]} schoolRegions={{ 테스트학교: "경기" }} />,
);
