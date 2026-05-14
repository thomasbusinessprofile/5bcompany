import Link from "next/link";
import { createPublicInquiry } from "./actions";
import { SubmitButton } from "../shared/SubmitButton";
import {
  getCatalogueData,
  getCatalogueProductBySlug
} from "../shared/catalogue";
import { company } from "../shared/company";

export const metadata = {
  title: "Request a quote | Vietnam sourcing partner | 5B Trading",
  description:
    "Tell us what you need to source from Vietnam — product, quantity, destination — and get a sourcing plan within one working day. Free, no obligation.",
  alternates: { canonical: "/request-quote" }
};

type RequestQuotePageProps = {
  searchParams: Promise<{ product?: string; status?: string }>;
};

function getStatusMessage(status?: string) {
  if (status === "submitted") {
    return {
      tone: "success",
      text:
        "Thanks — your request is in. We'll reply within one working day with a sourcing plan and indicative timeline."
    };
  }
  if (status === "missing-fields") {
    return {
      tone: "error",
      text: "Please add your name, company, valid email, and product requirement."
    };
  }
  if (status === "submit-error") {
    return { tone: "error", text: "Something went wrong. Please try again or email hello@5bcompany.com." };
  }
  if (status === "config-error") {
    return { tone: "error", text: "Request submission is temporarily unavailable. Please email hello@5bcompany.com." };
  }
  return null;
}

const trustPoints = [
  {
    icon: "⚡",
    title: "One working day reply",
    body: "A real person replies within 24 hours, Vietnam business hours +7 GMT."
  },
  {
    icon: "🔍",
    title: "Partner factory disclosed at LOI",
    body: "No black-box middleman. You know exactly which maker produces your goods."
  },
  {
    icon: "📋",
    title: "Certifications verified",
    body: "FSC, BSCI, Sedex, EBC, ISO — we route to factories that already hold the cert you need."
  },
  {
    icon: "📦",
    title: "Start from 1/3 container",
    body: "Mixed-supplier consolidation lets you ship before you commit to full-container volume."
  }
];

const stats = [
  { metric: "<24h", label: "Average reply time" },
  { metric: "30+", label: "Vetted partner factories" },
  { metric: "6", label: "Continents shipped to" },
  { metric: "1/3", label: "Minimum container we'll consolidate" }
];

const faqs = [
  {
    q: "Is a quote request free?",
    a: "Yes — entirely free, no obligation. We earn when you place an order, not when you ask for information."
  },
  {
    q: "How fast will you reply?",
    a: "Within one working day. If you send before 12:00 ICT (UTC+7) on a weekday, you usually hear back the same afternoon."
  },
  {
    q: "What if I don't know the exact spec yet?",
    a: "Just describe the use case and target end-customer. We'll come back with a shortlist of 2–3 likely product spec options + indicative pricing for each."
  },
  {
    q: "Do you charge for samples?",
    a: "Most samples are USD 20–80 + courier. Sample cost is credited against your first order."
  },
  {
    q: "What's the minimum order?",
    a: "Depends on product. Garden bamboo: 1 × 40HQ (≈ 5 000 rolls). Custom ceramic: 500 pieces / SKU. Biochar: 5 t bag minimum. We'll always quote your stated quantity."
  },
  {
    q: "Can you ship to my country?",
    a: "We ship to anywhere with a sea port. Air freight available for samples and small parcels."
  }
];

const volumeOptions = [
  { value: "sample", label: "Just a sample first" },
  { value: "trial", label: "Trial order (1 × 40HQ or less)" },
  { value: "ongoing", label: "Ongoing supply (monthly / quarterly)" },
  { value: "scoping", label: "Just scoping — not sure yet" }
];

const incotermOptions = ["FOB", "CIF", "EXW", "DDP", "Not sure"];

export default async function RequestQuotePage({ searchParams }: RequestQuotePageProps) {
  const { product: productSlug, status } = await searchParams;
  const catalogue = await getCatalogueData();
  const selected = productSlug ? await getCatalogueProductBySlug(productSlug) : null;
  const selectedProduct = selected?.product;
  const selectedCategory = selectedProduct?.category ?? "";
  const statusMessage = getStatusMessage(status);

  void import("../shared/analytics").then(({ trackEvent }) => {
    trackEvent("request_started", { source: "public_rfq" });
  });

  return (
    <div className="page-shell rfq-shell">
      {/* Hero */}
      <section className="rfq-hero">
        <div className="rfq-hero-copy">
          <p className="eyebrow">Request a quote</p>
          <h1>Tell us what you need to source from Vietnam.</h1>
          <p className="lede">
            Send a quick brief — product, quantity, destination — and we'll come back
            within one working day with a sourcing plan, partner factory shortlist,
            and indicative price band.
          </p>
          <ul className="rfq-hero-bullets">
            <li>✓ Free, no obligation</li>
            <li>✓ Reply from a real person within 24h</li>
            <li>✓ Partner factory disclosed at LOI</li>
          </ul>
        </div>
        <div className="rfq-hero-image">
          <img alt="Vietnamese export warehouse loading containers" src="/images/warehouse_loading.jpg" />
        </div>
      </section>

      {/* Stats strip */}
      <section className="rfq-stats" aria-label="By the numbers">
        {stats.map((s) => (
          <div className="rfq-stat" key={s.label}>
            <strong>{s.metric}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Form + sidebar */}
      <section className="split">
        <form action={createPublicInquiry} className="page-card request-form rfq-form">
          {statusMessage ? (
            <p className={`form-status ${statusMessage.tone}`}>{statusMessage.text}</p>
          ) : null}

          <input name="product_slug" type="hidden" value={selectedProduct?.slug ?? ""} />
          {/* Honeypot — invisible to humans, often filled by bots */}
          <div className="rfq-honeypot" aria-hidden="true">
            <label>
              Website (leave blank)
              <input autoComplete="off" name="website" tabIndex={-1} type="text" />
            </label>
          </div>

          <h2 className="rfq-section-title">About you</h2>
          <div className="rfq-row">
            <label>
              Full name *
              <input name="full_name" placeholder="Anna Lee" required />
            </label>
            <label>
              Work email *
              <input name="email" placeholder="you@company.com" required type="email" />
            </label>
          </div>
          <div className="rfq-row">
            <label>
              Company *
              <input name="company_name" placeholder="Company name" required />
            </label>
            <label>
              Phone / WhatsApp (optional)
              <input name="phone" placeholder="+49…" type="tel" />
            </label>
          </div>
          <label>
            Destination country *
            <input name="country" placeholder="Germany" required />
          </label>

          <h2 className="rfq-section-title">What you need</h2>
          <div className="rfq-row">
            <label>
              Product of interest *
              <select defaultValue={selectedCategory} name="category" required>
                <option value="" disabled>Select category</option>
                {catalogue.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              Incoterm preference
              <select defaultValue="" name="incoterm">
                <option value="">Select…</option>
                {incotermOptions.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Product requirement *
            <input
              defaultValue={selectedProduct?.name ?? ""}
              name="product_name"
              placeholder="e.g. bamboo fence roll, 1.8m × 3m, carbonised"
              required
            />
          </label>
          <label>
            Target quantity & timeline
            <input
              name="quantity"
              placeholder="e.g. 1 × 40HQ, ship in Q3 2026"
            />
          </label>

          <fieldset className="rfq-volume">
            <legend>Volume stage</legend>
            {volumeOptions.map((v) => (
              <label className="rfq-radio" key={v.value}>
                <input name="volume_stage" type="radio" value={v.value} />
                <span>{v.label}</span>
              </label>
            ))}
          </fieldset>

          <label>
            Additional notes (optional)
            <textarea
              name="message"
              rows={4}
              placeholder="Packing, certifications needed (FSC / BSCI / etc.), lead time, anything else we should know…"
            />
          </label>

          <SubmitButton pendingLabel="Sending...">Send request →</SubmitButton>

          <p className="form-note">
            By submitting you agree we'll reply to your email. We never share your
            details. Prefer to write directly? Email{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a> or{" "}
            <a
              href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>.
          </p>
        </form>

        <aside className="page-card rfq-aside">
          <h2>What happens next</h2>
          <ol className="check-list ordered">
            <li><strong>Within 1 working day</strong> — sourcing plan: factory shortlist, indicative price band, lead time, cert options.</li>
            <li><strong>Sample &amp; spec lock-in</strong> — sample shipped (cost credited against first order), spec sheet signed.</li>
            <li><strong>Quotation &amp; LOI</strong> — formal quote, partner factory disclosed, payment terms agreed.</li>
            <li><strong>Production &amp; QC</strong> — third-party pre-shipment inspection before B/L.</li>
            <li><strong>Shipment</strong> — Hai Phong / HCMC / Cai Mep, transit + documents tracked end-to-end.</li>
          </ol>

          <h2 style={{ marginTop: 28 }}>Why buyers choose 5B</h2>
          <ul className="rfq-trust-list">
            {trustPoints.map((p) => (
              <li key={p.title}>
                <span aria-hidden="true" className="rfq-trust-icon">{p.icon}</span>
                <div>
                  <strong>{p.title}</strong>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="muted" style={{ marginTop: 20 }}>
            Want a full account to track requests, quotes, and orders in one place?{" "}
            <Link className="auth-link" href="/register">Create a free buyer account →</Link>
          </p>
        </aside>
      </section>

      {/* FAQ */}
      <section className="rfq-faq">
        <h2>Frequently asked</h2>
        <div className="rfq-faq-grid">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
