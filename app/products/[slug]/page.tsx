import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCatalogueData,
  getCatalogueProductBySlug,
  getCategoryNameFromList
} from "../../shared/catalogue";
import type { ProductGroup } from "../../shared/data";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { products } = await getCatalogueData();

  return products.map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const { product } = await getCatalogueProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found | 5B Trading"
    };
  }

  return {
    alternates: {
      canonical: `/products/${product.slug}`
    },
    description: product.summary,
    openGraph: {
      description: product.summary,
      title: `${product.name} Supplier Vietnam | 5B Trading`,
      type: "website"
    },
    title: `${product.name} Supplier Vietnam | 5B Trading`
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const { categories, product, products } = await getCatalogueProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Only track in production or simply don't await to avoid blocking render
  void import("../../shared/analytics").then(({ trackEvent }) => {
    trackEvent("product_viewed", { product_slug: slug });
  });

  const relatedProducts = product.relatedSlugs
    .map((relatedSlug) => products.find((item) => item.slug === relatedSlug))
    .filter((item): item is ProductGroup => item !== undefined);

  return (
    <div className="page-shell">
      <section className="product-hero">
        <div>
          <p className="eyebrow">{getCategoryNameFromList(categories, product.category)}</p>
          <h1>{product.name}</h1>
          <p className="hero-copy">{product.description}</p>
          <div className="cta-row">
            <Link className="primary-link" href={`/request-quote?product=${product.slug}`}>
              Create Request
            </Link>
            <Link className="secondary-link" href="/products">
              Back to Products
            </Link>
          </div>
        </div>
        <aside className="page-card request-checklist">
          <h2>Buyer inputs before quotation</h2>
          <ul className="check-list">
            {product.requestFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="product-detail-grid" aria-label={`${product.name} sourcing details`}>
        <article className="page-card">
          <h2>Specifications</h2>
          <ul className="clean-list">
            {product.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </article>
        <article className="page-card">
          <h2>Applications</h2>
          <ul className="clean-list">
            {product.applications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
        </article>
        <article className="page-card">
          <h2>Packing options</h2>
          <ul className="clean-list">
            {product.packingOptions.map((packing) => (
              <li key={packing}>{packing}</li>
            ))}
          </ul>
        </article>
        <article className="page-card">
          <h2>Export documents</h2>
          <ul className="clean-list">
            {product.documents.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="split detail-band">
        <div className="page-card">
          <h2>Commercial notes</h2>
          <div className="detail-list">
            <div>
              <strong>MOQ</strong>
              <p>{product.moq}</p>
            </div>
            <div>
              <strong>Lead time</strong>
              <p>{product.leadTime}</p>
            </div>
            <div>
              <strong>Quality and claims discipline</strong>
              <p>
                Price, stock, lead time, lab data, certification, and compliance
                claims must be verified by admin before quotation or publishing.
              </p>
            </div>
          </div>
        </div>
        <aside className="page-card">
          <h2>Request CTA</h2>
          <p>
            A structured request should include product specification, quantity,
            destination port, packing, document needs, target timeline, and any
            attachment or reference image.
          </p>
          <Link className="primary-link" href={`/request-quote?product=${product.slug}`}>
            Create Request
          </Link>
        </aside>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="related-section" aria-label="Related products">
          <div className="section-title">
            <h2>Related products</h2>
            <p>Use related products to help buyers compare options before creating a request.</p>
          </div>
          <div className="card-grid">
            {relatedProducts.map((related) => (
              <Link className="product-card" href={`/products/${related.slug}`} key={related.slug}>
                <h3>{related.name}</h3>
                <p>{related.summary}</p>
                <div className="tag-row">
                  {related.tags.slice(0, 3).map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
