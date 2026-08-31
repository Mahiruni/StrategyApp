import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/plan", "/journal", "/analytics", "/vault"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-08-30T00:00:00Z"),
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.8 : 1,
  }));
}
