import Link from "next/link";
import { company } from "../shared/company";

export const metadata = {
  title: "Sustainability | 5B Trading",
  description:
    "How 5B Trading sources responsibly: renewable materials, waste valorisation, certified partner factories, and full disclosure on what we do and don't claim.",
  alternates: { canonical: "/sustainability" }
};

const materials = [
  {
    eyebrow: "Renewable",
    title: "Bamboo",
    body:
      "Vietnamese moso and luong bamboo grow back in 3–5 years from the same root system — no replanting, no clear-cutting. Our partner farms harvest selectively, leaving 30%+ standing biomass each cycle.",
    image: "/images/bamboo_forest.png",
    alt: "Bamboo grove in northern Vietnam"
  },
  {
    eyebrow: "Circular",
    title: "Biochar from rice husk",
    body:
      "The Mekong Delta produces 20+ million tonnes of rice husk annually — most of it open-burned. Our pyrolysis partners convert that waste into stable carbon, locking CO₂ into soil for centuries while improving yields.",
    image: "/images/charcoal_biochar.png",
    alt: "Biochar pellets and lump charcoal"
  },
  {
    eyebrow: "Heritage",
    title: "Craft villages",
    body:
      "Phu Vinh has woven bamboo for 400 years. Bat Trang has fired ceramic since the 14th century. Bao Loc has reeled silk for generations. We give these villages a global market without industrialising the craft out of them.",
    image: "/images/quality_control.png",
    alt: "Craftsperson inspecting woven bamboo"
  }
];

const certs = [
  { name: "FSC", body: "Forest Stewardship Council — for bamboo and paper raw material." },
  { name: "BSCI", body: "Business Social Compliance Initiative — labour conditions audit." },
  { name: "Sedex / SMETA", body: "Ethical trade audit covering labour, health, environment, business ethics." },
  { name: "ISO 14001", body: "Environmental management system standard." },
  { name: "EBC", body: "European Biochar Certificate — for our biochar partners." },
  { name: "ISO 9001", body: "Quality management system standard." }
];

const impact = [
  { metric: "3–5 yr", label: "Bamboo regrowth cycle" },
  { metric: "20M+ t", label: "Rice husk available for valorisation / year" },
  { metric: "100%", label: "Partner cert verified annually" },
  { metric: "0", label: "Certifications we claim that we don't hold" }
];

export default function SustainabilityPage() {
  return (
    <div className="page-shell about-shell">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">Sustainability</p>
          <h1>Sustainability isn't a marketing claim. Here's exactly how we operate.</h1>
          <p className="lede">
            We're a sourcing partner, not a manufacturer — which means our
            responsibility lives in the factories we choose, the materials we
            prioritise, and the certifications we verify on your behalf.
          </p>
          <div className="cta-row">
            <Link className="primary-link" href="/request-quote">
              Source responsibly with us
            </Link>
            <Link className="secondary-link" href="#disclosure">
              Read our disclosure
            </Link>
          </div>
        </div>
        <div className="about-hero-image">
          <img alt="Vietnamese bamboo grove" src="/images/bamboo_forest.png" />
        </div>
      </section>

      <section className="section-title">
        <p className="eyebrow">Materials</p>
        <h2>Three reasons our materials are inherently sustainable</h2>
        <p>
          We don't have to retrofit sustainability into our supply chain — it
          starts at the source. Renewable bamboo, waste-valorised biochar, and
          centuries-old craft heritage.
        </p>
      </section>

      {materials.map((m, i) => (
        <section className={`story-block ${i % 2 === 1 ? "reverse" : ""}`} key={m.title}>
          <div className="story-block-copy">
            <p className="eyebrow">{m.eyebrow}</p>
            <h2>{m.title}</h2>
            <p>{m.body}</p>
          </div>
          <div className="story-block-image">
            <img alt={m.alt} src={m.image} />
          </div>
        </section>
      ))}

      <section className="proof-strip" aria-label="Sustainability metrics">
        {impact.map((p) => (
          <div className="proof-item" key={p.label}>
            <strong>{p.metric}</strong>
            <span>{p.label}</span>
          </div>
        ))}
      </section>

      <section className="section-title">
        <p className="eyebrow">Certifications</p>
        <h2>What our partner factories are certified for</h2>
        <p>
          We verify each certificate annually and disclose the holder, certificate
          ID, and PDF copy upon LOI. You can then verify directly with the issuing
          body — FSC public search, Sedex platform, etc.
        </p>
      </section>
      <section className="values-grid cert-grid" aria-label="Partner certifications">
        {certs.map((c) => (
          <article className="value-card" key={c.name}>
            <span className="value-num">CERT</span>
            <h3>{c.name}</h3>
            <p>{c.body}</p>
          </article>
        ))}
      </section>

      <section className="page-card disclosure-card" id="disclosure">
        <p className="eyebrow">Disclosure — read this</p>
        <h2>What we do and don't claim</h2>
        <div className="disclosure-grid">
          <div>
            <h3>We claim</h3>
            <ul>
              <li>To select partner factories that hold third-party certifications relevant to your product.</li>
              <li>To verify those certificates annually and share documentation upon LOI.</li>
              <li>To disclose the maker behind your order — no anonymised middleman supply.</li>
              <li>To prefer renewable, circular, and heritage materials where the spec allows.</li>
            </ul>
          </div>
          <div>
            <h3>We don't claim</h3>
            <ul>
              <li>To hold any product certifications ourselves (we are a trading company, not a factory).</li>
              <li>That every product on this site is FSC / BSCI / Sedex certified — only the ones whose partner factory holds the relevant cert.</li>
              <li>Carbon-neutral shipping or scope-3 offsets — those are the buyer's freight forwarder's domain.</li>
              <li>To audit factories we've never visited. If it's in our network, we've sat in it.</li>
            </ul>
          </div>
        </div>
        <p className="muted">
          If you'd like proof of a specific certificate before signing an LOI,
          mention it in your RFQ — we'll send a redacted summary the same working day.
        </p>
      </section>

      <section className="final-cta about-final-cta">
        <div>
          <p className="eyebrow">Source with proof</p>
          <h2>Tell us your certification requirements upfront</h2>
          <p>
            FSC, BSCI, Sedex, EBC, ISO — name your spec and we'll match it to the
            partner factory that already holds it. No greenwash, no maybe-later.
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
