import type { MetadataRoute } from "next";
import { getSiteUrl } from "./shared/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        allow: ["/", "/about", "/products", "/articles", "/export-process", "/request-quote"],
        disallow: ["/admin", "/buyer", "/login", "/logout", "/register"],
        userAgent: "*"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
