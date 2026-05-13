import Link from "next/link";
import { getBuyerSourcingRequests } from "../../shared/buyer-data";

export const metadata = {
  title: "Buyer Requests | 5B Trading",
  description: "Buyer sourcing request history and status tracking."
};

export default async function BuyerRequestsPage() {
  const requests = await getBuyerSourcingRequests();

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Buyer Portal</p>
        <h1>Your sourcing requests</h1>
        <p>Review request history, current status, priority, and the next action required.</p>
      </section>
      <section className="page-card dashboard-panel">
        <div className="panel-header">
          <h2>Request history</h2>
          <Link className="primary-link" href="/buyer/requests/new">
            New Request
          </Link>
        </div>
        <div className="table-list request-table">
          <div className="table-row table-head">
            <strong>Request</strong>
            <strong>Product</strong>
            <strong>Status</strong>
            <strong>Priority</strong>
            <strong>Destination</strong>
            <strong>Action</strong>
          </div>
          {requests.length > 0 ? (
            requests.map((request) => (
              <div className="table-row" key={request.id}>
                <Link className="row-link" href={`/buyer/requests/${request.id}`}>
                  {request.title}
                </Link>
                <span>{request.product}</span>
                <span>{request.status}</span>
                <span>{request.priority}</span>
                <span>{request.destination}</span>
                <span>{request.nextAction}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h2>No sourcing requests yet</h2>
              <p>
                Create your first sourcing request with product, quantity,
                destination, packing, quality, document needs, and timeline.
              </p>
              <div className="cta-row">
                <Link className="primary-link" href="/buyer/requests/new">
                  Create Request
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
