import Link from "next/link";
import { listCompanies } from "../../shared/crm-data";
import { saveCompany } from "./actions";

export const dynamic = "force-dynamic";
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
        <p className="eyebrow">Companies</p>
        <h1>Companies ({companies.length})</h1>
        <p>Buyer companies and partner factories. Auto-created from RFQ submissions when the company name is provided.</p>
      </section>

      {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}

      <div className="crm-toolbar">
        <form className="search-bar" method="get">
          <input
            defaultValue={q ?? ""}
            name="q"
            placeholder="Search name or country…"
            type="search"
          />
          <button className="secondary-link" type="submit">Search</button>
          {q ? <Link className="ghost-link" href="/admin/companies">Clear</Link> : null}
        </form>
        <a className="primary-link" href="#add-company">+ Add company</a>
      </div>

      <section className="page-card crm-table-card">
        {companies.length === 0 ? (
          <div className="empty-state">
            <h2>{q ? "No matches" : "No companies yet"}</h2>
            <p>
              {q ? (
                <Link className="auth-link" href="/admin/companies">Clear search →</Link>
              ) : (
                "RFQ submissions create companies automatically. Or add one manually below."
              )}
            </p>
          </div>
        ) : (
          <div className="crm-table">
            <div className="crm-table-head company-row">
              <span>Name</span>
              <span>Country</span>
              <span>Industry</span>
              <span>Contacts</span>
            </div>
            {companies.map((c) => (
              <Link className="crm-table-row company-row" href={`/admin/companies/${c.id}`} key={c.id}>
                <span><strong>{c.name}</strong></span>
                <span className="muted">{c.country ?? "—"}</span>
                <span className="muted truncate">{c.industry ?? "—"}</span>
                <span className="muted">{c.contactCount ?? 0}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <details className="crm-add-form" id="add-company">
        <summary>+ Add company manually</summary>
        <form action={saveCompany} className="page-card request-form">
          <h2 className="rfq-section-title">New company</h2>
          <div className="rfq-row">
            <label>
              Name *
              <input name="name" placeholder="Hagebau GmbH" required />
            </label>
            <label>
              Country
              <input name="country" placeholder="Germany" />
            </label>
          </div>
          <div className="rfq-row">
            <label>
              Website
              <input name="website" placeholder="https://…" type="url" />
            </label>
            <label>
              Industry
              <input name="industry" placeholder="Garden retail" />
            </label>
          </div>
          <label>
            Size band
            <select defaultValue="" name="size_band">
              <option value="">—</option>
              <option>SMB &lt;50</option>
              <option>Mid 50–500</option>
              <option>Enterprise 500+</option>
            </select>
          </label>
          <label>
            Notes
            <textarea name="notes" rows={3} />
          </label>
          <button className="primary-link" type="submit">Save company</button>
        </form>
      </details>
    </div>
  );
}
