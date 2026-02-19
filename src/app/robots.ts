import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.getequily.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/profile", "/api/", "/login", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
