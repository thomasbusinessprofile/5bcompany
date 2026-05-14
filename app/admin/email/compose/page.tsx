import Link from "next/link";
import {
  getContactById,
  getDealById,
  getEmailTemplateById,
  listContacts,
  listEmailTemplates
} from "../../../shared/crm-data";
import { sendComposedEmail } from "../actions";
import { TemplatePicker } from "./TemplatePicker";

export const metadata = { title: "Compose email | Admin", robots: { index: false } };

type Props = {
  searchParams: Promise<{
    contact?: string;
    deal?: string;
    template?: string;
    status?: string;
    message?: string;
  }>;
};

function flash(status?: string, message?: string) {
  if (status === "sent") return { tone: "success", text: "Email sent." };
  if (status === "missing-fields") return { tone: "error", text: "To, subject and body are required." };
  if (status === "send-failed") return { tone: "error", text: `Send failed: ${message ?? "unknown error"}` };
  return null;
}

export default async function ComposePage({ searchParams }: Props) {
  const { contact: contactId, deal: dealId, template: templateId, status, message } = await searchParams;
  const [templates, contacts, contact, deal, template] = await Promise.all([
    listEmailTemplates(),
    listContacts(),
    contactId ? getContactById(contactId) : Promise.resolve(null),
    dealId ? getDealById(dealId) : Promise.resolve(null),
    templateId ? getEmailTemplateById(templateId) : Promise.resolve(null)
  ]);

  const banner = flash(status, message);
  const hasApiKey = Boolean(process.env.RESEND_API_KEY);

  return (
    <div className="page-shell">
      <p className="eyebrow">
        <Link href="/admin/email/templates">Manage templates →</Link>
      </p>
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Email</p>
        <h1>Compose email</h1>
        <p>
          Templates support <code>{`{{first_name}}`}</code>, <code>{`{{full_name}}`}</code>,{" "}
          <code>{`{{company}}`}</code>, <code>{`{{product_name}}`}</code>, <code>{`{{quantity}}`}</code>.
        </p>
      </section>

      {!hasApiKey ? (
        <p className="form-status error">
          <strong>RESEND_API_KEY is not set.</strong> Add it in Vercel → Settings → Environment Variables
          before sending. Free tier covers 3 000 emails/month.
        </p>
      ) : null}
      {banner ? <p className={`form-status ${banner.tone}`}>{banner.text}</p> : null}

      <form action={sendComposedEmail} className="page-card request-form">
        <input name="deal_id" type="hidden" value={deal?.id ?? ""} />
        <input name="template_id" type="hidden" value={template?.id ?? ""} />

        <label>
          Template
          <TemplatePicker
            selected={template?.id ?? null}
            templates={templates.map((t) => ({ id: t.id, name: t.name }))}
          />
        </label>

        <label>
          To
          <input
            name="to"
            type="email"
            defaultValue={contact?.email ?? ""}
            placeholder="recipient@company.com"
            required
          />
        </label>
        <label>
          Recipient contact (links email to CRM record)
          <select name="contact_id" defaultValue={contact?.id ?? ""}>
            <option value="">— Standalone, no link —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} {c.email ? `· ${c.email}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="email-row">
          <label>
            CC
            <input name="cc" type="text" placeholder="optional, comma-separated" />
          </label>
          <label>
            BCC
            <input name="bcc" type="text" placeholder="optional" />
          </label>
        </div>

        <label>
          From
          <input
            name="from"
            type="text"
            defaultValue={process.env.RESEND_FROM_EMAIL ?? "5B Trading <hello@5bcompany.com>"}
          />
        </label>
        <label>
          Reply-to (optional)
          <input name="reply_to" type="email" placeholder="leave blank to use From" />
        </label>

        <label>
          Subject
          <input
            name="subject"
            required
            defaultValue={template?.subject ?? ""}
            placeholder="Subject line — supports {{variables}}"
          />
        </label>

        <div className="email-vars">
          <label>
            <span>Product name (for <code>{`{{product_name}}`}</code>)</span>
            <input
              name="var_product_name"
              defaultValue={deal?.productSummary ?? ""}
            />
          </label>
          <label>
            <span>Quantity (for <code>{`{{quantity}}`}</code>)</span>
            <input name="var_quantity" />
          </label>
        </div>

        <label>
          Body (plain text)
          <textarea
            name="body_text"
            rows={10}
            defaultValue={template?.bodyText ?? ""}
            placeholder={`Hi {{first_name}},\n\n…\n\nBest,\n5B Trading`}
          />
        </label>
        <label>
          Body (HTML — optional, takes priority if both filled)
          <textarea
            name="body_html"
            rows={6}
            defaultValue={template?.bodyHtml ?? ""}
            placeholder="<p>Hi {{first_name}},</p>…"
          />
        </label>

        <button className="primary-link" type="submit">Send email</button>
      </form>
    </div>
  );
}
