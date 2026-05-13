import type { MetadataRoute } from "next";
import { getSiteUrl } from "./shared/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        allow: ["/", "/products", "/articles", "/export-process", "/request-quote"],
        disallow: ["/admin", "/buyer"],
        userAgent: "*"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
