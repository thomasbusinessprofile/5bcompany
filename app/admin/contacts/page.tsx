import Link from "next/link";
import { listContacts, listCompanies } from "../../shared/crm-data";
import { saveContact } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contacts | Admin | 5B Trading", robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

function flash(status?: string) {
  if (status === "saved") return { tone: "success", text: "Contact saved." };
  if (status === "deleted") return { tone: "success", text: "Contact deleted." };
  if (status === "missing-fields") return { tone: "error", text: "Full name is required." };
  if (status === "save-error") return { tone: "error", text: "Save failed. Check permissions." };
  return null;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

export default async function AdminContactsPage({ searchParams }: Props) {
  const { q, status } = await searchParams;
  const [contacts, companies] = await Promise.all([listContacts(q), listCompanies()]);
  const message = flash(status);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Contacts</p>
        <h1>Contacts ({contacts.length})</h1>
        <p>Every buyer and prospect we have a conversation with. RFQ submissions auto-create a contact via the inquiry trigger.</p>
      </section>

      {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}

      {/* Toolbar: search + add new */}
      <div className="crm-toolbar">
        <form className="search-bar" method="get">
          <input
            defaultValue={q ?? ""}
            name="q"
            placeholder="Search name or email…"
            type="search"
          />
          <button className="secondary-link" type="submit">Search</button>
          {q ? <Link className="ghost-link" href="/admin/contacts">Clear</Link> : null}
        </form>
        <a className="primary-link" href="#add-contact">+ Add contact</a>
      </div>

      {/* List — full width, compact rows */}
      <section className="page-card crm-table-card">
        {contacts.length === 0 ? (
          <div className="empty-state">
            <h2>{q ? "No matches" : "No contacts yet"}</h2>
            <p>
              {q ? (
                <Link className="auth-link" href="/admin/contacts">Clear search →</Link>
              ) : (
                "RFQ submissions create contacts automatically. Or add one manually below."
              )}
            </p>
          </div>
        ) : (
          <div className="crm-table">
            <div className="crm-table-head">
              <span>Name</span>
              <span>Company</span>
              <span>Email</span>
              <span>Last contact</span>
            </div>
            {contacts.map((contact) => (
              <Link className="crm-table-row" href={`/admin/contacts/${contact.id}`} key={contact.id}>
                <span>
                  <strong>{contact.fullName}</strong>
                  {contact.roleTitle ? <small className="muted">{contact.roleTitle}</small> : null}
                </span>
                <span className="muted">{contact.companyName ?? "—"}</span>
                <span className="muted truncate">{contact.email ?? "—"}</span>
                <span className="muted">{fmtDate(contact.lastContactedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Add form — collapsed by default to keep list scannable */}
      <details className="crm-add-form" id="add-contact">
        <summary>+ Add contact manually</summary>
        <form action={saveContact} className="page-card request-form">
          <h2 className="rfq-section-title">New contact</h2>
          <div className="rfq-row">
            <label>
              Full name *
              <input name="full_name" placeholder="Anna Lee" required />
            </label>
            <label>
              Email
              <input name="email" placeholder="anna@company.com" type="email" />
            </label>
          </div>
          <div className="rfq-row">
            <label>
              Company
              <select defaultValue="" name="company_id">
                <option value="">— Unassigned —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.country ? ` · ${c.country}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Role / title
              <input name="role_title" placeholder="Procurement Manager" />
            </label>
          </div>
          <div className="rfq-row">
            <label>
              Phone
              <input name="phone" placeholder="+49…" />
            </label>
            <label>
              WhatsApp
              <input name="whatsapp" placeholder="+49…" />
            </label>
          </div>
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
      </details>
    </div>
  );
}
