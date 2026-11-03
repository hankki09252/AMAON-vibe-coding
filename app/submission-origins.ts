export type SubmittedOrigin = { region: string; school: string; year: number; position: string };
type ExistingOrigin = SubmittedOrigin & { sequence: number };

export function parseSubmittedOrigins(value: unknown): SubmittedOrigin[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
  const rows = value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const item = entry as Record<string, unknown>;
    const region = typeof item.region === "string" ? item.region.trim() : "";
    const school = typeof item.school === "string" ? item.school.trim() : "";
    const position = typeof item.position === "string" ? item.position.trim() : "";
    const year = Number(item.year);
    if (!region || region.length > 30 || !school || school.length > 60 || !position || position.length > 20
      || !Number.isInteger(year) || year < 1950 || year > 2100) return null;
    return { region, school, year, position };
  });
  return rows.every((row): row is SubmittedOrigin => row !== null) ? rows : null;
}

export function newOriginRows(existing: ExistingOrigin[], submitted: SubmittedOrigin[]) {
  const key = (item: SubmittedOrigin) => `${item.region.replace(/\s+/g, "").toLowerCase()}|${item.school.replace(/\s+/g, "").toLowerCase()}|${item.year}`;
  const seen = new Set(existing.map(key));
  let sequence = Math.max(-1, ...existing.map((item) => item.sequence));
  const additions: ExistingOrigin[] = [];
  for (const item of submitted) {
    const id = key(item);
    if (seen.has(id)) continue;
    seen.add(id);
    additions.push({ ...item, sequence: ++sequence });
  }
  return existing.length + additions.length <= 10 ? additions : null;
}
