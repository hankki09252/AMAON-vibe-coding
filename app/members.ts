import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "./chatgpt-auth";

type Statement = {
  bind(...values: unknown[]): Statement;
  run(): Promise<unknown>;
};

type Database = {
  prepare(sql: string): Statement;
};

let membersSchemaReady: Promise<void> | null = null;

function database() {
  return (env as unknown as { DB: Database }).DB;
}

function ensureMembersSchema() {
  if (!membersSchemaReady) {
    membersSchemaReady = database().prepare(
      "CREATE TABLE IF NOT EXISTS site_members (user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, joined_at INTEGER NOT NULL, last_seen_at INTEGER NOT NULL)",
    ).run().then(() => undefined);
  }
  return membersSchemaReady;
}

export async function registerMember(user: ChatGPTUser) {
  await ensureMembersSchema();
  const now = Date.now();
  await database().prepare(
    "INSERT INTO site_members (user_id, email, display_name, joined_at, last_seen_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, last_seen_at = excluded.last_seen_at",
  ).bind(user.userId, user.email, user.displayName, now, now).run();
}
