import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.amaon.kr/", changeFrequency: "daily", priority: 1 },
    { url: "https://www.amaon.kr/about", changeFrequency: "monthly", priority: 0.9 },
    { url: "https://www.amaon.kr/guide", changeFrequency: "monthly", priority: 0.8 },
  ];
}
