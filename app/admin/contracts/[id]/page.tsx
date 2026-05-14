import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getContractById,
  listContractEvents,
  listContractVersions
} from "../../../lib/contracts/data";
import { CONTRACT_TYPE_LABEL, formatMoney } from "../../../lib/contracts/types";
import {
  getSignedPdfUrl,
  revokeShareToken,
  sendContract,
  updateContract,
  uploadSignedPdf
} from "../actions";
import { LineItemsEditor } from "../LineItemsEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contract | Admin", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ status?: string; message?: string }> };

function flash(status: string | undefined, message: string | undefined) {
  if (!status) return null;
  const map: Record<string, { tone: string; text: string }> = {
    created: { tone: "success", text: "Contract draft created." },
    saved: { tone: "success", text: "Contract saved." },
    sent: { tone: "success", text: "Contract emailed to buyer." },
    signed: { tone: "success", text: "Signed PDF uploaded — contract marked signed." },
    "token-revoked": { tone: "success", text: "Share link revoked." },
    "send-failed": { tone: "error", text: "Email send failed. See events log below." },
    "save-error": { tone: "error", text: message ?? "Save failed." },
    "upload-error": { tone: "error", text: "PDF upload failed." },
    "no-email": { tone: "error", text: "Buyer signer email is required before sending." },
    "missing-pdf": { tone: "error", text: "Please select a PDF file to upload." },
    "not-pdf": { tone: "error", text: "Only PDF files are accepted." },
    "no-pdf": { tone: "error", text: "No PDF stored for this contract yet." },
    "missing-fields": { tone: "error", text: "Required fields missing." }
  };
  return map[status] ?? null;
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  });
}

export default async function AdminContractDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status, message } = await searchParams;
  const [contract, events, versions] = await Promise.all([
    getContractById(id),
    listContractEvents(id),
    listContractVersions(id)
  ]);
  if (!contract) notFound();

  const banner = flash(status, message);
  const isDraft = contract.status === "draft";
  const canSend = isDraft || contract.status === "viewed";

  return (
    <div className="page-shell">
      <p className="eyebrow"><Link href="/admin/contracts">← Back to contracts</Link></p>

      <section className="section-title wide-title">
        <p className="eyebrow">
          {CONTRACT_TYPE_LABEL[contract.type]} · v{contract.version}
        </p>
        <h1>{contract.contractNumber}</h1>
        <p className="muted">
          {contract.buyerLegalName}
          {contract.buyerSignerEmail ? ` · ${contract.buyerSignerEmail}` : ""}
          {" · "}
          <span className={`status-pill ${contract.status}`}>{contract.status}</span>
        </p>
      </section>

      {banner ? <p className={`form-status ${banner.tone}`}>{banner.text}</p> : null}

      <section className="split">
        <form action={updateContract} className="page-card request-form">
          <input name="contract_id" type="hidden" value={contract.id} />

          <h2 className="rfq-section-title">Counterparty (Buyer)</h2>
          <div className="rfq-row">
            <label>
              Legal name {isDraft ? "" : "(frozen)"}
              <input
                defaultValue={contract.buyerLegalName}
                disabled={!isDraft}
                name="buyer_legal_name"
                required
              />
            </label>
            <label>
              Tax ID
              <input defaultValue={contract.buyerTaxId ?? ""} disabled={!isDraft} name="buyer_tax_id" />
            </label>
          </div>
          <label>
            Address
            <input defaultValue={contract.buyerAddress ?? ""} disabled={!isDraft} name="buyer_address" />
          </label>
          <div className="rfq-row">
            <label>
              Signer name
              <input
                defaultValue={contract.buyerSignerName ?? ""}
                disabled={!isDraft}
                name="buyer_signer_name"
              />
            </label>
            <label>
              Signer title
              <input
                defaultValue={contract.buyerSignerTitle ?? ""}
                disabled={!isDraft}
                name="buyer_signer_title"
              />
            </label>
          </div>
          <label>
            Signer email
            <input
              defaultValue={contract.buyerSignerEmail ?? ""}
              disabled={!isDraft}
              name="buyer_signer_email"
              type="email"
            />
          </label>

          <h2 className="rfq-section-title">Commercial terms</h2>
          <div className="rfq-row">
            <label>
              Currency
              <select defaultValue={contract.currency} name="currency">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>VND</option>
                <option>JPY</option>
              </select>
            </label>
            <label>
              Tax %
              <input defaultValue={contract.taxPct} name="tax_pct" step="any" type="number" />
            </label>
          </div>
          <div className="rfq-row">
            <label>
              Incoterm
              <input defaultValue={contract.incoterm ?? ""} name="incoterm" />
            </label>
            <label>
              Validity until
              <input defaultValue={contract.validityUntil ?? ""} name="validity_until" type="date" />
            </label>
          </div>
          <label>
            Payment terms
            <input defaultValue={contract.paymentTerms ?? ""} name="payment_terms" />
          </label>
          <label>
            Delivery window
            <input defaultValue={contract.deliveryWindow ?? ""} name="delivery_window" />
          </label>

          <h2 className="rfq-section-title">Line items</h2>
          <LineItemsEditor currency={contract.currency} initial={contract.lineItems} />

          <h2 className="rfq-section-title">Terms HTML</h2>
          <label>
            Terms
            <textarea
              defaultValue={contract.termsHtml ?? ""}
              name="terms_html"
              rows={10}
            />
          </label>

          <button className="primary-link" type="submit">Save changes</button>
        </form>

        <aside className="page-card">
          <h2>Snapshot</h2>
          <dl className="company-meta">
            <div><dt>Status</dt><dd><span className={`status-pill ${contract.status}`}>{contract.status}</span></dd></div>
            <div><dt>Total</dt><dd>{formatMoney(contract.totalAmount, contract.currency)}</dd></div>
            <div><dt>Version</dt><dd>v{contract.version} ({versions.length + 1} total)</dd></div>
            <div><dt>Sent</dt><dd>{fmtDateTime(contract.sentAt)}</dd></div>
            <div><dt>Signed</dt><dd>{fmtDateTime(contract.signedAt)}</dd></div>
            <div><dt>Share link expires</dt><dd>{fmtDateTime(contract.shareTokenExpiresAt)}</dd></div>
          </dl>

          <h2 style={{ marginTop: 24 }}>Send</h2>
          {canSend ? (
            <form action={sendContract}>
              <input name="contract_id" type="hidden" value={contract.id} />
              <button className="primary-link" type="submit">
                {contract.status === "draft" ? "Send to buyer" : "Resend"}
              </button>
              {!contract.buyerSignerEmail ? (
                <p className="form-note">⚠ Add signer email first.</p>
              ) : null}
            </form>
          ) : (
            <p className="muted">Already {contract.status}.</p>
          )}

          {contract.pdfUrl ? (
            <form action={getSignedPdfUrl} style={{ marginTop: 12 }}>
              <input name="contract_id" type="hidden" value={contract.id} />
              <input name="which" type="hidden" value="pdf" />
              <button className="secondary-link" type="submit">Download draft PDF</button>
            </form>
          ) : null}

          {contract.shareToken && !contract.shareTokenRevokedAt ? (
            <form action={revokeShareToken} style={{ marginTop: 12 }}>
              <input name="contract_id" type="hidden" value={contract.id} />
              <button className="ghost-link danger" type="submit">Revoke share link</button>
            </form>
          ) : null}

          <h2 style={{ marginTop: 24 }}>Upload signed PDF (wet sign)</h2>
          {contract.status === "signed" ? (
            <>
              <p className="muted">Already signed on {fmtDateTime(contract.signedAt)} by {contract.signerTypedName}.</p>
              {contract.signedPdfUrl ? (
                <form action={getSignedPdfUrl} style={{ marginTop: 8 }}>
                  <input name="contract_id" type="hidden" value={contract.id} />
                  <input name="which" type="hidden" value="signed" />
                  <button className="secondary-link" type="submit">Download signed PDF</button>
                </form>
              ) : null}
            </>
          ) : (
            <form action={uploadSignedPdf} encType="multipart/form-data">
              <input name="contract_id" type="hidden" value={contract.id} />
              <label style={{ display: "block", marginBottom: 8 }}>
                Signer name (typed)
                <input name="signer_typed_name" placeholder={contract.buyerSignerName ?? "Buyer name"} />
              </label>
              <input accept="application/pdf" name="signed_pdf" required type="file" />
              <button className="primary-link" style={{ marginTop: 8 }} type="submit">Upload signed copy</button>
            </form>
          )}
        </aside>
      </section>

      <section className="page-card">
        <h2>Events</h2>
        {events.length === 0 ? (
          <p className="muted">No events yet.</p>
        ) : (
          <ol className="activity-timeline">
            {events.map((e) => {
              const ev = e as { id: string; event_type: string; actor: string | null; actor_email: string | null; occurred_at: string; metadata?: Record<string, unknown> | null };
              return (
                <li className="activity-item" key={ev.id}>
                  <span className="activity-icon" aria-hidden="true">•</span>
                  <div className="activity-body">
                    <div className="activity-head">
                      <strong>{ev.event_type}</strong>
                      {ev.actor ? <span className="muted"> · {ev.actor}</span> : null}
                      {ev.actor_email ? <span className="muted"> · {ev.actor_email}</span> : null}
                    </div>
                    {ev.metadata ? (
                      <p className="activity-text">{JSON.stringify(ev.metadata)}</p>
                    ) : null}
                    <p className="activity-meta">
                      <time>{fmtDateTime(ev.occurred_at)}</time>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {versions.length > 0 ? (
        <section className="page-card">
          <h2>Version history</h2>
          <ol>
            {versions.map((v) => {
              const vv = v as { id: string; version: number; changed_at: string };
              return (
                <li key={vv.id}>
                  v{vv.version} — {fmtDateTime(vv.changed_at)}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
