import type { Metadata } from "next";
import CarbCalculator from "./carb-calculator";

export const metadata: Metadata = {
  title: "운동선수 탄수화물 계산기 | AMAON",
  description: "체중과 훈련량을 입력하면 운동선수의 하루 탄수화물 참고 범위와 운동 전·중·후 섭취 전략, 실제 음식 예시를 확인할 수 있습니다.",
  alternates: { canonical: "https://www.amaon.kr/carb-calculator" },
  openGraph: {
    title: "AMAON 탄수화물 계산기",
    description: "내 체중과 훈련량에 맞는 하루 연료 계산",
    url: "https://www.amaon.kr/carb-calculator",
    type: "website",
  },
};

export default function CarbCalculatorPage() {
  return <CarbCalculator />;
}
