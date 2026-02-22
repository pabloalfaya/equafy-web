import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || BRAND.baseUrl;

/** Public routes derived from app/ folder (excluding dashboard, profile, auth). */
const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/what-is-equily", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/why-equily", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/how-it-works", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/guide", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/features", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/models", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/legal", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/legal-notice", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/apis", changeFrequency: "monthly" as const, priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // --- DYNAMIC CONTENT (e.g. blog posts, articles) ---
  // When you have content with IDs/slugs in your database, uncomment and adapt:
  //
  // const dynamicEntries: MetadataRoute.Sitemap = [];
  // const posts = await fetch(`${baseUrl}/api/posts`).then((r) => r.json());
  // // or: const { data: posts } = await supabase.from('posts').select('slug, updated_at');
  // for (const post of posts) {
  //   dynamicEntries.push({
  //     url: `${baseUrl}/blog/${post.slug}`,
  //     lastModified: new Date(post.updated_at),
  //     changeFrequency: "weekly" as const,
  //     priority: 0.8,
  //   });
  // }

  return [...staticEntries];
}
