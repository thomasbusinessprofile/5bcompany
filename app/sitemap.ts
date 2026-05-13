import type { MetadataRoute } from "next";
import { getPublicArticles } from "./shared/article-data";
import { getCatalogueData } from "./shared/catalogue";
import { getSiteUrl } from "./shared/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { products } = await getCatalogueData();
  const articles = await getPublicArticles();
  const now = new Date();
  const staticRoutes = ["", "/about", "/products", "/request-quote", "/export-process", "/articles"].map(
    (path) => ({
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: path === "" ? 1 : 0.8,
      url: `${siteUrl}${path}`
    })
  );

  const productRoutes = products.map((product) => ({
    changeFrequency: "weekly" as const,
    lastModified: now,
    priority: 0.7,
    url: `${siteUrl}/products/${product.slug}`
  }));

  const articleRoutes = articles.map((article) => ({
    changeFrequency: "monthly" as const,
    lastModified: now,
    priority: 0.6,
    url: `${siteUrl}/articles/${article.slug}`
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
