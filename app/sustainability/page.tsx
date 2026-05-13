import Link from "next/link";

export const metadata = {
  title: "Sustainability | 5B Trading",
  description:
    "How 5B Trading sources responsibly, preserves craft heritage, and discloses partner factory certifications transparently.",
  alternates: { canonical: "/sustainability" }
};

const pillars = [
  {
    title: "Sourced responsibly",
    body: "Every partner factory in our network must hold at least one third-party certification: FSC, Sedex, BSCI, ISO 14001, or EBC. We verify each certificate annually and disclose the holder on buyer request."
  },
  {
    title: "Heritage preserved",
    body: "We work with traditional craft villages — Phu Vinh for bamboo weaving, Bat Trang for ceramic, Bao Loc for silk. Our role is to make that craft accessible globally without losing what makes it special."
  },
  {
    title: "Circular by design",
    body: "Biochar valorises rice husk waste that would otherwise be open-burned. Bamboo is one of the fastest-growing renewable materials on the planet. Specialty paper partners use FSC-certified pulp sources."
  },
  {
    title: "Transparent supply chain",
    body: "Once we sign an LOI, you know exactly which factory makes your goods. No black-box middleman, no hidden mark-ups, no surprises in your packing list."
  }
];

export default function SustainabilityPage() {
  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Sustainability</p>
        <h1>Sustainability isn't a marketing claim. Here's exactly how we operate.</h1>
        <p>
          We're a sourcing partner, not a manufacturer — which means our sustainability
          commitments live in the factories we choose to work with. We pick well, we
          verify regularly, and we disclose openly.
        </p>
      </section>

      <section className="story-grid" aria-label="Sustainability pillars">
        {pillars.map((p) => (
          <article className="story-card" key={p.title}>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
          </article>
        ))}
      </section>

      <section className="page-card" aria-label="Partner certification disclosure">
        <p className="eyebrow">Disclosure</p>
        <h2>About partner factory certifications</h2>
        <p>
          Any certification logos shown on this site are held by our partner factories,
          not by 5B Trading. We make no claims to certifications we do not directly
          hold.
        </p>
        <p>
          We verify each partner's certificate annually and can share the holder name,
          certificate ID, and a copy of the PDF upon Letter of Intent. This lets you
          verify directly with the issuing body (FSC public search, Sedex platform,
          etc.).
        </p>
        <p className="muted">
          If you'd like to see proof of a specific certificate before signing an LOI,
          please ask in your RFQ — we'll send a redacted summary.
        </p>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow">Ready to source responsibly?</p>
          <h2>Tell us your certification requirements</h2>
          <p>
            FSC, BSCI, Sedex, EBC, ISO 9001 — we match your spec to the partner
            factory that already holds it.
          </p>
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
