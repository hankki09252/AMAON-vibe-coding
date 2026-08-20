import * as XLSX from "xlsx";
import { apiAdmin } from "../../../api-auth";

type ImportPlayer = {
  number: string;
  name: string;
  year: number;
  position: string;
  grade: string;
  height: number;
  weight: number;
  batsThrows: string;
};

const headerAliases = {
  number: ["등번호", "배번", "번호", "背番"],
  name: ["선수명", "성명", "이름", "선수"],
  year: ["기준연도", "연도", "시즌", "년도"],
  position: ["포지션", "수비위치", "위치", "포지션명"],
  grade: ["학년", "학년명"],
  height: ["신장", "키", "신장(cm)", "키(cm)"],
  weight: ["체중", "몸무게", "체중(kg)", "몸무게(kg)"],
  batsThrows: ["투타", "투·타", "투/타", "투타유형"],
} as const;

function cleanCell(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizedHeader(value: unknown) {
  return cleanCell(value).toLowerCase().replace(/[\s_.·/()（）-]/g, "");
}

function findHeaderIndex(row: unknown[], aliases: readonly string[]) {
  const normalizedAliases = aliases.map(normalizedHeader);
  return row.findIndex((cell) => normalizedAliases.includes(normalizedHeader(cell)));
}

function numberFromCell(value: unknown) {
  const matched = cleanCell(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return matched ? Math.round(Number(matched[0])) : 0;
}

function normalizeGrade(value: unknown) {
  const text = cleanCell(value);
  if (text.includes("졸업")) return "졸업";
  const number = numberFromCell(text);
  return number >= 1 && number <= 3 ? `${number}학년` : "";
}

function parseSheet(rows: unknown[][]) {
  const headerRowIndex = rows.findIndex((row) => {
    const nameIndex = findHeaderIndex(row, headerAliases.name);
    const supportingHeaders = [headerAliases.grade, headerAliases.position, headerAliases.number]
      .filter((aliases) => findHeaderIndex(row, aliases) >= 0).length;
    return nameIndex >= 0 && supportingHeaders >= 1;
  });
  if (headerRowIndex < 0) {
    return { players: [] as ImportPlayer[], errors: ["열 제목에서 '선수명(또는 성명)'과 학년·포지션·등번호 중 하나를 찾지 못했습니다."] };
  }

  const header = rows[headerRowIndex];
  const indexes = Object.fromEntries(Object.entries(headerAliases).map(([key, aliases]) => [key, findHeaderIndex(header, aliases)])) as Record<keyof ImportPlayer, number>;
  const players: ImportPlayer[] = [];
  const errors: string[] = [];

  rows.slice(headerRowIndex + 1).forEach((row, offset) => {
    const rowNumber = headerRowIndex + offset + 2;
    const cell = (key: keyof ImportPlayer) => indexes[key] >= 0 ? row[indexes[key]] : "";
    const name = cleanCell(cell("name"));
    if (!name || /감독|코치|단장|부장/.test(name)) return;

    const grade = normalizeGrade(cell("grade"));
    const height = numberFromCell(cell("height"));
    const weight = numberFromCell(cell("weight"));
    const position = cleanCell(cell("position")) || "미지정";
    const batsThrows = cleanCell(cell("batsThrows")) || "우투우타";
    const year = numberFromCell(cell("year")) || 2026;
    const number = cleanCell(cell("number")).replace(/\.0$/, "") || "미정";

    const rowErrors: string[] = [];
    if (name.length > 30) rowErrors.push("이름이 너무 깁니다");
    if (!grade) rowErrors.push("학년이 없습니다");
    if (height < 100 || height > 230) rowErrors.push("키가 올바르지 않습니다");
    if (weight < 30 || weight > 200) rowErrors.push("몸무게가 올바르지 않습니다");
    if (number.length > 3) rowErrors.push("등번호가 너무 깁니다");
    if (rowErrors.length) {
      errors.push(`${rowNumber}행 ${name}: ${rowErrors.join(", ")}`);
      return;
    }

    players.push({ number, name, year, position, grade, height, weight, batsThrows });
  });

  return { players, errors };
}

export async function POST(request: Request) {
  const { user, role } = await apiAdmin();
  if (!user || !role) return Response.json({ error: "운영자만 선수 명단을 가져올 수 있습니다." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "엑셀 또는 CSV 파일을 선택해 주세요." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "명단 파일은 8MB 이하만 사용할 수 있습니다." }, { status: 400 });
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return Response.json({ error: ".xls, .xlsx, .csv 파일만 사용할 수 있습니다." }, { status: 400 });

  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) return Response.json({ error: "엑셀 첫 번째 시트를 읽지 못했습니다." }, { status: 400 });
    const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, raw: false, defval: "" });
    const result = parseSheet(rows);
    if (!result.players.length) {
      return Response.json({ error: result.errors[0] || "등록 가능한 선수를 찾지 못했습니다.", errors: result.errors }, { status: 400 });
    }
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: `명단 파일을 읽지 못했습니다: ${error instanceof Error ? error.message : "파일 오류"}` }, { status: 400 });
  }
}
