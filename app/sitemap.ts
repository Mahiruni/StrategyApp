import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://meridian-journal.vercel.app";
  return ["", "/plan", "/journal", "/analytics", "/vault"].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-08-30T00:00:00Z"),
    changeFrequency: route ? "weekly" : "daily",
    priority: route ? 0.8 : 1,
  }));
}
