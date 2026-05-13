import Link from "next/link";
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
      <article className="page-card">
        <p className="eyebrow">Insights</p>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
        <div className="detail-list">
          <div>
            <strong>Buyer checklist</strong>
            <p>{article.body}</p>
          </div>
          <div>
            <strong>SEO focus keyword</strong>
            <p>{article.keyword || "No keyword set."}</p>
          </div>
          <div>
            <strong>Internal link</strong>
            <p>
              Link buyers from article content to relevant product pages and a
              structured request CTA.
            </p>
          </div>
        </div>
        <div className="cta-row">
          <Link className="primary-link" href="/request-quote">
            Create Request
          </Link>
          <Link className="secondary-link" href="/products">
            View Products
          </Link>
        </div>
      </article>
    </div>
  );
}
