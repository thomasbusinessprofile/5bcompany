import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createQuotationDraft,
  sendAdminMessage,
  structureRequest,
  updateRequestStatus
} from "./actions";
import { getAdminSourcingRequestById } from "../../../shared/admin-data";
import { CharCounterTextarea } from "../../../shared/CharCounterTextarea";
import { SubmitButton } from "../../../shared/SubmitButton";
import { MAX_MESSAGE_LENGTH } from "../../../lib/constants";

const statusOptions = [
  "new",
  "ai_structured",
  "admin_review",
  "need_more_info",
  "sourcing_in_progress",
  "quotation_preparing",
  "quotation_sent",
  "sample_discussion",
  "negotiating",
  "won",
  "lost",
  "closed",
  "spam"
];

type AdminRequestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

function messageFor(status?: string) {
  if (status === "updated") {
    return { tone: "success", text: "Request status updated." };
  }

  if (status === "message-sent") {
    return { tone: "success", text: "Message saved." };
  }

  if (status === "ai-structured") {
    return { tone: "success", text: "AI structure saved for admin review." };
  }

  if (
    status === "update-error" ||
    status === "message-error" ||
    status === "ai-error" ||
    status === "quote-error"
  ) {
    return { tone: "error", text: "Action failed. Check permissions and try again." };
  }

  return null;
}

export async function generateMetadata({ params }: AdminRequestDetailPageProps) {
  const { id } = await params;
  const request = await getAdminSourcingRequestById(id);

  return {
    title: request ? `${request.title} | Admin Request` : "Request not found"
  };
}

export default async function AdminRequestDetailPage({
  params,
  searchParams
}: AdminRequestDetailPageProps) {
  const { id } = await params;
  const { status } = await searchParams;
  const request = await getAdminSourcingRequestById(id);
  const statusMessage = messageFor(status);

  if (!request) {
    notFound();
  }

  return (
    <div className="page-shell">
      <section className="product-hero">
        <div>
          <p className="eyebrow">Admin Request Detail</p>
          <h1>{request.title}</h1>
          <p className="hero-copy">{request.description}</p>
          <div className="tag-row">
            <span className="tag">{request.status.replaceAll("_", " ")}</span>
            <span className="tag">{request.priority}</span>
            <span className="tag">{request.buyer}</span>
          </div>
        </div>
        <aside className="page-card request-checklist">
          <h2>Status control</h2>
          {statusMessage ? <p className={`form-status ${statusMessage.tone}`}>{statusMessage.text}</p> : null}
          <form action={structureRequest} className="request-form">
            <input name="request_id" type="hidden" value={request.id} />
            <button className="secondary-link" type="submit">
              Structure with AI
            </button>
          </form>
          <form action={createQuotationDraft} className="request-form">
            <input name="request_id" type="hidden" value={request.id} />
            <button className="secondary-link" type="submit">
              Create quotation draft
            </button>
          </form>
          <form action={updateRequestStatus} className="request-form">
            <input name="request_id" type="hidden" value={request.id} />
            <label>
              Status
              <select defaultValue={request.status} name="status">
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Note
              <textarea name="note" placeholder="Optional status note..." />
            </label>
            <button className="primary-link" type="submit">
              Update status
            </button>
          </form>
        </aside>
      </section>

      <section className="split detail-band">
        <article className="page-card">
          <h2>AI admin summary</h2>
          <p>{request.aiSummary || "Run AI structuring to create an admin summary and missing-field checklist."}</p>
        </article>
        <aside className="page-card">
          <h2>AI missing fields</h2>
          {request.aiMissingFields.length > 0 ? (
            <ul className="clean-list">
              {request.aiMissingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : (
            <p>No missing fields detected yet.</p>
          )}
        </aside>
      </section>

      <section className="page-card detail-band">
        <h2>Suggested buyer questions</h2>
        {request.aiQuestions.length > 0 ? (
          <ul className="clean-list">
            {request.aiQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        ) : (
          <p>Run AI structuring to draft clarification questions for the buyer.</p>
        )}
      </section>

      <section className="product-detail-grid" aria-label="Request details">
        <article className="page-card">
          <h2>Product</h2>
          <p>{request.product}</p>
        </article>
        <article className="page-card">
          <h2>Quantity</h2>
          <p>{request.quantity}</p>
        </article>
        <article className="page-card">
          <h2>Destination</h2>
          <p>{request.destination}</p>
        </article>
        <article className="page-card">
          <h2>Incoterm</h2>
          <p>{request.incoterm}</p>
        </article>
      </section>

      <section className="product-detail-grid" aria-label="Requirements">
        <article className="page-card">
          <h2>Packing</h2>
          <p>{request.packing}</p>
        </article>
        <article className="page-card">
          <h2>Quality</h2>
          <p>{request.qualityRequirement}</p>
        </article>
        <article className="page-card">
          <h2>Documents</h2>
          <p>{request.documentRequirement}</p>
        </article>
        <article className="page-card">
          <h2>Timeline</h2>
          <p>{request.timeline}</p>
        </article>
      </section>

      <section className="split detail-band">
        <div className="page-card" id="messages">
          <h2>Messages and notes</h2>
          <div className="message-list">
            {request.messages.length > 0 ? (
              request.messages.map((item) => (
                <article className={`message-bubble ${item.tone}`} key={item.id}>
                  <strong>{item.author}</strong>
                  <p>{item.body}</p>
                  {item.internal ? (
                    <p className="admin-internal-warning" role="note">
                      Internal only — not visible to the buyer.
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
          <form action={sendAdminMessage} className="request-form message-form">
            <input name="request_id" type="hidden" value={request.id} />
            <label>
              Message
              <CharCounterTextarea
                maxLength={MAX_MESSAGE_LENGTH}
                name="message"
                placeholder="Ask buyer for missing details or add an internal note..."
                required
              />
            </label>
            <label className="checkbox-label">
              <input name="is_internal" type="checkbox" />
              Internal note only (hidden from buyer)
            </label>
            <SubmitButton pendingLabel="Saving...">Save message</SubmitButton>
          </form>
        </div>
        <aside className="page-card">
          <h2>Attachments</h2>
          {request.attachments.length > 0 ? (
            <ul className="clean-list">
              {request.attachments.map((attachment) => (
                <li key={attachment}>{attachment}</li>
              ))}
            </ul>
          ) : (
            <p>No attachments uploaded yet.</p>
          )}
          <h2>Admin guardrails</h2>
          <ul className="check-list">
            <li>Do not promise stock before confirmation</li>
            <li>Do not send final price before quotation approval</li>
            <li>Keep internal notes hidden from buyer</li>
          </ul>
          <div className="cta-row">
            <Link className="secondary-link" href="/admin/requests">
              Back to queue
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
