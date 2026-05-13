import Link from "next/link";
import { getAdminRequestQueue } from "../../shared/admin-data";

export const metadata = {
  title: "Admin Requests | 5B Trading",
  description: "Admin request queue for prioritizing and assigning buyer sourcing requests."
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function AdminRequestsPage() {
  const requests = await getAdminRequestQueue();

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Admin Request Queue</p>
        <h1>Prioritize and assign buyer requests</h1>
        <p>
          Public RFQ inquiries and authenticated buyer portal requests now land
          in one operations queue.
        </p>
      </section>
      <section className="page-card dashboard-panel">
        <div className="filter-bar compact-filter" aria-label="Request filters">
          <span className="filter-chip active">All</span>
          <span className="filter-chip">New</span>
          <span className="filter-chip">Need Info</span>
          <span className="filter-chip">Quote Prep</span>
          <span className="filter-chip">High Priority</span>
        </div>
        <div className="table-list request-table">
          <div className="table-row table-head">
            <strong>Request</strong>
            <strong>Country</strong>
            <strong>Product</strong>
            <strong>Status</strong>
            <strong>Priority</strong>
            <strong>Received</strong>
          </div>
          {requests.length > 0 ? (
            requests.map((request) => (
              <div className="table-row" key={`${request.source}-${request.id}`}>
                <span>
                  {request.source === "buyer_portal" ? (
                    <Link className="row-link" href={`/admin/requests/${request.id}`}>
                      {request.title}
                    </Link>
                  ) : (
                    <strong>{request.title}</strong>
                  )}
                  <small>
                    {request.companyName} / {request.fullName}
                  </small>
                </span>
                <span>{request.country}</span>
                <span>
                  {request.productName}
                  <small>{request.quantity}</small>
                </span>
                <span>{statusLabel(request.status)}</span>
                <span>{request.priority}</span>
                <span>
                  {request.createdAt}
                  <small>{request.source === "buyer_portal" ? "Portal" : "Public RFQ"}</small>
                </span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h2>No visible inquiries yet</h2>
              <p>
                Submit the public RFQ form, then sign in with an admin-like
                profile to view inquiries here. RLS intentionally hides inquiry
                rows from unauthenticated visitors.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
