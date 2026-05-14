import Link from "next/link";
import type React from "react";
import { notFound } from "next/navigation";
import { getPublicArticleBySlug, getPublicArticles } from "../../shared/article-data";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getPublicArticles();

  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found | 5B Trading"
    };
  }

  return {
    alternates: {
      canonical: `/articles/${article.slug}`
    },
    description: article.seoDescription || article.excerpt,
    openGraph: {
      description: article.seoDescription || article.excerpt,
      title: `${article.seoTitle || article.title} | 5B Trading`,
      type: "article"
    },
    title: `${article.seoTitle || article.title} | 5B Trading`
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="page-shell">
      <article className="page-card article-body">
        <p className="eyebrow">Insights</p>
        <h1>{article.title}</h1>
        <p className="lede">{article.excerpt}</p>
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
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
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
