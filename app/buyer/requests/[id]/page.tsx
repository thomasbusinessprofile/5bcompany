import Link from "next/link";
import { notFound } from "next/navigation";
import { sendBuyerMessage, uploadBuyerAttachment } from "./actions";
import { getBuyerSourcingRequestById } from "../../../shared/buyer-data";
import { getSentQuotationsForRequest } from "../../../shared/quotation-data";

type BuyerRequestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

function getMessage(status?: string) {
  if (status === "message-sent") {
    return { tone: "success", text: "Message sent to the admin team." };
  }

  if (status === "file-uploaded") {
    return { tone: "success", text: "Attachment uploaded." };
  }

  if (status === "missing-message") {
    return { tone: "error", text: "Please enter a message before sending." };
  }

  if (status === "missing-file") {
    return { tone: "error", text: "Please choose a file before uploading." };
  }

  if (status === "file-too-large") {
    return { tone: "error", text: "Attachment must be 10MB or smaller." };
  }

  if (status === "message-error" || status === "upload-error") {
    return { tone: "error", text: "Action failed. Please try again." };
  }

  return null;
}

export async function generateMetadata({ params }: BuyerRequestDetailPageProps) {
  const { id } = await params;
  const request = await getBuyerSourcingRequestById(id);

  return {
    title: request ? `${request.title} | Buyer Request` : "Request not found"
  };
}

export default async function BuyerRequestDetailPage({
  params,
  searchParams
}: BuyerRequestDetailPageProps) {
  const { id } = await params;
  const { status } = await searchParams;
  const request = await getBuyerSourcingRequestById(id);
  const quotations = await getSentQuotationsForRequest(id);
  const message = getMessage(status);

  if (!request) {
    notFound();
  }

  return (
    <div className="page-shell">
      <section className="product-hero">
        <div>
          <p className="eyebrow">Request Detail</p>
          <h1>{request.title}</h1>
          <p className="hero-copy">{request.description}</p>
          <div className="tag-row">
            <span className="tag">{request.status}</span>
            <span className="tag">{request.priority}</span>
            <span className="tag">{request.incoterm}</span>
          </div>
        </div>
        <aside className="page-card request-checklist">
          <h2>Next required action</h2>
          <p>{request.nextAction}</p>
          <Link className="primary-link" href="#messages">
            Reply to admin
          </Link>
        </aside>
      </section>

      <section className="product-detail-grid" aria-label="Submitted request information">
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
          <h2>Packing</h2>
          <p>{request.packing}</p>
        </article>
      </section>

      <section className="product-detail-grid" aria-label="Quality and document requirements">
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
        <article className="page-card">
          <h2>Request ID</h2>
          <p>{request.id}</p>
        </article>
      </section>

      <section className="page-card detail-band">
        <h2>Quotation review</h2>
        {quotations.length > 0 ? (
          <div className="table-list">
            {quotations.map((quotation) => (
              <div className="table-row" key={quotation.id}>
                <span>
                  <strong>{quotation.quoteNumber}</strong>
                  <small>{quotation.status}</small>
                </span>
                <span>{quotation.currency}</span>
                <span>
                  {quotation.subtotal.toLocaleString("en-US", {
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No quotation has been sent yet. Drafts remain internal until admin approval.</p>
        )}
      </section>

      <section className="split detail-band">
        <div className="page-card" id="messages">
          <h2>Messages</h2>
          {message ? <p className={`form-status ${message.tone}`}>{message.text}</p> : null}
          <div className="message-list">
            {request.messages.length > 0 ? (
              request.messages.map((item) => (
                <article className={`message-bubble ${item.tone}`} key={item.id}>
                  <strong>{item.author}</strong>
                  <p>{item.body}</p>
                </article>
              ))
            ) : (
              <p>No messages yet. Admin review is in progress.</p>
            )}
          </div>
          <form action={sendBuyerMessage} className="request-form message-form">
            <input name="request_id" type="hidden" value={request.id} />
            <label>
              Reply
              <textarea maxLength={2000} name="message" placeholder="Type your reply to admin..." required />
            </label>
            <button className="primary-link" type="submit">
              Send message
            </button>
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
          <form action={uploadBuyerAttachment} className="request-form message-form">
            <input name="request_id" type="hidden" value={request.id} />
            <label>
              Upload attachment
              <input
                accept=".pdf,.docx,.xlsx,image/png,image/jpeg,image/webp"
                name="attachment"
                required
                type="file"
              />
            </label>
            <button className="primary-link" type="submit">
              Upload file
            </button>
          </form>
          <div className="cta-row">
            <Link className="secondary-link" href="/buyer/requests">
              Back to requests
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
