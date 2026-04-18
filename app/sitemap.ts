import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://brandle.today",
      lastModified: new Date("2026-04-17"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://brandle.today/how-to-play",
      lastModified: new Date("2026-04-17"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
