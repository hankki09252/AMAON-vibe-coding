import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Publish the homepage first. Add individually verified public profile URLs separately.
  return [{ url: "https://www.amaon.kr/" }];
}
