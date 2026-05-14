import Link from "next/link";
import { listContractTemplates } from "../../../lib/contracts/data";
import { listCompanies, listContacts } from "../../../shared/crm-data";
import { CONTRACT_TYPE_LABEL, type ContractType } from "../../../lib/contracts/types";
import { createContract } from "../actions";
import { LineItemsEditor } from "../LineItemsEditor";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "New contract | Admin", robots: { index: false } };

type Props = { searchParams: Promise<{ deal?: string; contact?: string; type?: string; status?: string; message?: string }> };

const TYPES: ContractType[] = ["loi", "sample", "proforma", "sales", "distribution"];

function flash(status?: string, message?: string) {
  if (status === "missing-fields") return { tone: "error", text: "Buyer legal name is required." };
  if (status === "save-error") return { tone: "error", text: message ? `Save failed: ${message}` : "Save failed. Check the server logs for details." };
  return null;
}

export default async function NewContractPage({ searchParams }: Props) {
  const { deal: dealId, contact: contactId, type: prefType, status, message } = await searchParams;
  const banner = flash(status, message);
  const [templates, companies, contacts] = await Promise.all([
    listContractTemplates(),
    listCompanies(),
    listContacts()
  ]);

  let prefilledContact: Awaited<ReturnType<typeof listContacts>>[number] | undefined;
  let prefilledCompany: Awaited<ReturnType<typeof listCompanies>>[number] | undefined;

  if (contactId) {
    prefilledContact = contacts.find((c) => c.id === contactId);
  }
  if (dealId) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("crm_deals")
        .select("contact_id, company_id, value_usd, product_summary")
        .eq("id", dealId)
        .maybeSingle();
      if (data) {
        if (!prefilledContact) {
          prefilledContact = contacts.find((c) => c.id === data.contact_id);
        }
        prefilledCompany = companies.find((c) => c.id === data.company_id);
      }
    }
  }
  if (prefilledContact && !prefilledCompany) {
    prefilledCompany = companies.find((c) => c.id === prefilledContact!.companyId);
  }

  const defaultType: ContractType = TYPES.includes(prefType as ContractType)
    ? (prefType as ContractType)
    : "loi";
  const templatesByType = templates.filter((t) => t.type === defaultType);
  const initialTemplate = templatesByType[0];

  return (
    <div className="page-shell">
      <p className="eyebrow">
        <Link href="/admin/contracts">← Back to contracts</Link>
      </p>
      <section className="section-title wide-title">
        <p className="eyebrow">New contract</p>
        <h1>Generate a contract</h1>
        <p>Pick a template, fill counterparty + line items, then preview or send.</p>
      </section>

      <form action={createContract} className="page-card request-form">
        {banner ? <p className={`form-status ${banner.tone}`}>{banner.text}</p> : null}
        <input name="deal_id" type="hidden" value={dealId ?? ""} />

        <h2 className="rfq-section-title">Type & template</h2>
        <div className="rfq-row">
          <label>
            Contract type
            <select defaultValue={defaultType} name="type" required>
              {TYPES.map((t) => (
                <option key={t} value={t}>{CONTRACT_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </label>
          <label>
            Template
            <select defaultValue={initialTemplate?.id ?? ""} name="template_id">
              <option value="">— Custom (write your own terms below) —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({CONTRACT_TYPE_LABEL[t.type]})
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="rfq-section-title">Counterparty (Buyer)</h2>
        <div className="rfq-row">
          <label>
            Legal name *
            <input
              defaultValue={prefilledCompany?.name ?? ""}
              name="buyer_legal_name"
              placeholder="Company GmbH"
              required
            />
          </label>
          <label>
            Tax ID
            <input name="buyer_tax_id" placeholder="DE123456789" />
          </label>
        </div>
        <label>
          Address
          <input
            defaultValue={prefilledCompany?.country ? `, ${prefilledCompany.country}` : ""}
            name="buyer_address"
            placeholder="Street, City, Country"
          />
        </label>
        <div className="rfq-row">
          <label>
            Signer name
            <input
              defaultValue={prefilledContact?.fullName ?? ""}
              name="buyer_signer_name"
              placeholder="Anna Lee"
            />
          </label>
          <label>
            Signer title
            <input
              defaultValue={prefilledContact?.roleTitle ?? ""}
              name="buyer_signer_title"
              placeholder="Procurement Manager"
            />
          </label>
        </div>
        <label>
          Signer email
          <input
            defaultValue={prefilledContact?.email ?? ""}
            name="buyer_signer_email"
            placeholder="anna@company.com"
            type="email"
          />
        </label>
        <input name="contact_id" type="hidden" value={prefilledContact?.id ?? ""} />
        <input name="company_id" type="hidden" value={prefilledCompany?.id ?? ""} />

        <h2 className="rfq-section-title">Commercial terms</h2>
        <div className="rfq-row">
          <label>
            Currency
            <select defaultValue="USD" name="currency">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>VND</option>
              <option>JPY</option>
            </select>
          </label>
          <label>
            Tax %
            <input defaultValue="0" name="tax_pct" step="any" type="number" />
          </label>
        </div>
        <div className="rfq-row">
          <label>
            Incoterm
            <input
              defaultValue={initialTemplate?.defaultIncoterm ?? "FOB Hai Phong"}
              name="incoterm"
              placeholder="FOB Hai Phong"
            />
          </label>
          <label>
            Validity until
            <input
              defaultValue={
                initialTemplate
                  ? new Date(Date.now() + initialTemplate.defaultValidityDays * 86400000)
                      .toISOString()
                      .slice(0, 10)
                  : ""
              }
              name="validity_until"
              type="date"
            />
          </label>
        </div>
        <label>
          Payment terms
          <input
            defaultValue={initialTemplate?.defaultPaymentTerms ?? ""}
            name="payment_terms"
            placeholder="30% T/T deposit, 70% against B/L copy"
          />
        </label>
        <label>
          Delivery window
          <input name="delivery_window" placeholder="Within 45 days from deposit" />
        </label>

        <h2 className="rfq-section-title">Line items</h2>
        <LineItemsEditor currency="USD" />

        <h2 className="rfq-section-title">Terms (override template)</h2>
        <label>
          Terms HTML (leave blank to use template above as-is)
          <textarea
            name="terms_html"
            placeholder="Optional custom terms HTML. Supports {{variables}} from the template."
            rows={6}
          />
        </label>

        <button className="primary-link" type="submit">Create draft</button>
      </form>
    </div>
  );
}
