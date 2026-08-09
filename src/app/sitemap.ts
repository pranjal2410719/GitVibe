import type { MetadataRoute } from "next";
import { POPULAR_USERS } from "@/lib/popular-users";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitvibe.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages. Profile pages are only indexed for curated, meaningful
  // profiles — never for arbitrary usernames — to avoid thin-page dilution.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const profilePages: MetadataRoute.Sitemap = POPULAR_USERS.map((u) => ({
    url: `${BASE}/u/${encodeURIComponent(u)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...profilePages];
}
