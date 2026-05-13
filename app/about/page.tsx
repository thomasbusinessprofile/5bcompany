import Link from "next/link";
import { company } from "../shared/company";

export const metadata = {
  title: "Our Story | 5B Trading",
  description:
    "5B Trading is a Vietnam sourcing partner connecting international buyers with curated craft makers across bamboo, biochar, and specialty paper.",
  alternates: { canonical: "/about" }
};

const values = [
  {
    title: "Transparency",
    body: "We disclose the maker behind your order. No black-box middleman markup, no surprises in your packing list."
  },
  {
    title: "Curation",
    body: "Every factory in our network is vetted for quality, ethics, and export readiness. We say no more often than yes."
  },
  {
    title: "Heritage",
    body: "Vietnamese craft villages carry centuries of skill. Our role is to bring that craft to global brands without losing what makes it special."
  },
  {
    title: "Partnership",
    body: "Founder-level accountability. Same-day replies. We treat your first 1/3-container order with the same care as a buyer's tenth full container."
  }
];

const founders = [
  {
    name: "Founder — to be added",
    role: "Co-founder & Director",
    bio: "Placeholder — founder bio will appear here. We'll share the journey of building 5B Trading, why we focus on Vietnamese craft, and what drives our daily work with partner factories.",
    linkedin: "#"
  },
  {
    name: "Founder — to be added",
    role: "Co-founder & Head of Sourcing",
    bio: "Placeholder — second founder bio. Years inside Vietnamese factories, relationships in Phu Vinh, Hung Yen, and the Mekong Delta, and a belief that good sourcing is good storytelling.",
    linkedin: "#"
  }
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Our story</p>
        <h1>A sourcing partner for serious buyers of Vietnamese craft</h1>
        <p>
          5B Trading was started because international buyers kept telling us the same
          thing: Vietnam has incredible makers, but it's hard to find the right one
          without flying here for two weeks. We built a curated network so you don't
          have to.
        </p>
      </section>

      <section className="split">
        <article className="page-card">
          <p className="eyebrow">Origin</p>
          <h2>From craft villages to container ports</h2>
          <p>
            Vietnam has over 720 traditional craft villages, millions of tonnes of
            agricultural residue, and thousands of small mills. Every year, brands in
            New York, Tokyo, and Berlin look for the right partner — and most of them
            give up after a month of cold emails.
          </p>
          <p>
            We started 5B Trading to be the bridge. We spend months inside workshops in
            Phu Vinh, Hung Yen, and the Mekong Delta, learning the craft and earning
            the right to recommend the makers we work with.
          </p>
        </article>
        <article className="page-card">
          <p className="eyebrow">Vision</p>
          <h2>Where we're going</h2>
          <p>
            We want to make Vietnamese craft and natural materials accessible to brands
            worldwide — without the friction of language, distance, and trust gaps.
          </p>
          <p>
            By 2027, our goal is to support 100+ international buyers across the US,
            EU, Japan, Korea, the Middle East and Australia, with a network of vetted
            partner factories spanning bamboo, biochar, and specialty paper.
          </p>
        </article>
      </section>

      <section className="story-grid" aria-label="Our values">
        {values.map((value) => (
          <article className="story-card" key={value.title}>
            <h2>{value.title}</h2>
            <p>{value.body}</p>
          </article>
        ))}
      </section>

      <section className="section-title">
        <p className="eyebrow">Founders</p>
        <h2>The people behind 5B Trading</h2>
      </section>
      <section className="card-grid" aria-label="Founders">
        {founders.map((founder) => (
          <article className="page-card founder-card" key={founder.name}>
            <div className="founder-photo" aria-hidden="true">
              <span>Photo</span>
            </div>
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

      <section className="final-cta">
        <div>
          <p className="eyebrow">Work with us</p>
          <h2>Send us a brief, get a sourcing plan</h2>
          <p>One working day reply. No pressure, no spam.</p>
        </div>
        <div className="cta-row">
          <Link className="primary-link" href="/request-quote">
            Request a quote
          </Link>
        </div>
      </section>
    </div>
  );
}
