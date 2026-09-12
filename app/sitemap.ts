import type { MetadataRoute } from "next";
import { readPublishedWeekly } from "./weekly/weekly-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const weekly = await readPublishedWeekly(50).catch(() => []);
  return [
    { url: "https://www.amaon.kr/", changeFrequency: "daily", priority: 1 },
    { url: "https://www.amaon.kr/about", changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.amaon.kr/guide", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.amaon.kr/weekly", changeFrequency: "weekly", priority: 0.9 },
    ...weekly.map((post) => ({ url: `https://www.amaon.kr/weekly/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
