const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const sourceDir = path.resolve(__dirname, "../app/carb-calculator");
const cache = new Map();
function loadTypeScript(name) {
  if (cache.has(name)) return cache.get(name).exports;
  const filename = path.join(sourceDir, `${name}.ts`);
  const source = fs.readFileSync(filename, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = new Module(filename, module);
  cache.set(name, mod);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(sourceDir);
  mod.require = (id) => id === "./nutrition-config" ? loadTypeScript("nutrition-config") : require(id);
  mod._compile(code, filename);
  return mod.exports;
}

const { calculateCarbs, foodTotal, targetStatus, validWeight } = loadTypeScript("nutrition-calc");

test("요청한 체중별 하루 탄수화물 및 빠른 회복 예시", () => {
  assert.deepEqual([calculateCarbs(60, "moderate").dailyMin, calculateCarbs(60, "moderate").dailyMax], [300, 420]);
  assert.deepEqual([calculateCarbs(70, "light").dailyMin, calculateCarbs(70, "light").dailyMax], [210, 350]);
  assert.deepEqual([calculateCarbs(55, "high").dailyMin, calculateCarbs(55, "high").dailyMax], [385, 660]);
  assert.deepEqual([calculateCarbs(60, "moderate").recoveryMin, calculateCarbs(60, "moderate").recoveryMax], [60, 72]);
});

test("잘못된 체중은 계산하지 않는다", () => {
  for (const value of [0, 24.9, 120.1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(validWeight(value), false);
    assert.throws(() => calculateCarbs(value, "moderate"), RangeError);
  }
  assert.equal(validWeight(25), true);
  assert.equal(validWeight(120), true);
});

test("음식 추가·삭제와 제품 영양표시 합산", () => {
  assert.equal(foodTotal({ rice: 2, banana: 1 }), 163);
  assert.equal(foodTotal({ rice: 1, banana: 1 }), 95);
  assert.equal(foodTotal({ "sports-drink": 1 }), 0);
  assert.equal(foodTotal({ "sports-drink": 1 }, { "sports-drink": 25 }), 25);
  assert.equal(foodTotal({ rice: -1 }), 0);
});

test("참고 범위 상태", () => {
  assert.equal(targetStatus(210, 300, 420).kind, "below");
  assert.equal(targetStatus(340, 300, 420).kind, "within");
  assert.equal(targetStatus(500, 300, 420).kind, "above");
});
