import Link from "next/link";
import { listCompanies } from "../../shared/crm-data";
import { saveCompany } from "./actions";

export const metadata = { title: "Companies | Admin | 5B Trading", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

function flash(status?: string) {
  if (status === "saved") return { tone: "success", text: "Company saved." };
  if (status === "deleted") return { tone: "success", text: "Company deleted." };
  if (status === "missing-fields") return { tone: "error", text: "Company name is required." };
  if (status === "save-error") return { tone: "error", text: "Save failed." };
  return null;
}

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const { q, status } = await searchParams;
  const companies = await listCompanies(q);
  const message = flash(status);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Companies</p>
        <h1>Companies ({companies.length})</h1>
        <p>Buyer companies and partner factories. Auto-created from RFQ submissions when the company name is provided.</p>
      </section>

      <section className="split">
        <form action={saveCompany} className="page-card request-form">
          <h2>Add company</h2>
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <label>Name <input name="name" required /></label>
          <label>Country <input name="country" placeholder="Germany" /></label>
          <label>Website <input name="website" type="url" placeholder="https://…" /></label>
          <label>Industry <input name="industry" placeholder="Garden retail / Packaging distribution" /></label>
          <label>
            Size band
            <select name="size_band" defaultValue="">
              <option value="">—</option>
              <option>SMB &lt;50</option>
              <option>Mid 50–500</option>
              <option>Enterprise 500+</option>
            </select>
          </label>
          <label>Notes <textarea name="notes" rows={3} /></label>
          <button className="primary-link" type="submit">Save company</button>
        </form>

        <aside className="page-card">
          <form className="search-bar">
            <input name="q" defaultValue={q ?? ""} placeholder="Search name or country…" />
            <button className="secondary-link" type="submit">Search</button>
          </form>
          <div className="table-list">
            {companies.length === 0 ? (
              <p className="muted">No companies yet.</p>
            ) : (
              companies.map((c) => (
                <Link className="table-row" href={`/admin/companies/${c.id}`} key={c.id}>
                  <strong>{c.name}</strong>
                  <span className="muted">{c.country ?? "—"}</span>
                  <span className="muted">{c.contactCount ?? 0} contacts</span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
