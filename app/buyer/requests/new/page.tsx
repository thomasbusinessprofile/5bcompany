import Link from "next/link";
import { createBuyerSourcingRequest } from "./actions";
import { getCatalogueData } from "../../../shared/catalogue";

export const metadata = {
  title: "New Sourcing Request | 5B Trading",
  description: "Create a structured sourcing request from the buyer portal."
};

type NewBuyerRequestPageProps = {
  searchParams: Promise<{ status?: string }>;
};

function getMessage(status?: string) {
  if (status === "missing-fields") {
    return { tone: "error", text: "Please enter a request title and product of interest." };
  }

  if (status === "submit-error") {
    return { tone: "error", text: "Request could not be created. Please check your profile and try again." };
  }

  return null;
}

export default async function NewBuyerRequestPage({ searchParams }: NewBuyerRequestPageProps) {
  const { status } = await searchParams;
  const message = getMessage(status);
  const { categories, products } = await getCatalogueData();

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">New Sourcing Request</p>
        <h1>Create a structured sourcing request</h1>
        <p>
          Buyer portal requests now store in Supabase as sourcing requests with
          status `new`, ready for admin review and later AI structuring.
        </p>
      </section>
      <section className="split">
        <form action={createBuyerSourcingRequest} className="page-card request-form">
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <label>
            Request title
            <input name="title" placeholder="Example: Bamboo fence for garden retail" required />
          </label>
          <label>
            Product category
            <select defaultValue="" name="category_slug">
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product of interest
            <select defaultValue="" name="product_slug">
              <option value="" disabled>
                Select product
              </option>
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product name or custom requirement
            <input name="product_name" placeholder="Example: bamboo fence roll" required />
          </label>
          <label>
            Description
            <textarea name="description" placeholder="Describe product size, use case, reference style, or buying program..." />
          </label>
          <label>
            Target quantity
            <input min="0" name="target_quantity" placeholder="Example: 10000" step="0.01" type="number" />
          </label>
          <label>
            Unit
            <input name="unit" placeholder="pcs / rolls / kg / 40HQ" />
          </label>
          <label>
            Destination country
            <input name="destination_country" placeholder="Example: Germany" />
          </label>
          <label>
            Destination port
            <input name="destination_port" placeholder="Example: Hamburg" />
          </label>
          <label>
            Incoterm
            <select defaultValue="" name="incoterm">
              <option value="" disabled>
                Select incoterm
              </option>
              <option value="FOB">FOB</option>
              <option value="CFR">CFR</option>
              <option value="CIF">CIF</option>
              <option value="EXW discussion">EXW discussion</option>
            </select>
          </label>
          <label>
            Packing requirement
            <textarea name="packing_requirement" placeholder="Retail label, pallet packing, carton marks, private label..." />
          </label>
          <label>
            Quality requirement
            <textarea name="quality_requirement" placeholder="Inspection, tolerance, lab data, finish, sample expectations..." />
          </label>
          <label>
            Document requirement
            <textarea name="document_requirement" placeholder="CO, fumigation, phytosanitary, lab report if applicable..." />
          </label>
          <label>
            Target price
            <input min="0" name="target_price" placeholder="Optional target price" step="0.01" type="number" />
          </label>
          <label>
            Timeline
            <input name="timeline" placeholder="Example: quotation this week, shipment in July" />
          </label>
          <button aria-describedby="new-request-note" className="primary-link" type="submit">
            Create sourcing request
          </button>
          <p className="form-note" id="new-request-note">
            AI will structure the request in a later step. It will not quote,
            promise stock, or commit lead time.
          </p>
        </form>
        <aside className="page-card">
          <h2>Smart Request Helper</h2>
          <p>
            MVP AI should only structure the summary, detect missing fields, and
            suggest buyer questions. It must not quote or promise supply.
          </p>
          <ul className="check-list">
            <li>Missing field detection</li>
            <li>Structured admin summary</li>
            <li>Suggested buyer questions</li>
          </ul>
          <div className="cta-row">
            <Link className="secondary-link" href="/buyer/requests">
              Back to requests
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
