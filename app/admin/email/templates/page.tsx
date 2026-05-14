import Link from "next/link";
import { getEmailTemplateById, listEmailTemplates } from "../../../shared/crm-data";
import { deleteEmailTemplate, saveEmailTemplate } from "../actions";

export const metadata = { title: "Email templates | Admin", robots: { index: false } };

type Props = { searchParams: Promise<{ edit?: string; status?: string }> };

function flash(status?: string) {
  if (status === "saved") return { tone: "success", text: "Template saved." };
  if (status === "deleted") return { tone: "success", text: "Template deleted." };
  if (status === "missing-fields") return { tone: "error", text: "Name and subject are required." };
  if (status === "save-error") return { tone: "error", text: "Save failed." };
  return null;
}

export default async function EmailTemplatesPage({ searchParams }: Props) {
  const { edit, status } = await searchParams;
  const [templates, editing] = await Promise.all([
    listEmailTemplates(),
    edit ? getEmailTemplateById(edit) : Promise.resolve(null)
  ]);
  const message = flash(status);

  return (
    <div className="page-shell">
      <p className="eyebrow"><Link href="/admin/email/compose">← Back to compose</Link></p>
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Email templates</p>
        <h1>Templates ({templates.length})</h1>
        <p>
          Reusable email bodies with <code>{`{{variable}}`}</code> placeholders. Stored in
          Supabase; available across the team.
        </p>
      </section>

      <section className="split">
        <form action={saveEmailTemplate} className="page-card request-form">
          <h2>{editing ? "Edit template" : "New template"}</h2>
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <input name="template_id" type="hidden" value={editing?.id ?? ""} />
          <label>Name <input name="name" defaultValue={editing?.name ?? ""} required /></label>
          <label>
            Subject
            <input name="subject" defaultValue={editing?.subject ?? ""} required />
          </label>
          <label>
            Body (plain text)
            <textarea name="body_text" rows={10} defaultValue={editing?.bodyText ?? ""} />
          </label>
          <label>
            Body (HTML — optional)
            <textarea name="body_html" rows={6} defaultValue={editing?.bodyHtml ?? ""} />
          </label>
          <label>
            Variables (comma-separated)
            <input
              name="variables"
              defaultValue={editing?.variables.join(", ") ?? "first_name, product_name"}
              placeholder="first_name, product_name, quantity"
            />
          </label>
          <button className="primary-link" type="submit">Save template</button>
          {editing ? (
            <Link className="ghost-link" href="/admin/email/templates" style={{ marginTop: 8 }}>
              Cancel edit
            </Link>
          ) : null}
        </form>

        <aside className="page-card">
          <h2>Templates</h2>
          <div className="table-list">
            {templates.length === 0 ? (
              <p className="muted">No templates yet.</p>
            ) : (
              templates.map((t) => (
                <div className="table-row" key={t.id}>
                  <Link className="row-link" href={`/admin/email/templates?edit=${t.id}`}>
                    <strong>{t.name}</strong>
                  </Link>
                  <span className="muted">{t.subject}</span>
                  <form action={deleteEmailTemplate}>
                    <input name="template_id" type="hidden" value={t.id} />
                    <button className="ghost-link danger" type="submit" aria-label="Delete template">×</button>
                  </form>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
