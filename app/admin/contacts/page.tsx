import Link from "next/link";
import { listContacts, listCompanies } from "../../shared/crm-data";
import { saveContact } from "./actions";

export const metadata = { title: "Contacts | Admin | 5B Trading", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

function flash(status?: string) {
  if (status === "saved") return { tone: "success", text: "Contact saved." };
  if (status === "deleted") return { tone: "success", text: "Contact deleted." };
  if (status === "missing-fields") return { tone: "error", text: "Full name is required." };
  if (status === "save-error") return { tone: "error", text: "Save failed. Check permissions." };
  return null;
}

export default async function AdminContactsPage({ searchParams }: Props) {
  const { q, status } = await searchParams;
  const [contacts, companies] = await Promise.all([listContacts(q), listCompanies()]);
  const message = flash(status);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Contacts</p>
        <h1>Contacts ({contacts.length})</h1>
        <p>Every buyer and prospect we have a conversation with. RFQ submissions auto-create a contact via the inquiry trigger.</p>
      </section>

      <section className="split">
        <form action={saveContact} className="page-card request-form">
          <h2>Add contact</h2>
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <label>
            Full name
            <input name="full_name" required placeholder="Anna Lee" />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="anna@company.com" />
          </label>
          <label>
            Company
            <select name="company_id" defaultValue="">
              <option value="">— Unassigned —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.country ? ` · ${c.country}` : ""}</option>
              ))}
            </select>
          </label>
          <label>
            Role / title
            <input name="role_title" placeholder="Procurement Manager" />
          </label>
          <label>
            Phone
            <input name="phone" placeholder="+49…" />
          </label>
          <label>
            WhatsApp
            <input name="whatsapp" placeholder="+49…" />
          </label>
          <label>
            Source
            <input name="source" placeholder="referral / linkedin / trade show" />
          </label>
          <label>
            Notes
            <textarea name="notes" rows={3} />
          </label>
          <button className="primary-link" type="submit">Save contact</button>
        </form>

        <aside className="page-card">
          <form className="search-bar">
            <input name="q" defaultValue={q ?? ""} placeholder="Search name or email…" />
            <button className="secondary-link" type="submit">Search</button>
          </form>
          <div className="table-list">
            {contacts.length === 0 ? (
              <p className="muted">No contacts yet.</p>
            ) : (
              contacts.map((contact) => (
                <Link className="table-row contact-row" href={`/admin/contacts/${contact.id}`} key={contact.id}>
                  <div>
                    <strong>{contact.fullName}</strong>
                    {contact.companyName ? <span className="muted"> · {contact.companyName}</span> : null}
                  </div>
                  <span className="muted">{contact.email ?? "—"}</span>
                  <span className="muted">
                    {contact.lastContactedAt
                      ? new Date(contact.lastContactedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
