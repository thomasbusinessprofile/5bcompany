import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyById, getCompanyContacts } from "../../../shared/crm-data";
import { deleteCompany, saveCompany } from "../actions";

export const metadata = { title: "Company | Admin", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string }> };

export default async function CompanyDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status } = await searchParams;
  const [company, contacts] = await Promise.all([getCompanyById(id), getCompanyContacts(id)]);
  if (!company) notFound();

  return (
    <div className="page-shell">
      <p className="eyebrow"><Link href="/admin/companies">← Back to companies</Link></p>
      <section className="section-title wide-title">
        <p className="eyebrow">Company</p>
        <h1>{company.name}</h1>
        <p className="muted">{company.country ?? "—"}{company.industry ? ` · ${company.industry}` : ""}</p>
      </section>

      {status === "saved" ? <p className="form-status success">Company saved.</p> : null}

      <section className="split">
        <form action={saveCompany} className="page-card request-form">
          <h2>Edit details</h2>
          <input name="company_id" type="hidden" value={company.id} />
          <label>Name <input name="name" defaultValue={company.name} required /></label>
          <label>Country <input name="country" defaultValue={company.country ?? ""} /></label>
          <label>Website <input name="website" type="url" defaultValue={company.website ?? ""} /></label>
          <label>Industry <input name="industry" defaultValue={company.industry ?? ""} /></label>
          <label>
            Size band
            <select name="size_band" defaultValue={company.sizeBand ?? ""}>
              <option value="">—</option>
              <option>SMB &lt;50</option>
              <option>Mid 50–500</option>
              <option>Enterprise 500+</option>
            </select>
          </label>
          <label>Notes <textarea name="notes" rows={4} defaultValue={company.notes ?? ""} /></label>
          <button className="primary-link" type="submit">Save changes</button>
          <form action={deleteCompany} style={{ marginTop: 12 }}>
            <input name="company_id" type="hidden" value={company.id} />
            <button className="ghost-link danger" type="submit">Delete company</button>
          </form>
        </form>

        <aside className="page-card">
          <h2>Contacts ({contacts.length})</h2>
          <div className="table-list">
            {contacts.length === 0 ? (
              <p className="muted">No contacts linked yet.</p>
            ) : (
              contacts.map((c) => (
                <Link className="table-row" href={`/admin/contacts/${c.id}`} key={c.id}>
                  <strong>{c.fullName}</strong>
                  <span className="muted">{c.email ?? "—"}</span>
                  <span className="muted">{c.roleTitle ?? "—"}</span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
