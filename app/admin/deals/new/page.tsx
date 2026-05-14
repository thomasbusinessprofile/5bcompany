import Link from "next/link";
import { listCompanies, listContacts, listDealStages } from "../../../shared/crm-data";
import { saveDeal } from "../../pipeline/actions";

export const metadata = { title: "New deal | Admin", robots: { index: false } };

export default async function NewDealPage() {
  const [stages, companies, contacts] = await Promise.all([listDealStages(), listCompanies(), listContacts()]);
  const leadStage = stages.find((s) => s.name === "Lead") ?? stages[0];

  return (
    <div className="page-shell">
      <p className="eyebrow"><Link href="/admin/pipeline">← Back to pipeline</Link></p>
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Deal</p>
        <h1>New deal</h1>
      </section>
      <form action={saveDeal} className="page-card request-form">
        <label>Title <input name="title" required placeholder="Bamboo fence — Hagebau Q3 reorder" /></label>
        <label>
          Stage
          <select name="stage_id" defaultValue={leadStage?.id} required>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          Company
          <select name="company_id" defaultValue="">
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.country ? ` · ${c.country}` : ""}</option>
            ))}
          </select>
        </label>
        <label>
          Primary contact
          <select name="contact_id" defaultValue="">
            <option value="">—</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}{c.companyName ? ` · ${c.companyName}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>Deal value (USD) <input name="value_usd" type="number" step="100" placeholder="25000" /></label>
        <label>Expected close <input name="expected_close_date" type="date" /></label>
        <label>Product summary <input name="product_summary" placeholder="1 × 40HQ bamboo fence rolls, 1.8m" /></label>
        <label>Source <input name="source" placeholder="referral / RFQ / trade show" /></label>
        <button className="primary-link" type="submit">Create deal</button>
      </form>
    </div>
  );
}
