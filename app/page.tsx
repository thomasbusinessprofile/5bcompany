import Link from "next/link";
import { company } from "./shared/company";
import { productGroups, workflowSteps } from "./shared/data";

export default function HomePage() {
  return (
    <div className="page-shell home-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Vietnam B2B Export Sourcing</p>
          <h1>Reliable export sourcing for serious buyers</h1>
          <p className="hero-copy">
            Browse products, create a sourcing request, and coordinate with the
            {` ${company.legalNameEn} `}export team. AI will support request
            structuring later, while admin keeps control of quotation and
            commercial commitments.
          </p>
          <div className="cta-row">
            <Link className="primary-link" href="/request-quote">
              Create Request
            </Link>
            <Link className="secondary-link" href="/products">
              View Products
            </Link>
          </div>
          <div className="metric-grid" aria-label="Platform highlights">
            <div className="metric">
              <strong>7+</strong>
              <span>Product groups</span>
            </div>
            <div className="metric">
              <strong>B2B</strong>
              <span>Request workflow</span>
            </div>
            <div className="metric">
              <strong>QC</strong>
              <span>Shipment review</span>
            </div>
            <div className="metric">
              <strong>SEO</strong>
              <span>CMS-ready plan</span>
            </div>
          </div>
        </div>
        <aside className="workflow-panel" aria-label="Sourcing workflow">
          <h2>Buyer request workflow</h2>
          <div className="workflow-steps">
            {workflowSteps.slice(0, 5).map((step, index) => (
              <div className="workflow-step" key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="featured-products">
        <div className="section-title">
          <h2>Featured product groups</h2>
          <p>
            Public catalogue pages give buyers enough context to start a more
            structured sourcing request.
          </p>
        </div>
        <div className="card-grid" aria-label="Featured product groups">
          {productGroups.slice(0, 4).map((group) => (
            <Link className="product-card" href={`/products/${group.slug}`} key={group.slug}>
              <h3>{group.name}</h3>
              <p>{group.summary}</p>
              <div className="tag-row">
                {group.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
