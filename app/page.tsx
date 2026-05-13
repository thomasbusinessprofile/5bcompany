import Link from "next/link";
import { company } from "./shared/company";
import { productGroups } from "./shared/data";

const howWeWork = [
  {
    title: "Tell us your spec",
    body: "Send your RFQ with target product, quantity, certification needs, and destination."
  },
  {
    title: "We source & verify",
    body: "Within 5 working days we shortlist vetted partner factories from our Vietnam network."
  },
  {
    title: "Sample & negotiate",
    body: "We coordinate samples, negotiate price, MOQ and payment terms on your behalf."
  },
  {
    title: "Production & shipping",
    body: "Quality control, export documents (B/L, COO, Phytosanitary), FOB or DDP."
  }
];

const storyPillars = [
  {
    eyebrow: "Heritage",
    title: "Craft villages of Vietnam",
    body: "From the bamboo weavers of Phu Vinh to the kilns of Hung Yen, our partner workshops carry centuries of craft. We bring that craft to global brands without losing what makes it special."
  },
  {
    eyebrow: "Curation",
    title: "A vetted partner network",
    body: "Every factory in our network is selected for quality, ethics, and export readiness. We disclose the maker behind your order once we move past LOI — no black-box sourcing."
  },
  {
    eyebrow: "Partnership",
    title: "Built around your buyer journey",
    body: "Flexible MOQ for emerging brands. Documentation rigor for established importers. Same-day English replies. Founder-level accountability."
  }
];

export default function HomePage() {
  return (
    <div className="page-shell home-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Vietnam Sourcing Partner</p>
          <h1>Your Vietnam sourcing partner for bamboo, biochar & paper</h1>
          <p className="hero-copy">
            We connect serious international buyers with a curated network of Vietnamese
            makers — flexible MOQ, transparent sourcing, story-driven products.
          </p>
          <div className="cta-row">
            <Link className="primary-link" href="/request-quote">
              Request a quote
            </Link>
            <Link className="secondary-link" href="/about">
              Our story
            </Link>
          </div>
          <div className="hero-image-container">
            <img alt="Vietnam export sourcing — craft and container" src="/images/warehouse_loading.jpg" />
          </div>
          <div className="trust-strip" aria-label="Markets we serve">
            <span>Supplying buyers in</span>
            <ul>
              {company.marketsServed.map((m) => (
                <li key={m.code} title={m.name}>
                  <span aria-hidden="true">{m.flag}</span> {m.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="workflow-panel" aria-label="How we work">
          <p className="eyebrow">How we work</p>
          <h2>From spec to shipment</h2>
          <div className="workflow-steps">
            {howWeWork.map((step, index) => (
              <div className="workflow-step" key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="story-grid" aria-label="What we stand for">
        {storyPillars.map((pillar) => (
          <article className="story-card" key={pillar.title}>
            <p className="eyebrow">{pillar.eyebrow}</p>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="featured-products">
        <div className="section-title">
          <p className="eyebrow">Featured</p>
          <h2>Three pillars of our sourcing</h2>
          <p>
            Bamboo from craft villages. Biochar from the Mekong Delta. Specialty paper
            from Vietnamese mills. Each product carries a story — and a spec sheet.
          </p>
        </div>
        <div className="card-grid" aria-label="Featured product groups">
          {productGroups.slice(0, 4).map((group) => (
            <Link className="product-card" href={`/products/${group.slug}`} key={group.slug}>
              {group.image && (
                <div className="product-card-image">
                  <img alt={group.name} src={group.image} />
                </div>
              )}
              <div className="product-card-content">
                <h3>{group.name}</h3>
                <p>{group.summary}</p>
                <div className="tag-row">
                  {group.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow">Start your project</p>
          <h2>Tell us what you need. We'll find the right maker.</h2>
          <p>
            Send a quick brief — product, quantity, destination — and we'll come back
            within one working day with a sourcing plan and indicative timeline.
          </p>
        </div>
        <div className="cta-row">
          <Link className="primary-link" href="/request-quote">
            Request a quote
          </Link>
          <Link className="secondary-link" href={`mailto:${company.email}`}>
            Email us
          </Link>
        </div>
      </section>
    </div>
  );
}
