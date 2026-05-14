import Link from "next/link";
import { notFound } from "next/navigation";
import { getContactById, getContactInquiries, listCompanies } from "../../../shared/crm-data";
import { deleteContact, saveContact } from "../actions";

export const metadata = { title: "Contact | Admin", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string }> };

export default async function ContactDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status } = await searchParams;
  const [contact, inquiries, companies] = await Promise.all([
    getContactById(id),
    getContactInquiries(id),
    listCompanies()
  ]);
  if (!contact) notFound();

  return (
    <div className="page-shell">
      <p className="eyebrow"><Link href="/admin/contacts">← Back to contacts</Link></p>
      <section className="section-title wide-title">
        <p className="eyebrow">Contact</p>
        <h1>{contact.fullName}</h1>
        <p className="muted">
          {contact.roleTitle ? `${contact.roleTitle} · ` : ""}
          {contact.companyName ?? "Unassigned company"}
        </p>
      </section>

      {status === "saved" ? <p className="form-status success">Contact saved.</p> : null}

      <section className="split">
        <form action={saveContact} className="page-card request-form">
          <h2>Edit details</h2>
          <input name="contact_id" type="hidden" value={contact.id} />
          <label>
            Full name
            <input name="full_name" defaultValue={contact.fullName} required />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={contact.email ?? ""} />
          </label>
          <label>
            Company
            <select name="company_id" defaultValue={contact.companyId ?? ""}>
              <option value="">— Unassigned —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.country ? ` · ${c.country}` : ""}</option>
              ))}
            </select>
          </label>
          <label>
            Role / title
            <input name="role_title" defaultValue={contact.roleTitle ?? ""} />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={contact.phone ?? ""} />
          </label>
          <label>
            WhatsApp
            <input name="whatsapp" defaultValue={contact.whatsapp ?? ""} />
          </label>
          <label>
            Source
            <input name="source" defaultValue={contact.source ?? ""} />
          </label>
          <label>
            Notes
            <textarea name="notes" rows={4} defaultValue={contact.notes ?? ""} />
          </label>
          <button className="primary-link" type="submit">Save changes</button>
        </form>

        <aside className="page-card">
          <h2>Inquiries ({inquiries.length})</h2>
          <div className="table-list">
            {inquiries.length === 0 ? (
              <p className="muted">No RFQs from this contact yet.</p>
            ) : (
              inquiries.map((inq) => (
                <Link
                  className="table-row"
                  href={`/admin/requests/${inq.id}`}
                  key={inq.id}
                >
                  <span>{inq.product_name ?? "—"}</span>
                  <span className="muted">{inq.quantity ?? "—"}</span>
                  <span>{inq.status}</span>
                  <span className="muted">{new Date(inq.created_at).toLocaleDateString()}</span>
                </Link>
              ))
            )}
          </div>

          <h2 style={{ marginTop: 28 }}>Quick actions</h2>
          <div className="cta-row">
            {contact.email ? (
              <a className="secondary-link" href={`mailto:${contact.email}`}>Email</a>
            ) : null}
            {contact.whatsapp ? (
              <a
                className="secondary-link"
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>
            ) : null}
          </div>

          <form action={deleteContact} style={{ marginTop: 24 }}>
            <input name="contact_id" type="hidden" value={contact.id} />
            <button className="ghost-link danger" type="submit">Delete contact</button>
          </form>
        </aside>
      </section>
    </div>
  );
}
