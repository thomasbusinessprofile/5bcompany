import Link from "next/link";
import { createPublicInquiry } from "./actions";
import { SubmitButton } from "../shared/SubmitButton";
import {
  getCatalogueData,
  getCatalogueProductBySlug,
  getCategoryNameFromList
} from "../shared/catalogue";

export const metadata = {
  title: "Create Request | 5B Trading",
  description:
    "Create a structured sourcing request with product, quantity, destination, packing, quality, document, and timeline details."
};

type RequestQuotePageProps = {
  searchParams: Promise<{ product?: string; status?: string }>;
};

function getStatusMessage(status?: string) {
  if (status === "submitted") {
    return {
      tone: "success",
      text: "Request received. Admin can now review it in the inquiry queue."
    };
  }

  if (status === "missing-fields") {
    return {
      tone: "error",
      text: "Please add your name, company, valid email, and product requirement before submitting."
    };
  }

  if (status === "submit-error") {
    return {
      tone: "error",
      text: "The request could not be submitted. Please try again."
    };
  }

  if (status === "config-error") {
    return {
      tone: "error",
      text: "Supabase is not configured for this environment."
    };
  }

  return null;
}

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
        <p className="eyebrow">New Sourcing Request</p>
        <h1>Structured request form</h1>
        <p>
          This public request entry captures the minimum sourcing data before the
          buyer portal, messaging, attachments, and AI helper are connected.
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
            <input name="full_name" placeholder="Example: Anna Lee" required />
          </label>
          <label>
            Email
            <input name="email" placeholder="anna@company.com" required type="email" />
          </label>
          <label>
            Company
            <input name="company_name" placeholder="Company name" required />
          </label>
          <label>
            Phone / WhatsApp
            <input name="phone" placeholder="+84..." />
          </label>
          <label>
            Product category
            <select defaultValue={selectedCategory} name="category">
              <option value="" disabled>
                Select category
              </option>
              {catalogue.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product requirement
            <input
              defaultValue={selectedProduct?.name ?? ""}
              name="product_name"
              placeholder="Example: bamboo fence roll"
              required
            />
          </label>
          <label>
            Target quantity
            <input name="quantity" placeholder="Example: 1 x 40HQ" />
          </label>
          <label>
            Destination country
            <input name="country" placeholder="Example: Germany" />
          </label>
          <label>
            Destination port
            <input name="destination_port" placeholder="Example: Hamburg" />
          </label>
          <label>
            Packing requirement
            <textarea name="packing_requirement" placeholder="Retail label, pallet packing, carton marks..." />
          </label>
          <label>
            Additional notes
            <textarea name="message" placeholder="Quality needs, document requirements, timeline..." />
          </label>
          <SubmitButton pendingLabel="Submitting...">Submit request</SubmitButton>
          <p className="form-note" id="request-submit-note">
            This creates a public RFQ inquiry. Buyer account request history will
            be connected in the portal step.
          </p>
        </form>
        <aside className="page-card">
          <h2>Smart Request Helper</h2>
          <p>
            Later, OpenRouter will help detect missing fields and create an
            admin summary. It will not quote, promise supply, or make commercial
            commitments.
          </p>
          <div className="detail-list">
            <div>
              <strong>Selected product</strong>
              <p>
                {selectedProduct
                  ? `${selectedProduct.name} - ${getCategoryNameFromList(catalogue.categories, selectedProduct.category)}`
                  : "Choose a product from the catalogue or describe a custom sourcing need."}
              </p>
            </div>
            <div>
              <strong>MVP AI model</strong>
              <p>nvidia/nemotron-3-super-120b-a12b:free via OpenRouter.</p>
            </div>
            <div>
              <strong>Fallback</strong>
              <p>Rule-based missing-field detection if AI is unavailable.</p>
            </div>
          </div>
          <div className="cta-row">
            <Link className="secondary-link" href="/register">
              Create buyer account
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
