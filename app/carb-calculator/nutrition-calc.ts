import { dailyCarbohydrateRanges, foodDatabase, preExerciseRange, recoveryRange, type TrainingIntensity } from "./nutrition-config";

export function validWeight(value: number): value is number {
  return Number.isFinite(value) && value >= 25 && value <= 120;
}

export function calculateCarbs(weight: number, intensity: TrainingIntensity) {
  if (!validWeight(weight)) throw new RangeError("체중은 25~120kg 사이로 입력하세요.");
  const range = dailyCarbohydrateRanges[intensity];
  return {
    dailyMin: Math.round(weight * range.min),
    dailyMax: Math.round(weight * range.max),
    preMin: Math.round(weight * preExerciseRange.min),
    preMax: Math.round(weight * preExerciseRange.max),
    recoveryMin: Math.round(weight * recoveryRange.min),
    recoveryMax: Math.round(weight * recoveryRange.max),
  };
}

export function foodTotal(counts: Record<string, number>, labelCarbs: Record<string, number> = {}) {
  return foodDatabase.reduce((sum, food) => {
    const quantity = counts[food.id] ?? 0;
    if (!Number.isInteger(quantity) || quantity < 0) return sum;
    const carbs = food.carbs ?? labelCarbs[food.id];
    return sum + (Number.isFinite(carbs) && carbs >= 0 ? carbs * quantity : 0);
  }, 0);
}

export function targetStatus(total: number, min: number, max: number) {
  if (total < min) return { kind: "below" as const, text: `추가 섭취를 검토할 수 있어요 · 참고 범위까지 ${Math.round(min - total)}~${Math.round(max - total)}g` };
  if (total <= max) return { kind: "within" as const, text: "오늘 참고 범위 안에 있어요" };
  return { kind: "above" as const, text: "참고 범위를 넘었어요. 하루 전체 식사와 훈련량을 함께 살펴보세요." };
}
