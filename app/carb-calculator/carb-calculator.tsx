"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateCarbs, foodTotal, targetStatus, validWeight } from "./nutrition-calc";
import {
  dailyCarbohydrateRanges, duringExerciseRange, exampleMeals, foodDatabase, livingSituations,
  disclaimerText, nutritionSources, sweetPotatoProductUrl,
  type Food, type LivingSituation, type TrainingIntensity,
} from "./nutrition-config";
import styles from "./calculator.module.css";

type Calculation = { weight: number; intensity: TrainingIntensity; hours: number; sessions: number; living: LivingSituation };
const durations = Array.from({ length: 12 }, (_, index) => (index + 1) / 2);
const foodById = Object.fromEntries(foodDatabase.map((food) => [food.id, food])) as Record<string, Food>;
const intensityOptions = Object.entries(dailyCarbohydrateRanges) as [TrainingIntensity, (typeof dailyCarbohydrateRanges)[TrainingIntensity]][];

function FoodPhoto({ food }: { food: Food }) {
  const columns = food.photo.sheet === "a" ? 4 : 2;
  const x = food.photo.column * 100 / (columns - 1);
  const y = food.photo.row * 100;
  return <div className={styles.foodPhoto} role="img" aria-label={`${food.name} 참고 이미지`} style={{ backgroundImage: `url(/nutrition/food-sheet-${food.photo.sheet}.webp)`, backgroundSize: `${columns * 100}% auto`, backgroundPosition: `${x}% ${y}%` }} />;
}

function Score({ label, value }: { label: string; value: number }) {
  return <span className={styles.score} aria-label={`${label} 5점 중 ${value}점`}><span>{label}</span><span aria-hidden="true">{"★".repeat(value)}{"☆".repeat(5 - value)}</span></span>;
}

function makeShareCard(calculation: Calculation, dailyMin: number, dailyMax: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("이미지 생성 기능을 사용할 수 없습니다."));
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ff6a00";
  ctx.fillRect(0, 0, 1080, 18);
  ctx.font = "900 46px Arial, sans-serif";
  ctx.fillText("AMAON  /  오늘의 선수 연료", 72, 130);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 76px Arial, sans-serif";
  ctx.fillText("탄수화물 참고 범위", 72, 305);
  ctx.fillStyle = "#ff6a00";
  ctx.font = "900 124px Arial, sans-serif";
  ctx.fillText(`${dailyMin}–${dailyMax}g`, 72, 480);
  ctx.fillStyle = "#aaa";
  ctx.font = "42px Arial, sans-serif";
  ctx.fillText("하루 음식에 포함된 탄수화물 총량", 72, 555);
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillText(`체중  ${calculation.weight}kg`, 72, 715);
  ctx.fillText(`훈련  ${dailyCarbohydrateRanges[calculation.intensity].label}`, 72, 795);
  ctx.fillText(`훈련 시간  ${calculation.hours}시간`, 72, 875);
  ctx.fillText("운동 전  소화하기 편한 탄수화물", 72, 985);
  ctx.fillText("운동 후  탄수화물 + 단백질", 72, 1065);
  ctx.fillStyle = "#777";
  ctx.font = "30px Arial, sans-serif";
  ctx.fillText("교육용 참고 도구 · 개인 영양 처방이 아닙니다.", 72, 1210);
  ctx.fillStyle = "#ff6a00";
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillText("아마온 by 한끼방패  ·  amaon.kr", 72, 1280);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("이미지 저장에 실패했습니다.")), "image/png"));
}

function buildExample(dailyMin: number, dailyMax: number) {
  const meals = exampleMeals.map((meal) => ({ label: meal.label, foods: [...meal.foods] as string[] }));
  let total = meals.reduce((sum, meal) => sum + meal.foods.reduce((mealSum, id) => mealSum + (foodById[id]?.carbs ?? 0), 0), 0);
  while (total > dailyMax) {
    const candidate = meals.flatMap((meal, mealIndex) => meal.foods.map((id, foodIndex) => ({ mealIndex, foodIndex, carbs: foodById[id]?.carbs ?? 0 })))
      .filter(({ carbs }) => carbs > 0)
      .sort((a, b) => b.carbs - a.carbs)[0];
    if (!candidate) break;
    meals[candidate.mealIndex].foods.splice(candidate.foodIndex, 1);
    total -= candidate.carbs;
  }
  const additions = [
    { meal: 0, food: "oats" }, { meal: 1, food: "pasta" }, { meal: 4, food: "potato" },
    { meal: 3, food: "bagel" }, { meal: 2, food: "banana" }, { meal: 4, food: "rice" },
  ];
  let index = 0;
  while (total < dailyMin && index < 80) {
    const addition = additions[index % additions.length];
    const carbs = foodById[addition.food].carbs ?? 0;
    if (total + carbs <= dailyMax) {
      meals[addition.meal].foods.push(addition.food);
      total += carbs;
    }
    index += 1;
  }
  return { meals: meals.filter((meal) => meal.foods.length > 0), total, status: targetStatus(total, dailyMin, dailyMax) };
}

export default function CarbCalculator() {
  const formRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const [weightInput, setWeightInput] = useState("60");
  const [intensity, setIntensity] = useState<TrainingIntensity>("moderate");
  const [hours, setHours] = useState(1.5);
  const [sessions, setSessions] = useState(1);
  const [living, setLiving] = useState<LivingSituation>("commute");
  const [error, setError] = useState("");
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [labelInput, setLabelInput] = useState<Record<string, string>>({});
  const [labelCarbs, setLabelCarbs] = useState<Record<string, number>>({});
  const [foodGroup, setFoodGroup] = useState<"all" | "daily" | "near">("all");
  const [actionNotice, setActionNotice] = useState("");

  const numbers = calculation ? calculateCarbs(calculation.weight, calculation.intensity) : null;
  const eaten = foodTotal(counts, labelCarbs);
  const status = numbers ? targetStatus(eaten, numbers.dailyMin, numbers.dailyMax) : null;
  const progress = numbers ? Math.min(100, eaten / numbers.dailyMax * 100) : 0;
  const targetStart = numbers ? numbers.dailyMin / numbers.dailyMax * 100 : 0;
  const selectedFoods = foodDatabase.filter((food) => (counts[food.id] ?? 0) > 0);

  const example = numbers ? buildExample(numbers.dailyMin, numbers.dailyMax) : null;

  const filteredFoods = foodDatabase.filter((food) => foodGroup === "all" || food.group === foodGroup)
    .sort((a, b) => Number(b.situations.includes(calculation?.living ?? living)) - Number(a.situations.includes(calculation?.living ?? living)));

  function calculate() {
    const weight = Number(weightInput);
    if (!weightInput.trim() || !validWeight(weight)) {
      setError("체중은 25~120kg 사이의 숫자로 입력해 주세요.");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError("");
    setCalculation({ weight, intensity, hours, sessions, living });
    setCounts({});
    setLabelCarbs({});
    setActionNotice("");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function changeCount(id: string, delta: number) {
    setCounts((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));
  }

  function addLabelFood(food: Food) {
    const value = Number(labelInput[food.id]);
    if (!Number.isFinite(value) || value <= 0 || value > 200) {
      setActionNotice(`${food.name}의 영양표시 탄수화물량을 1~200g으로 입력해 주세요.`);
      return;
    }
    setLabelCarbs((current) => ({ ...current, [food.id]: value }));
    changeCount(food.id, 1);
    setActionNotice("");
  }

  async function saveCard(share: boolean) {
    if (!calculation || !numbers) return;
    try {
      const blob = await makeShareCard(calculation, numbers.dailyMin, numbers.dailyMax);
      const file = new File([blob], "amaon-carb-card.png", { type: "image/png" });
      if (share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "AMAON 오늘의 선수 연료" }); }
        catch (cause) { if ((cause as Error).name !== "AbortError") throw cause; }
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setActionNotice(share ? "이미지로 저장했습니다. 사진첩에서 공유해 주세요." : "공유 카드를 이미지로 저장했습니다.");
    } catch {
      setActionNotice("이미지 카드 생성에 실패했습니다. 브라우저에서 다시 시도해 주세요.");
    }
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="아마온 홈으로"><Image src="/amaon-emblem-2026.png" width={52} height={52} alt="아마온 엠블럼" priority /><span><strong>AMAON</strong><small>by 한끼방패</small></span></Link>
      <nav aria-label="계산기 메뉴"><Link href="/">홈</Link><a href="#calculator">계산하기</a><a href="#food">음식 보기</a></nav>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>AMAON PLAYER FUEL · NUTRITION TOOL</p>
        <p className={styles.hook}>단백질만 챙기고 있나요?</p>
        <h1>오늘 우리 선수에게 필요한<br /><em>탄수화물은 얼마나 될까요?</em></h1>
        <p>체중과 오늘의 훈련량만 입력하면 하루 탄수화물 참고 범위부터 실제 음식 예시까지 계산해드립니다.</p>
        <button type="button" className={styles.primary} onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>30초 만에 계산하기 <span aria-hidden="true">↗</span></button>
      </div>
      <div className={styles.heroVisual} aria-hidden="true"><span>01 / FUEL THE PLAYER</span><strong>탄수화물은<br />선택이 아니라<br /><i>전략입니다.</i></strong><small>ENERGY · FOCUS · RECOVERY</small></div>
    </section>

    <section className={styles.section} id="calculator" ref={formRef}>
      <div className={styles.sectionTitle}><p className={styles.eyebrow}>01 / INPUT</p><h2>오늘의 훈련을 알려주세요.</h2><p>체중 감량 목표 없이, 오늘 활동에 맞는 연료 범위를 살펴봅니다.</p></div>
      <div className={styles.formGrid}>
        <div className={styles.inputCard}>
          <label htmlFor="carb-weight">선수 체중</label>
          <div className={styles.weightField}><input id="carb-weight" type="number" inputMode="decimal" min="25" max="120" step="0.1" value={weightInput} onChange={(event) => setWeightInput(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "carb-weight-error" : undefined} /><span>kg</span></div>
          <small>25~120kg · 성장기 선수도 사용할 수 있습니다.</small>
          {error ? <p id="carb-weight-error" className={styles.error} role="alert">{error}</p> : null}
        </div>
        <fieldset className={styles.intensity}><legend>오늘 훈련 강도</legend><div className={styles.choiceGrid}>{intensityOptions.map(([key, option]) => <label key={key} className={intensity === key ? styles.choiceActive : styles.choice}><input type="radio" name="intensity" value={key} checked={intensity === key} onChange={() => setIntensity(key)} /><strong>{option.label}</strong><small>{option.description}</small><b>{option.min}~{option.max}g/kg</b></label>)}</div></fieldset>
        <div className={styles.inputCard}><label htmlFor="carb-hours">훈련 시간</label><select id="carb-hours" value={hours} onChange={(event) => setHours(Number(event.target.value))}>{durations.map((duration) => <option key={duration} value={duration}>{duration}시간</option>)}</select><small>30분 단위 · 총 0.5~6시간</small></div>
        <div className={styles.inputCard}><label htmlFor="carb-sessions">오늘 훈련 횟수</label><select id="carb-sessions" value={sessions} onChange={(event) => setSessions(Number(event.target.value))}><option value="1">1회</option><option value="2">2회 이상</option></select>{sessions > 1 ? <small className={styles.orangeText}>첫 번째 훈련 직후 빠른 회복이 더 중요합니다.</small> : <small>다음 훈련까지의 간격에 따라 회복 전략이 달라집니다.</small>}</div>
        <div className={styles.inputCard}><label htmlFor="carb-living">선수 생활환경</label><select id="carb-living" value={living} onChange={(event) => setLiving(event.target.value as LivingSituation)}>{Object.entries(livingSituations).map(([key, value]) => <option key={key} value={key}>{value.label} 선수</option>)}</select><small>음식 카드 추천에 반영합니다.</small></div>
      </div>
      <button type="button" className={styles.calculateButton} onClick={calculate}>내 탄수화물 계산하기 <span aria-hidden="true">→</span></button>
    </section>

    {calculation && numbers && status && example ? <section className={styles.results} ref={resultRef} aria-live="polite">
      <div className={styles.resultHero}>
        <p className={styles.eyebrow}>02 / YOUR DAILY FUEL</p><span className={styles.resultContext}>체중 {calculation.weight}kg · {dailyCarbohydrateRanges[calculation.intensity].label} · {calculation.hours}시간</span>
        <h2>오늘의 탄수화물 <em>참고 범위</em></h2><div className={styles.bigNumber}>{numbers.dailyMin}<span>~</span>{numbers.dailyMax}<small>g / day</small></div>
        <p className={styles.emphasis}>이 수치는 음식의 무게가 아니라 하루 동안 음식에서 섭취하는 <strong>탄수화물의 총량</strong>입니다.</p>
        <div className={styles.keywordRow}><span>⚡ 에너지</span><span>🧠 집중력</span><span>🔋 글리코겐</span><span>🔄 회복</span></div>
        <div className={styles.gauge} aria-label={`오늘 기록 ${eaten}g, 참고 범위 ${numbers.dailyMin}~${numbers.dailyMax}g`}><span className={styles.targetBand} style={{ left: `${targetStart}%` }} /><span className={styles.progress} style={{ width: `${progress}%` }} /></div>
        <div className={styles.gaugeLabels}><span>0g</span><span>{numbers.dailyMin}g</span><span>{numbers.dailyMax}g</span></div>
        <p className={styles.rangeNote}>훈련 강도는 간단히 분류한 것이므로, 특히 고강도·장시간 훈련의 상한이 모든 선수에게 필요한 양을 뜻하지는 않습니다. 성장과 하루 전체 식사를 함께 고려하세요.</p>
      </div>

      <div className={styles.section} id="timing"><div className={styles.sectionTitle}><p className={styles.eyebrow}>03 / WHEN TO EAT</p><h2>언제 챙기면 좋을까요?</h2></div>
        <div className={styles.timingGrid}>
          <article><small>BEFORE / 운동 전</small><strong>{numbers.preMin}~{numbers.preMax}g</strong><p>운동 1~4시간 전의 폭넓은 참고 범위(1~4g/kg)입니다. <b>한 번에 모두 먹으라는 뜻이 아닙니다.</b></p><ul><li>1시간 전: 가볍고 소화 쉬운 탄수화물</li><li>2~4시간 전: 조금 더 충분한 식사</li></ul><p className={styles.cardNote}>운동까지 남은 시간, 강도, 평소 소화 능력에 따라 조절하세요.</p></article>
          {calculation.hours >= duringExerciseRange.startHours ? <article><small>DURING / 운동 중</small><strong>{duringExerciseRange.minPerHour}~{duringExerciseRange.maxPerHour}g <i>/ hour</i></strong><p>장시간 훈련에서 검토하는 일반적인 참고 범위입니다. 종목, 강도, 위장 적응 상태를 고려하세요.</p>{calculation.hours >= duringExerciseRange.advancedStartHours ? <p className={styles.cardNote}>최대 90g/h는 아주 긴 운동에서 훈련된 선수가 전문가 조언과 위장 적응을 거쳐 사용하는 고급 전략입니다. 성장기 선수 모두에게 권하는 값이 아닙니다.</p> : null}</article> : <article><small>DURING / 운동 중</small><strong>별도 수치 없음</strong><p>짧은 훈련은 운동 중 탄수화물 수치를 일괄 적용하지 않습니다. 평소 식사와 수분 섭취를 먼저 살펴보세요.</p></article>}
          <article><small>AFTER / 운동 후</small><strong>{numbers.recoveryMin}~{numbers.recoveryMax}g <i>/ hour</i></strong><p>하루 2회 훈련, 다음 훈련까지 시간이 짧거나 대회가 이어질 때의 <b>빠른 회복 참고량</b>입니다.</p><p className={styles.cardNote}>{calculation.sessions > 1 ? "첫 번째 훈련 후 회복 식사와 간식을 미리 준비해 보세요." : "다음 훈련까지 시간이 충분하다면 일반적인 균형 식사로도 회복할 수 있습니다."}</p></article>
        </div>
      </div>

      <div className={styles.section} id="food"><div className={styles.sectionTitle}><p className={styles.eyebrow}>04 / REAL FOOD</p><h2>실제 음식으로는<br />어느 정도일까요?</h2><p>{livingSituations[calculation.living].note}</p></div>
        <div className={styles.foodNotice}>{disclaimerText.food}</div>
        <div className={styles.filterRow} aria-label="음식 분류"><button type="button" aria-pressed={foodGroup === "all"} onClick={() => setFoodGroup("all")}>모두 보기</button><button type="button" aria-pressed={foodGroup === "daily"} onClick={() => setFoodGroup("daily")}>평소 기본 탄수화물</button><button type="button" aria-pressed={foodGroup === "near"} onClick={() => setFoodGroup("near")}>운동 가까이</button></div>
        <p className={styles.filterDescription}>평소 식사와 운동 가까운 시간의 선택지는 소화 부담·휴대성·섭취 편의성을 고려한 예시입니다. 개인차가 있습니다.</p>
        <div className={styles.foodGrid}>{filteredFoods.map((food) => <article className={styles.foodCard} key={food.id}><FoodPhoto food={food} /><div className={styles.foodCopy}><small>{food.situations.includes(calculation.living) ? `${livingSituations[calculation.living].label} 추천 · ` : ""}{food.group === "daily" ? "EVERYDAY FUEL" : "AROUND TRAINING"}</small><h3>{food.name}</h3><p>{food.serving}</p><strong>{food.carbLabel}</strong><span className={styles.foodTip}>{food.tip}</span><details><summary>편의성 보기</summary><div><Score label="휴대" value={food.scores.carry} /><Score label="보관" value={food.scores.store} /><Score label="조리" value={food.scores.prep} /><Score label="운동 전" value={food.scores.before} /><Score label="운동 후" value={food.scores.after} /></div></details>{food.carbs === null ? <div className={styles.labelEntry}><label htmlFor={`food-${food.id}`}>영양표시의 탄수화물(g)</label><div><input id={`food-${food.id}`} type="number" inputMode="decimal" min="1" max="200" placeholder="예: 25" value={labelInput[food.id] ?? ""} onChange={(event) => setLabelInput((current) => ({ ...current, [food.id]: event.target.value }))} /><button type="button" onClick={() => addLabelFood(food)}>입력해 추가</button></div></div> : <button type="button" className={styles.addFood} onClick={() => changeCount(food.id, 1)}>+ 오늘 먹은 음식에 추가</button>}</div></article>)}</div>
        {actionNotice.includes("영양표시") ? <p className={styles.actionNotice} role="status">{actionNotice}</p> : null}
        <p className={styles.productPrinciple}>좋은 음식도 먹지 못하면 의미가 없습니다. <strong>영양 + 타이밍 + 편의성 + 반복 가능성</strong></p>
      </div>

      <div className={styles.section}><div className={styles.sectionTitle}><p className={styles.eyebrow}>05 / YOUR FOOD LOG</p><h2>오늘 먹은 음식 살펴보기</h2><p>정확한 섭취 기록이 아닌, 음식의 탄수화물량을 이해하는 간단한 도구입니다.</p></div>
        <div className={styles.logPanel}><div><small>오늘 섭취 예상량</small><strong>{Math.round(eaten)}<em>g</em></strong><span>참고 범위 {numbers.dailyMin}~{numbers.dailyMax}g</span></div><p className={`${styles.status} ${styles[status.kind]}`}>{status.text}</p></div>
        {selectedFoods.length ? <ul className={styles.selectedList}>{selectedFoods.map((food) => <li key={food.id}><span>{food.name} <small>× {counts[food.id]}</small></span><span>약 {Math.round((food.carbs ?? labelCarbs[food.id] ?? 0) * counts[food.id])}g</span><button type="button" onClick={() => changeCount(food.id, -1)} aria-label={`${food.name} 1회분 빼기`}>−</button></li>)}</ul> : <p className={styles.emptyLog}>위 음식 카드를 눌러 오늘 먹은 음식을 더해 보세요.</p>}
        <p className={styles.smallNote}>선택한 음식만 합산합니다. 다른 음식의 탄수화물과 실제 먹은 양은 반영되지 않으므로 이 합계를 하루 전체 섭취량으로 해석하지 마세요.</p>
      </div>

      <div className={styles.section}><div className={styles.sectionTitle}><p className={styles.eyebrow}>06 / EXAMPLE DAY</p><h2>하루 식사 예시 조합</h2><p>이 정도 조합이면 탄수화물 참고 범위를 이해하는 데 도움이 됩니다. 반드시 그대로 먹어야 한다는 뜻은 아닙니다.</p></div>
        <div className={styles.mealGrid}>{example.meals.map((meal) => <article key={meal.label}><small>{meal.label}</small><ul>{meal.foods.map((id, index) => <li key={`${id}-${index}`}><span>{foodById[id].name} 1회분</span><span>{foodById[id].carbs === null ? "영양표시 확인" : `약 ${foodById[id].carbs}g`}</span></li>)}</ul></article>)}</div>
        <div className={styles.exampleTotal}><span>예시 음식의 탄수화물 합계 <strong>약 {example.total}g</strong></span><small>{example.status.text} · 초코우유 등 제품별 값은 합계에서 제외</small></div>
      </div>

      <div className={styles.section}><div className={styles.shareBox}><div><p className={styles.eyebrow}>SHARE YOUR FUEL</p><h2>오늘의 선수 연료를<br />한 장으로 공유하세요.</h2><p>체중과 훈련량, 참고 범위가 들어간 이미지 카드입니다. 음식 기록과 개인정보는 포함하지 않습니다.</p></div><div className={styles.shareActions}><button type="button" onClick={() => void saveCard(false)}>이미지 저장</button><button type="button" onClick={() => void saveCard(true)}>공유하기</button></div></div>{actionNotice && !actionNotice.includes("영양표시") ? <p className={styles.actionNotice} role="status">{actionNotice}</p> : null}</div>

      <div className={styles.section}><div className={styles.productBox}><Image src="/sweet-potato-product-cutout.png" alt="간편 고구마 제품" width={180} height={180} /><div><p className={styles.eyebrow}>PRACTICAL OPTION · 간편 고구마</p><h2>학교·기숙사·원정에서<br />간편하게 챙기는 선택지</h2><p>여러 탄수화물 음식 중 하나로, 제품별 중량과 영양표시를 확인하세요.</p><a href={sweetPotatoProductUrl} target="_blank" rel="noopener noreferrer">제품 보기 ↗</a></div></div></div>

      <div className={styles.section}><div className={styles.finalCta}><h2>계산만 하지 말고<br />오늘 식사에 바로 적용해보세요.</h2><div><a href="#sources">아마온 선수 영양 더 보기</a><button type="button" onClick={() => window.print()}>실전 가이드 PDF로 저장</button><a href={sweetPotatoProductUrl} target="_blank" rel="noopener noreferrer">간편 탄수화물 보기 ↗</a></div></div></div>
    </section> : null}

    <section className={styles.disclaimer}><p className={styles.eyebrow}>PLEASE READ</p><h2>교육용 참고 도구입니다.</h2><p>{disclaimerText.main}</p></section>
    <section className={styles.sources} id="sources"><p className={styles.eyebrow}>SPORTS NUTRITION REFERENCES</p><h2>스포츠영양학 기준 참고</h2><p>운영자는 <code>nutrition-config.ts</code>에서 기준·음식·출처 링크를 수정할 수 있습니다. 화면의 범위는 여러 기준을 이해하기 쉽게 묶은 참고값입니다.</p><ul>{nutritionSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul></section>
    <footer className={styles.footer}><span>아마온 by 한끼방패 · 선수의 몸은 훈련만으로 만들어지지 않습니다.</span><Link href="/">아마온 홈 →</Link></footer>
  </main>;
}
