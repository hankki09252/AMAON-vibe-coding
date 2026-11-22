/** 교육용 참고값. 운영자는 이 파일에서 기준·음식·출처 링크를 관리합니다. */
export const dailyCarbohydrateRanges = {
  light: { label: "휴식·가벼운 날", description: "회복 위주 또는 가벼운 기술훈련", min: 3, max: 5 },
  moderate: { label: "보통 훈련", description: "일반적인 팀훈련·웨이트·기술훈련", min: 5, max: 7 },
  high: { label: "강도 높은 훈련", description: "훈련량이 많고 체력 소모가 큰 날", min: 7, max: 12 },
  extreme: { label: "장시간·초고강도", description: "4시간 이상 강한 훈련이나 대회 일정", min: 10, max: 12 },
} as const;

export type TrainingIntensity = keyof typeof dailyCarbohydrateRanges;
export type LivingSituation = "commute" | "dorm" | "travel";
export const preExerciseRange = { min: 1, max: 4, hoursBeforeMin: 1, hoursBeforeMax: 4 } as const;
export const duringExerciseRange = { startHours: 1, minPerHour: 30, maxPerHour: 60, advancedStartHours: 2.5, advancedMaxPerHour: 90 } as const;
export const recoveryRange = { min: 1, max: 1.2 } as const;

export const livingSituations: Record<LivingSituation, { label: string; note: string }> = {
  commute: { label: "통학", note: "집에서 준비한 식사와 휴대하기 쉬운 간식을 함께 고려하세요." },
  dorm: { label: "기숙사", note: "보관·조리 편의와 기숙사 식단을 함께 고려하세요." },
  travel: { label: "원정·대회", note: "이동 중 휴대성과 현장에서 구할 수 있는 음식을 고려하세요." },
};

export type Food = {
  id: string;
  name: string;
  serving: string;
  carbLabel: string;
  carbs: number | null;
  tip: string;
  group: "daily" | "near";
  situations: LivingSituation[];
  photo: { sheet: "a" | "b"; column: number; row: number };
  scores: { carry: number; store: number; prep: number; before: number; after: number };
};

export const foodDatabase: Food[] = [
  { id: "rice", name: "흰쌀밥", serving: "1공기 약 200~210g", carbLabel: "약 65~70g", carbs: 68, tip: "평소 식사·훈련 전 식사", group: "daily", situations: ["commute", "dorm"], photo: { sheet: "a", column: 0, row: 0 }, scores: { carry: 2, store: 2, prep: 3, before: 4, after: 4 } },
  { id: "banana", name: "바나나", serving: "중간 크기 1개", carbLabel: "약 25~30g", carbs: 27, tip: "운동 가까이·이동 중", group: "near", situations: ["commute", "dorm", "travel"], photo: { sheet: "a", column: 1, row: 0 }, scores: { carry: 5, store: 3, prep: 5, before: 5, after: 4 } },
  { id: "sweet-potato", name: "고구마", serving: "약 150g", carbLabel: "약 30~35g", carbs: 33, tip: "평소 간식·훈련 전 여유가 있을 때", group: "daily", situations: ["commute", "dorm"], photo: { sheet: "a", column: 2, row: 0 }, scores: { carry: 4, store: 3, prep: 3, before: 3, after: 4 } },
  { id: "potato", name: "감자", serving: "약 200g", carbLabel: "약 35~40g", carbs: 38, tip: "식사와 함께", group: "daily", situations: ["commute"], photo: { sheet: "a", column: 3, row: 0 }, scores: { carry: 2, store: 3, prep: 2, before: 3, after: 4 } },
  { id: "bagel", name: "베이글", serving: "1개", carbLabel: "약 45~55g", carbs: 50, tip: "운동 전 여유가 있을 때·원정", group: "near", situations: ["dorm", "travel"], photo: { sheet: "a", column: 0, row: 1 }, scores: { carry: 5, store: 4, prep: 5, before: 4, after: 4 } },
  { id: "white-bread", name: "식빵", serving: "2장", carbLabel: "약 25~30g", carbs: 28, tip: "간편한 운동 전 간식", group: "near", situations: ["dorm", "travel"], photo: { sheet: "a", column: 1, row: 1 }, scores: { carry: 4, store: 4, prep: 5, before: 4, after: 4 } },
  { id: "oats", name: "오트밀", serving: "마른 오트밀 약 50g", carbLabel: "약 30g", carbs: 30, tip: "평소 아침 식사", group: "daily", situations: ["dorm"], photo: { sheet: "a", column: 2, row: 1 }, scores: { carry: 4, store: 5, prep: 3, before: 2, after: 4 } },
  { id: "rice-ball", name: "주먹밥", serving: "약 100~120g", carbLabel: "약 35~45g", carbs: 40, tip: "훈련 후·이동 중", group: "near", situations: ["commute", "travel"], photo: { sheet: "a", column: 3, row: 1 }, scores: { carry: 5, store: 2, prep: 3, before: 4, after: 5 } },
  { id: "pasta", name: "파스타", serving: "익힌 면 약 180g", carbLabel: "약 50~60g", carbs: 55, tip: "평소 식사", group: "daily", situations: ["commute"], photo: { sheet: "b", column: 0, row: 0 }, scores: { carry: 2, store: 2, prep: 2, before: 3, after: 4 } },
  { id: "whole-bread", name: "통곡물빵", serving: "2장", carbLabel: "약 25~35g", carbs: 30, tip: "평소 간식", group: "daily", situations: ["commute", "dorm"], photo: { sheet: "b", column: 1, row: 0 }, scores: { carry: 4, store: 4, prep: 5, before: 2, after: 4 } },
  { id: "sports-drink", name: "스포츠음료", serving: "500~600mL", carbLabel: "제품 영양표시 확인", carbs: null, tip: "장시간 운동 중 필요에 따라", group: "near", situations: ["travel"], photo: { sheet: "b", column: 0, row: 1 }, scores: { carry: 5, store: 5, prep: 5, before: 3, after: 3 } },
  { id: "chocolate-milk", name: "초코우유", serving: "200~300mL", carbLabel: "제품 영양표시 확인", carbs: null, tip: "훈련 후 간편 간식", group: "near", situations: ["dorm"], photo: { sheet: "b", column: 1, row: 1 }, scores: { carry: 3, store: 2, prep: 5, before: 2, after: 4 } },
];

export const exampleMeals = [
  { label: "아침", foods: ["rice", "banana"] },
  { label: "점심", foods: ["rice"] },
  { label: "훈련 전", foods: ["sweet-potato"] },
  { label: "훈련 후", foods: ["rice-ball", "chocolate-milk"] },
  { label: "저녁", foods: ["rice"] },
] as const;

export const disclaimerText = {
  main: "본 계산기는 스포츠영양학의 일반적인 기준을 이해하기 쉽게 제공하는 교육용 참고 도구입니다. 개인의 연령, 성장 상태, 성별, 체격, 훈련량, 경기 일정, 위장 상태, 질환 및 실제 총에너지 섭취량에 따라 필요량은 달라질 수 있습니다. 본 계산 결과는 의료적 진단이나 개인 맞춤 영양 처방을 대신하지 않습니다. 성장기 선수 또는 특별한 건강 문제가 있는 경우 의료진이나 스포츠영양 전문가와 상담하세요.",
  food: "음식별 탄수화물 수치는 대표적인 중량을 기준으로 한 참고값입니다. 품종, 크기, 제품, 제조사, 조리법에 따라 실제 영양성분은 달라질 수 있으므로 제품 영양정보를 우선 확인하세요.",
} as const;

export const nutritionSources = [
  { label: "IOC 스포츠영양 자료 · 운동량별 탄수화물과 섭취 시점", url: "https://stillmed.olympics.com/media/Document%20Library/OlympicOrg/IOC/Who-We-Are/Commissions/Medical-and-Scientific-Commission/Encyclopaedia/2014_Maughan_002.pdf" },
  { label: "IOC 스포츠영양 합의문 · 성장기 선수와 충분한 에너지 섭취", url: "https://stillmed.olympics.com/media/Documents/Athletes/Medical-Scientific/Consensus-Statements/2010_sports-nutrition.pdf" },
  { label: "미국소아과학회 · 성장기 선수의 탄수화물", url: "https://www.healthychildren.org/English/ages-stages/teen/nutrition/Pages/Carbohydrates-for-Energy.aspx" },
  { label: "USDA FoodData Central · 음식 영양성분 데이터베이스", url: "https://fdc.nal.usda.gov/" },
] as const;

export const sweetPotatoProductUrl = "https://slit.to/@hankki09252/objet/o20261031bd2cc4da6e7a16f6";
