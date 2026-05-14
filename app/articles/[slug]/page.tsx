import Link from "next/link";
import type React from "react";
import { notFound } from "next/navigation";
import { getPublicArticleBySlug, getPublicArticles, type Article } from "../../shared/article-data";
import { company } from "../../shared/company";
import { getSiteUrl } from "../../shared/site";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_OG_IMAGE = "/images/bamboo_forest.png";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getPublicArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    return { title: "Article not found | 5B Trading" };
  }

  const siteUrl = getSiteUrl();
  const description = article.seoDescription || article.excerpt;
  const title = `${article.seoTitle || article.title} | 5B Trading`;
  const url = `${siteUrl}/articles/${article.slug}`;
  const image = `${siteUrl}${article.image ?? DEFAULT_OG_IMAGE}`;

  return {
    alternates: { canonical: `/articles/${article.slug}` },
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [{ url: image, width: 1200, height: 630 }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      section: article.category,
      tags: article.keyword ? [article.keyword] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    },
    title
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) notFound();

  const all = await getPublicArticles();
  const related = pickRelated(article, all);
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/articles/${article.slug}`;
  const image = `${siteUrl}${article.image ?? DEFAULT_OG_IMAGE}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: [image],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { "@type": "Organization", name: company.shortName, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: company.legalNameEn,
      logo: { "@type": "ImageObject", url: `${siteUrl}/images/logo.png` }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: article.category,
    keywords: article.keyword
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${siteUrl}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: url }
    ]
  };

  return (
    <div className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <nav className="breadcrumbs" aria-label="Breadcrumbs">
        <Link href="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/articles">Insights</Link>
        <span aria-hidden="true">›</span>
        <span className="muted">{article.title}</span>
      </nav>

      <article className="page-card article-body">
        <header className="article-header">
          {article.category ? <p className="eyebrow">{article.category}</p> : <p className="eyebrow">Insights</p>}
          <h1>{article.title}</h1>
          <p className="lede">{article.excerpt}</p>
          <p className="article-meta">
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            ) : null}
            <span aria-hidden="true"> · </span>
            <span>{readingTime(article.body)} min read</span>
          </p>
        </header>

        {article.image ? (
          <div className="article-hero">
            <img alt={article.imageAlt ?? article.title} src={article.image} />
          </div>
        ) : null}

        <ArticleBody body={article.body} />

        <div className="cta-row">
          <Link className="primary-link" href="/request-quote">
            Request a quote
          </Link>
          <Link className="secondary-link" href="/products">
            View products
          </Link>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="related-articles" aria-label="Related insights">
          <h2>Related insights</h2>
          <div className="card-grid">
            {related.map((r) => (
              <Link className="product-card" href={`/articles/${r.slug}`} key={r.slug}>
                {r.image ? (
                  <div className="product-card-image">
                    <img alt={r.imageAlt ?? r.title} src={r.image} />
                  </div>
                ) : null}
                <div className="product-card-content">
                  {r.category ? <p className="card-kicker">{r.category}</p> : null}
                  <h3>{r.title}</h3>
                  <p>{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function pickRelated(current: Article, all: Article[]): Article[] {
  const others = all.filter((a) => a.slug !== current.slug);
  const sameCategory = others.filter((a) => a.category && a.category === current.category);
  const fill = others.filter((a) => !sameCategory.includes(a));
  return [...sameCategory, ...fill].slice(0, 3);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

function readingTime(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="article-prose">
      {blocks.map((block, i) => {
        if (block.startsWith("- ")) {
          const items = block.split(/\n/).map((l) => l.replace(/^-\s*/, ""));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </div>
  );
}
