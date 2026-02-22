import { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || BRAND.baseUrl;

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
