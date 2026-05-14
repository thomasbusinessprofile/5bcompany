import Link from "next/link";
import { getPublicArticles } from "../shared/article-data";

export const metadata = {
  title: "Insights | 5B Trading",
  description:
    "Vietnam export market insights for international buyers — sourcing guides, materials & craft, trade & logistics, compliance.",
  alternates: { canonical: "/articles" }
};

// Re-fetch from Supabase at most once a minute so CMS edits (new posts,
// updated hero images, status changes) propagate without a redeploy.
export const revalidate = 60;

type ArticlesPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { category } = await searchParams;
  const articles = await getPublicArticles();

  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter(Boolean) as string[])
  ).sort();

  const active = categories.includes(category ?? "") ? category : null;
  const visible = active ? articles.filter((a) => a.category === active) : articles;

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Insights</p>
        <h1>Vietnam export insights for international buyers</h1>
        <p>
          Sourcing guides, market intelligence, trade & logistics, and compliance
          notes — written for buyers evaluating Vietnam as a primary or
          secondary supply origin.
        </p>
      </section>

      <nav className="filter-bar" aria-label="Article category filter">
        <Link
          aria-current={active === null ? "page" : undefined}
          className={active === null ? "filter-chip active" : "filter-chip"}
          href="/articles"
        >
          All insights
        </Link>
        {categories.map((c) => (
          <Link
            aria-current={active === c ? "page" : undefined}
            className={active === c ? "filter-chip active" : "filter-chip"}
            href={`/articles?category=${encodeURIComponent(c)}`}
            key={c}
          >
            {c}
          </Link>
        ))}
      </nav>

      <section className="card-grid" aria-label="Insights">
        {visible.map((article) => (
          <Link className="product-card" href={`/articles/${article.slug}`} key={article.slug}>
            {article.image ? (
              <div className="product-card-image">
                <img alt={article.imageAlt ?? article.title} src={article.image} />
              </div>
            ) : null}
            <div className="product-card-content">
              {article.category ? <p className="card-kicker">{article.category}</p> : null}
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <span className="secondary-link">Read article →</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
