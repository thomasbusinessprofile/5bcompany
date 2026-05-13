import Link from "next/link";
import { notFound } from "next/navigation";
import { sendQuotationToBuyer, updateQuotationDraft } from "./actions";
import { getQuotationById } from "../../../shared/quotation-data";

type AdminQuotationPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

function messageFor(status?: string) {
  if (status === "saved") {
    return { tone: "success", text: "Quotation draft saved." };
  }

  if (status === "sent") {
    return { tone: "success", text: "Quotation sent to buyer review." };
  }

  if (status === "save-error" || status === "send-error") {
    return { tone: "error", text: "Quotation could not be saved. Check permissions and try again." };
  }

  return null;
}

export async function generateMetadata({ params }: AdminQuotationPageProps) {
  const { id } = await params;
  const quotation = await getQuotationById(id);

  return {
    title: quotation ? `${quotation.quoteNumber} | Quotation Draft` : "Quotation not found"
  };
}

export default async function AdminQuotationPage({ params, searchParams }: AdminQuotationPageProps) {
  const { id } = await params;
  const { status } = await searchParams;
  const quotation = await getQuotationById(id);
  const message = messageFor(status);

  if (!quotation) {
    notFound();
  }

  const item = quotation.items[0];

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Quotation Draft</p>
        <h1>{quotation.quoteNumber}</h1>
        <p>
          Draft quotation for {quotation.requestTitle}. Final price, stock,
          lead time, and documents must be approved before sending to buyer.
        </p>
      </section>
      <section className="split">
        <form action={updateQuotationDraft} className="page-card request-form">
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <input name="quotation_id" type="hidden" value={quotation.id} />
          <input name="item_id" type="hidden" value={item?.id ?? ""} />
          <label>
            Currency
            <input defaultValue={quotation.currency} name="currency" />
          </label>
          <label>
            Incoterm
            <input defaultValue={quotation.incoterm} name="incoterm" placeholder="FOB / CIF / CFR..." />
          </label>
          <label>
            Payment terms
            <input defaultValue={quotation.paymentTerms} name="payment_terms" placeholder="Example: T/T 30% deposit, 70% before shipment" />
          </label>
          <label>
            Validity days
            <input defaultValue={quotation.validityDays} min="1" name="validity_days" type="number" />
          </label>
          <label>
            Lead time
            <input defaultValue={quotation.leadTime} name="lead_time" placeholder="Subject to production confirmation" />
          </label>
          <label>
            Product
            <input defaultValue={item?.productName ?? ""} name="product_name" />
          </label>
          <label>
            Description
            <textarea defaultValue={item?.description ?? ""} name="description" placeholder="Specification, packing, documents, conditions..." />
          </label>
          <label>
            Quantity
            <input defaultValue={item?.quantity || ""} min="0" name="quantity" step="0.01" type="number" />
          </label>
          <label>
            Unit
            <input defaultValue={item?.unit ?? ""} name="unit" placeholder="pcs / rolls / kg / container" />
          </label>
          <label>
            Unit price
            <input defaultValue={item?.unitPrice || ""} min="0" name="unit_price" step="0.01" type="number" />
          </label>
          <label>
            Notes
            <textarea defaultValue={quotation.notes} name="notes" />
          </label>
          <button className="primary-link" type="submit">
            Save draft
          </button>
        </form>
        <aside className="page-card">
          <h2>Draft summary</h2>
          <div className="detail-list">
            <div>
              <strong>Status</strong>
              <p>{quotation.status}</p>
            </div>
            <div>
              <strong>Subtotal</strong>
              <p>
                {quotation.currency} {quotation.subtotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <strong>Guardrail</strong>
              <p>Do not send this draft as an official quotation until approved.</p>
            </div>
          </div>
          <div className="cta-row">
            <form action={sendQuotationToBuyer}>
              <input name="quotation_id" type="hidden" value={quotation.id} />
              <button className="primary-link" type="submit">
                Send to buyer
              </button>
            </form>
            <Link className="secondary-link" href="/admin/requests">
              Back to requests
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
