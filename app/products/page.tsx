import Link from "next/link";
import { getCatalogueData } from "../shared/catalogue";

export const metadata = {
  title: "Products | 5B Trading",
  description:
    "Export-ready product groups for bamboo, packaging, charcoal, biochar, and rattan furniture sourcing."
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const { categories, products } = await getCatalogueData();
  const activeCategory = categories.some((item) => item.slug === category)
    ? category
    : "all";
  const visibleProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Product Catalogue</p>
        <h1>Export-ready product groups</h1>
        <p>
          Each product card leads to specifications, packing options, request
          inputs, and a detail page built for sourcing conversations.
        </p>
      </section>

      <nav className="filter-bar" aria-label="Product category filter">
        <Link
          aria-current={activeCategory === "all" ? "page" : undefined}
          className={activeCategory === "all" ? "filter-chip active" : "filter-chip"}
          href="/products"
        >
          All products
        </Link>
        {categories.map((item) => (
          <Link
            aria-current={activeCategory === item.slug ? "page" : undefined}
            className={activeCategory === item.slug ? "filter-chip active" : "filter-chip"}
            href={`/products?category=${item.slug}`}
            key={item.slug}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <section className="category-summary-grid" aria-label="Product category summaries">
        {categories.map((item) => (
          <article className="summary-tile" key={item.slug}>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="catalogue-grid" aria-label="Product catalogue">
        {visibleProducts.map((product) => (
          <article className="product-card catalogue-card" key={product.slug}>
            <div>
              <p className="card-kicker">
                {categories.find((item) => item.slug === product.category)?.name}
              </p>
              <h2>{product.name}</h2>
              <p>{product.summary}</p>
            </div>
            <dl className="mini-specs">
              <div>
                <dt>Specs</dt>
                <dd>{product.specs.slice(0, 2).join(" / ")}</dd>
              </div>
              <div>
                <dt>Packing</dt>
                <dd>{product.packingOptions.slice(0, 2).join(" / ")}</dd>
              </div>
              <div>
                <dt>MOQ</dt>
                <dd>{product.moq}</dd>
              </div>
            </dl>
            <div className="tag-row">
              {product.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="card-actions">
              <Link className="secondary-link" href={`/products/${product.slug}`}>
                View detail
              </Link>
              <Link className="primary-link" href={`/request-quote?product=${product.slug}`}>
                Create Request
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
