import { MetadataRoute } from "next";

// Usa NEXT_PUBLIC_BASE_URL en .env (ej: https://equily.app) para producción
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://equily.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = [
    "",
    "/what-is-equily",
    "/how-it-works",
    "/guide",
    "/features",
    "/pricing",
    "/contact",
    "/legal",
    "/terms",
    "/privacy",
    "/login",
    "/models",
    "/apis",
  ];

  return publicPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : ("monthly" as const),
    priority: path === "" ? 1 : 0.8,
  }));
}
