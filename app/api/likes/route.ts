import { env } from "cloudflare:workers";

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
};

type D1Database = {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<unknown>;
};

let schemaReady: Promise<void> | null = null;

function db() {
  return (env as unknown as { DB: D1Database }).DB;
}

function ensureSchema() {
  if (!schemaReady) {
    const database = db();
    schemaReady = database.batch([
      database.prepare("CREATE TABLE IF NOT EXISTS media_likes (media_key TEXT NOT NULL, visitor_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (media_key, visitor_id))"),
      database.prepare("CREATE INDEX IF NOT EXISTS idx_media_likes_media_key ON media_likes(media_key)"),
    ]).then(() => undefined);
  }
  return schemaReady;
}

function isMediaKey(value: string) {
  return /^gd\/[A-Za-z0-9-]+\/(pitching|batting|fielding|photo)\/[^/]{1,240}$/.test(value);
}

function visitor(request: Request) {
  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  return userId && email ? `user:${userId}` : null;
}

export async function GET(request: Request) {
  const current = visitor(request);
  if (!current) return Response.json({ error: "회원 로그인 후 이용할 수 있습니다." }, { status: 401 });
  await ensureSchema();
  const result = await db().prepare(
    "SELECT media_key, COUNT(*) AS like_count, MAX(CASE WHEN visitor_id = ? THEN 1 ELSE 0 END) AS liked FROM media_likes GROUP BY media_key",
  ).bind(current).all<{ media_key: string; like_count: number; liked: number }>();
  const headers = new Headers({ "cache-control": "no-store", "content-type": "application/json" });
  return new Response(JSON.stringify({
    items: result.results.map((row) => ({ key: row.media_key, count: Number(row.like_count), liked: Boolean(row.liked) })),
  }), { headers });
}

export async function POST(request: Request) {
  const current = visitor(request);
  if (!current) return Response.json({ error: "회원 로그인 후 이용할 수 있습니다." }, { status: 401 });
  await ensureSchema();
  const body = await request.json() as { key?: string };
  const key = body.key ?? "";
  if (!isMediaKey(key)) return Response.json({ error: "올바르지 않은 미디어입니다." }, { status: 400 });
  const existing = await db().prepare("SELECT 1 AS found FROM media_likes WHERE media_key = ? AND visitor_id = ?")
    .bind(key, current).first<{ found: number }>();
  if (existing) {
    await db().prepare("DELETE FROM media_likes WHERE media_key = ? AND visitor_id = ?").bind(key, current).run();
  } else {
    await db().prepare("INSERT OR IGNORE INTO media_likes (media_key, visitor_id, created_at) VALUES (?, ?, ?)")
      .bind(key, current, Date.now()).run();
  }
  const total = await db().prepare("SELECT COUNT(*) AS count FROM media_likes WHERE media_key = ?")
    .bind(key).first<{ count: number }>();
  const headers = new Headers({ "cache-control": "no-store", "content-type": "application/json" });
  return new Response(JSON.stringify({ key, count: Number(total?.count ?? 0), liked: !existing }), { headers });
}
