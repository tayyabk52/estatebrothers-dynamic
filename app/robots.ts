import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard", "/dashboard/", "/api/"],
      },
      {
        userAgent: ["GPTBot", "Google-Extended"],
        disallow: "/",
      },
    ],
    sitemap: "https://estatebrothers.pk/sitemap.xml",
  };
}
