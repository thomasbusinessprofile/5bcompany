import Link from "next/link";
import { listCompanies } from "../../shared/crm-data";
import { tA } from "../../lib/i18n";
import { saveCompany } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Companies | Admin | 5B Trading", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

function flash(status?: string) {
  if (status === "saved") return { tone: "success", text: tA("Company saved.") };
  if (status === "deleted") return { tone: "success", text: tA("Company deleted.") };
  if (status === "missing-fields") return { tone: "error", text: tA("Company name is required.") };
  if (status === "save-error") return { tone: "error", text: tA("Save failed.") };
  return null;
}

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const { q, status } = await searchParams;
  const companies = await listCompanies(q);
  const message = flash(status);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">{tA("Companies")}</p>
        <h1>{tA("Companies")} ({companies.length})</h1>
        <p>Công ty bên mua và nhà máy đối tác. Tự tạo từ RFQ khi có tên công ty.</p>
      </section>

      {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}

      <div className="crm-toolbar">
        <form className="search-bar" method="get">
          <input
            defaultValue={q ?? ""}
            name="q"
            placeholder={tA("Search name or country…")}
            type="search"
          />
          <button className="secondary-link" type="submit">{tA("Search")}</button>
          {q ? <Link className="ghost-link" href="/admin/companies">{tA("Clear")}</Link> : null}
        </form>
        <a className="primary-link" href="#add-company">{tA("+ Add company")}</a>
      </div>

      <section className="page-card crm-table-card">
        {companies.length === 0 ? (
          <div className="empty-state">
            <h2>{q ? tA("No matches") : tA("No companies yet")}</h2>
            <p>
              {q ? (
                <Link className="auth-link" href="/admin/companies">{tA("Clear")} →</Link>
              ) : (
                "RFQ tự động tạo công ty. Hoặc thêm thủ công bên dưới."
              )}
            </p>
          </div>
        ) : (
          <div className="crm-table">
            <div className="crm-table-head company-row">
              <span>{tA("Name")}</span>
              <span>{tA("Country")}</span>
              <span>{tA("Industry")}</span>
              <span>{tA("Contacts")}</span>
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
        <summary>{tA("Add company manually")}</summary>
        <form action={saveCompany} className="page-card request-form">
          <h2 className="rfq-section-title">{tA("New company")}</h2>
          <div className="rfq-row">
            <label>
              {tA("Name")} *
              <input name="name" placeholder="Hagebau GmbH" required />
            </label>
            <label>
              {tA("Country")}
              <input name="country" placeholder="Germany" />
            </label>
          </div>
          <div className="rfq-row">
            <label>
              {tA("Website")}
              <input name="website" placeholder="https://…" type="url" />
            </label>
            <label>
              {tA("Industry")}
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
            {tA("Notes")}
            <textarea name="notes" rows={3} />
          </label>
          <button className="primary-link" type="submit">{tA("Save company")}</button>
        </form>
      </details>
    </div>
  );
}
