import Link from "next/link";
import { getPublicArticles } from "../shared/article-data";

export const metadata = {
  title: "Insights | 5B Trading",
  description:
    "Buyer education and SEO articles for Vietnam export sourcing workflows."
};

export default async function ArticlesPage() {
  const articles = await getPublicArticles();

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Insights / SEO Articles</p>
        <h1>Practical sourcing notes for buyers</h1>
        <p>
          Article pages educate buyers, support Google search visibility, and
          guide readers back into a structured request.
        </p>
      </section>
      <section className="card-grid" aria-label="Insights">
        {articles.map((article) => (
          <Link className="product-card" href={`/articles/${article.slug}`} key={article.slug}>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <span className="secondary-link">Read article</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
