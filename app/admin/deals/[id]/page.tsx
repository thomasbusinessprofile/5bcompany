import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDealById,
  listCompanies,
  listContacts,
  listDealStages
} from "../../../shared/crm-data";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { ActivityTimeline } from "../../activities/ActivityTimeline";
import { saveActivity } from "../../activities/actions";
import { deleteDeal, saveDeal } from "../../pipeline/actions";

export const metadata = { title: "Deal | Admin", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string }> };

export default async function DealDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status } = await searchParams;
  const [deal, stages, companies, contacts] = await Promise.all([
    getDealById(id),
    listDealStages(),
    listCompanies(),
    listContacts()
  ]);
  if (!deal) notFound();

  const supabase = await createSupabaseServerClient();
  const activities = supabase
    ? (
        await supabase
          .from("crm_activities")
          .select(
            "id, type, subject, body, contact_id, company_id, inquiry_id, owner_id, occurred_at, due_at, completed_at, created_at, crm_contacts(full_name)"
          )
          .eq("deal_id", deal.id)
          .order("occurred_at", { ascending: false })
      ).data ?? []
    : [];

  const mappedActivities = (activities as unknown as Parameters<typeof ActivityTimeline>[0]["activities"]).map(
    (a: any) => ({
      id: a.id,
      type: a.type,
      subject: a.subject,
      body: a.body,
      contactId: a.contact_id,
      contactName: a.crm_contacts?.full_name ?? null,
      companyId: a.company_id,
      inquiryId: a.inquiry_id,
      ownerId: a.owner_id,
      occurredAt: a.occurred_at,
      dueAt: a.due_at,
      completedAt: a.completed_at,
      createdAt: a.created_at
    })
  );

  return (
    <div className="page-shell">
      <p className="eyebrow"><Link href="/admin/pipeline">← Back to pipeline</Link></p>
      <section className="section-title wide-title">
        <p className="eyebrow">Deal · {deal.stageName}</p>
        <h1>{deal.title}</h1>
        <p className="muted">
          {deal.companyName ? (
            <Link href={`/admin/companies/${deal.companyId}`}>{deal.companyName}</Link>
          ) : "—"}
          {deal.contactName ? <> · <Link href={`/admin/contacts/${deal.contactId}`}>{deal.contactName}</Link></> : null}
        </p>
      </section>

      {status === "saved" ? <p className="form-status success">Deal saved.</p> : null}

      <section className="split">
        <form action={saveDeal} className="page-card request-form">
          <h2>Edit details</h2>
          <input name="deal_id" type="hidden" value={deal.id} />
          <input name="redirect_to" type="hidden" value={`/admin/deals/${deal.id}?status=saved`} />
          <label>Title <input name="title" defaultValue={deal.title} required /></label>
          <label>
            Stage
            <select name="stage_id" defaultValue={deal.stageId} required>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label>
            Company
            <select name="company_id" defaultValue={deal.companyId ?? ""}>
              <option value="">—</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.country ? ` · ${c.country}` : ""}</option>
              ))}
            </select>
          </label>
          <label>
            Primary contact
            <select name="contact_id" defaultValue={deal.contactId ?? ""}>
              <option value="">—</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}{c.companyName ? ` · ${c.companyName}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>Deal value (USD) <input name="value_usd" type="number" step="100" defaultValue={deal.valueUsd ?? ""} /></label>
          <label>Expected close <input name="expected_close_date" type="date" defaultValue={deal.expectedCloseDate ?? ""} /></label>
          <label>Product summary <input name="product_summary" defaultValue={deal.productSummary ?? ""} /></label>
          <label>Source <input name="source" defaultValue={deal.source ?? ""} /></label>
          <label>Lost reason <input name="lost_reason" defaultValue={deal.lostReason ?? ""} placeholder="Only if stage = Lost" /></label>
          <button className="primary-link" type="submit">Save changes</button>
        </form>

        <aside className="page-card">
          <h2>Deal snapshot</h2>
          <dl className="company-meta">
            <div><dt>Stage</dt><dd>{deal.stageName}</dd></div>
            <div><dt>Value</dt><dd>{deal.valueUsd ? `$${deal.valueUsd.toLocaleString()}` : "—"}</dd></div>
            <div><dt>Expected close</dt><dd>{deal.expectedCloseDate ?? "—"}</dd></div>
            <div><dt>Closed at</dt><dd>{deal.closedAt ? new Date(deal.closedAt).toLocaleDateString() : "—"}</dd></div>
            <div><dt>Source</dt><dd>{deal.source ?? "—"}</dd></div>
            <div><dt>Created</dt><dd>{new Date(deal.createdAt).toLocaleDateString()}</dd></div>
          </dl>
          {deal.inquiryId ? (
            <p>
              <Link className="secondary-link" href={`/admin/requests/${deal.inquiryId}`}>
                View originating RFQ →
              </Link>
            </p>
          ) : null}
          <form action={deleteDeal} style={{ marginTop: 24 }}>
            <input name="deal_id" type="hidden" value={deal.id} />
            <button className="ghost-link danger" type="submit">Delete deal</button>
          </form>
        </aside>
      </section>

      <section className="page-card">
        <h2>Activity timeline</h2>
        <form action={saveActivity} className="activity-quick-form">
          <input name="contact_id" type="hidden" value={deal.contactId ?? ""} />
          <input name="deal_id" type="hidden" value={deal.id} />
          <input name="redirect_to" type="hidden" value={`/admin/deals/${deal.id}`} />
          <div className="activity-quick-row">
            <select name="type" defaultValue="note">
              <option value="note">📝 Note</option>
              <option value="call">📞 Call</option>
              <option value="email">✉️ Email</option>
              <option value="meeting">🗓 Meeting</option>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="task">✅ Task</option>
            </select>
            <input name="subject" placeholder="Subject (optional)" />
            <input name="due_at" type="datetime-local" />
          </div>
          <textarea name="body" rows={2} placeholder="What happened?" />
          <button className="primary-link" type="submit">Log activity</button>
        </form>
        <ActivityTimeline activities={mappedActivities} redirectTo={`/admin/deals/${deal.id}`} />
      </section>
    </div>
  );
}
