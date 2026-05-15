import Link from "next/link";
import { company } from "../shared/company";
import { FounderPhoto } from "./FounderPhoto";

export const metadata = {
  title: "Our Story | 5B Trading",
  description:
    "How 5B Trading became a Vietnam sourcing partner for serious international buyers — the craft villages, the founders, and the buyers we serve.",
  alternates: { canonical: "/about" }
};

const values = [
  {
    eyebrow: "01",
    title: "Transparency",
    body:
      "We disclose the maker behind your order. No black-box middleman markup, no surprises in your packing list."
  },
  {
    eyebrow: "02",
    title: "Curation",
    body:
      "Every factory in our network is vetted for quality, ethics, and export readiness. We say no more often than yes."
  },
  {
    eyebrow: "03",
    title: "Heritage",
    body:
      "Vietnamese craft villages carry centuries of skill. Our role is to bring that craft to global brands without losing what makes it special."
  },
  {
    eyebrow: "04",
    title: "Partnership",
    body:
      "Founder-level accountability. Same-day replies. We treat your first 1/3-container order with the same care as a buyer's tenth full container."
  }
];

const milestones = [
  { year: "2018", title: "Founded in Hai Phong", body: "5B Trading registered as a sourcing-and-export partner serving Vietnamese makers." },
  { year: "2021", title: "First EU buyers shipped", body: "Bamboo fence rolls and stretch film consolidated into mixed containers for German garden retailers." },
  { year: "2023", title: "Biochar partnership", body: "Mekong Delta rice-husk biochar plants joined the network, opening the agricultural amendment line." },
  { year: "2026", title: "Curated network of 30+ factories", body: "Across bamboo, rattan, ceramic, silk, biochar, charcoal, and specialty paper — each vetted on-site." }
];

const proof = [
  { metric: "30+", label: "Partner factories vetted on-site" },
  { metric: "6", label: "Continents shipped to" },
  { metric: "1 day", label: "Average reply time on RFQs" },
  { metric: "1/3", label: "Minimum container we'll consolidate" }
];

const founders = [
  {
    name: "Founder — to be added",
    role: "Co-founder & Director",
    bio:
      "Years inside Vietnamese workshops — Phu Vinh weavers, Bat Trang ceramicists, Mekong biochar pyrolysis plants. Believes good sourcing is good storytelling.",
    image: "/images/founder-1.jpg",
    linkedin: "#"
  },
  {
    name: "Founder — to be added",
    role: "Co-founder & Head of Sourcing",
    bio:
      "Spent a decade matching European brands to Asian manufacturers. Joined 5B to fix the part of sourcing that black-box trading companies never solved: trust.",
    image: "/images/founder-2.jpg",
    linkedin: "#"
  }
];

export default function AboutPage() {
  return (
    <div className="page-shell about-shell">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">Our story</p>
          <h1>We started 5B Trading because the world's best craft was the hardest to find.</h1>
          <p className="lede">
            Vietnam has 720+ craft villages, millions of tonnes of agricultural
            residue ready to be valorised, and thousands of small mills that have
            never picked up an English call. We built the bridge.
          </p>
          <div className="cta-row">
            <Link className="primary-link" href="/request-quote">
              Start a sourcing brief
            </Link>
            <Link className="secondary-link" href="/products">
              See what we source
            </Link>
          </div>
        </div>
        <div className="about-hero-image">
          <img alt="Containers loading at a Vietnamese export warehouse" src="/images/warehouse_loading.jpg" />
        </div>
      </section>

      <section className="story-block">
        <div className="story-block-copy">
          <p className="eyebrow">Origin</p>
          <h2>From craft villages to container ports</h2>
          <p>
            A buyer once told us: "We tried sourcing from Vietnam for six months.
            We got three quotes that looked the same, two factories that ghosted us,
            and one container that shipped late by eight weeks." That's the moment
            we knew the gap was real.
          </p>
          <p>
            5B Trading started inside the workshops — drinking jasmine tea with
            bamboo weavers in Phu Vinh, walking pyrolysis plants in the Mekong
            Delta, watching paper machines run at 3 AM in Bac Ninh. We don't
            recommend a maker we haven't sat with.
          </p>
        </div>
        <div className="story-block-image">
          <img alt="Bamboo grove in a northern Vietnamese craft village" src="/images/bamboo_forest.png" />
        </div>
      </section>

      <section className="story-block reverse">
        <div className="story-block-copy">
          <p className="eyebrow">The buyer we serve</p>
          <h2>Built for serious international buyers — not bargain-hunters</h2>
          <p>
            Our buyers are garden retailers in Germany, packaging distributors in
            Australia, agricultural co-ops in Korea, design studios in Japan. They
            don't want the cheapest factory. They want the right one — certifiable,
            consistent, accountable for the third reorder.
          </p>
          <p>
            That's why we start every relationship with a spec, a sample, and a
            paper trail. Letters of Intent before factory disclosure. Pre-shipment
            inspection before B/L. Same-day replies — from a person, not a queue.
          </p>
        </div>
        <div className="story-block-image">
          <img alt="Pre-shipment quality control inspection" src="/images/quality_control.png" />
        </div>
      </section>

      <section className="proof-strip" aria-label="By the numbers">
        {proof.map((p) => (
          <div className="proof-item" key={p.label}>
            <strong>{p.metric}</strong>
            <span>{p.label}</span>
          </div>
        ))}
      </section>

      <section className="section-title">
        <p className="eyebrow">What we stand for</p>
        <h2>Four principles, every order, every time</h2>
      </section>
      <section className="values-grid" aria-label="Values">
        {values.map((value) => (
          <article className="value-card" key={value.title}>
            <span className="value-num">{value.eyebrow}</span>
            <h3>{value.title}</h3>
            <p>{value.body}</p>
          </article>
        ))}
      </section>

      <section className="section-title">
        <p className="eyebrow">Journey</p>
        <h2>How we got here</h2>
      </section>
      <section className="timeline" aria-label="Milestones">
        {milestones.map((m) => (
          <article className="timeline-row" key={m.year}>
            <span className="timeline-year">{m.year}</span>
            <div>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section-title">
        <p className="eyebrow">Founders</p>
        <h2>The people behind 5B Trading</h2>
      </section>
      <section className="card-grid founder-grid" aria-label="Founders">
        {founders.map((founder) => (
          <article className="page-card founder-card" key={founder.name}>
            <FounderPhoto name={founder.name} src={founder.image ?? ""} />
            <h3>{founder.name}</h3>
            <p className="muted">{founder.role}</p>
            <p>{founder.bio}</p>
            <Link className="ghost-link" href={founder.linkedin}>
              LinkedIn →
            </Link>
          </article>
        ))}
      </section>

      <section className="page-card">
        <p className="eyebrow">Company details</p>
        <h2>Registered & ready to ship</h2>
        <dl className="company-meta">
          <div>
            <dt>Legal name</dt>
            <dd>{company.legalNameEn}</dd>
          </div>
          <div>
            <dt>Tên pháp lý</dt>
            <dd>{company.legalNameVi}</dd>
          </div>
          <div>
            <dt>Tax ID</dt>
            <dd>{company.taxId}</dd>
          </div>
          <div>
            <dt>Founded</dt>
            <dd>{company.yearFounded}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{company.address}</dd>
          </div>
          <div>
            <dt>Director</dt>
            <dd>{company.representativeEn}</dd>
          </div>
          <div>
            <dt>Phone / WhatsApp</dt>
            <dd>{company.phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <Link href={`mailto:${company.email}`}>{company.email}</Link>
            </dd>
          </div>
        </dl>
      </section>

      <section className="final-cta about-final-cta">
        <div>
          <p className="eyebrow">Let's build something</p>
          <h2>Tell us what you need. We'll come back with a plan.</h2>
          <p>
            One working day reply. A real human, not a contact form auto-responder.
            No pressure, no spam, no ghost-quotes.
          </p>
        </div>
        <div className="cta-row">
          <Link className="primary-link" href="/request-quote">
            Request a quote
          </Link>
          <Link
            className="secondary-link"
            href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            WhatsApp us
          </Link>
        </div>
      </section>
    </div>
  );
}
