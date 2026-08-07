import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const mediaLikes = sqliteTable(
  "media_likes",
  {
    mediaKey: text("media_key").notNull(),
    visitorId: text("visitor_id").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.mediaKey, table.visitorId] }),
    index("idx_media_likes_media_key").on(table.mediaKey),
  ],
);

export const siteMembers = sqliteTable("site_members", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  joinedAt: integer("joined_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
});
