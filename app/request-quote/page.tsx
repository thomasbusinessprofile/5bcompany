import Link from "next/link";
import { createPublicInquiry } from "./actions";
import { SubmitButton } from "../shared/SubmitButton";
import {
  getCatalogueData,
  getCatalogueProductBySlug
} from "../shared/catalogue";
import { company } from "../shared/company";

export const metadata = {
  title: "Request a quote | 5B Trading",
  description:
    "Tell us what you need to source from Vietnam — product, quantity, destination — and get a sourcing plan within one working day.",
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
    title: "One working day reply",
    body: "A real person, not an auto-responder. Vietnam business hours +7 GMT."
  },
  {
    title: "Partner factory disclosed at LOI",
    body: "No black-box middleman. You know exactly which maker produces your goods."
  },
  {
    title: "Certifications verified",
    body: "FSC, BSCI, Sedex, EBC, ISO — we route to factories that already hold the cert you need."
  },
  {
    title: "Start from 1/3 container",
    body: "Mixed-supplier consolidation lets you ship before you commit to full-container volume."
  }
];

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
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Request a quote</p>
        <h1>Tell us what you need to source from Vietnam.</h1>
        <p>
          Send a quick brief — product, quantity, destination — and we'll come back
          within one working day with a sourcing plan and indicative timeline.
        </p>
      </section>

      <section className="split">
        <form action={createPublicInquiry} className="page-card request-form">
          {statusMessage ? (
            <p className={`form-status ${statusMessage.tone}`}>{statusMessage.text}</p>
          ) : null}

          <input name="product_slug" type="hidden" value={selectedProduct?.slug ?? ""} />

          <label>
            Full name
            <input name="full_name" placeholder="Anna Lee" required />
          </label>
          <label>
            Work email
            <input name="email" placeholder="you@company.com" required type="email" />
          </label>
          <label>
            Company
            <input name="company_name" placeholder="Company name" required />
          </label>
          <label>
            Destination country
            <input name="country" placeholder="Germany" required />
          </label>
          <label>
            Product of interest
            <select defaultValue={selectedCategory} name="category" required>
              <option value="" disabled>Select category</option>
              {catalogue.categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Product requirement
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
          <label>
            Additional notes (optional)
            <textarea
              name="message"
              rows={4}
              placeholder="Packing, certifications needed (FSC / BSCI / etc.), lead time, anything else we should know…"
            />
          </label>
          <SubmitButton pendingLabel="Sending...">Send request</SubmitButton>
          <p className="form-note">
            Prefer to write directly? Email{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a> or message us on{" "}
            <a
              href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>.
          </p>
        </form>

        <aside className="page-card">
          <h2>What happens next</h2>
          <ol className="check-list ordered">
            <li><strong>Within 1 working day</strong> — we send a sourcing plan: which factory, indicative price band, lead time, certification options.</li>
            <li><strong>Sample &amp; spec lock-in</strong> — we ship a sample (cost credited against first order) and confirm the spec sheet.</li>
            <li><strong>Quotation &amp; LOI</strong> — formal quote, partner factory disclosed, payment terms agreed.</li>
            <li><strong>Production &amp; QC</strong> — third-party pre-shipment inspection before B/L.</li>
            <li><strong>Shipment</strong> — Hai Phong / HCMC / Cai Mep, transit + documents tracked end-to-end.</li>
          </ol>

          <h2 style={{ marginTop: 28 }}>Why buyers choose 5B</h2>
          <div className="detail-list">
            {trustPoints.map((p) => (
              <div key={p.title}>
                <strong>{p.title}</strong>
                <p>{p.body}</p>
              </div>
            ))}
          </div>

          <p className="muted" style={{ marginTop: 20 }}>
            Want a full account to track requests, quotes, and orders in one place?{" "}
            <Link className="auth-link" href="/register">Create a free buyer account →</Link>
          </p>
        </aside>
      </section>
    </div>
  );
}
