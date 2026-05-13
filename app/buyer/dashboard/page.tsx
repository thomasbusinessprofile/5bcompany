import Link from "next/link";
import { getBuyerRequestMetrics } from "../../shared/buyer-data";

export const metadata = {
  title: "Buyer Dashboard | 5B Trading",
  description: "Buyer workspace for tracking sourcing requests and required actions."
};

export default async function BuyerDashboardPage() {
  const metrics = await getBuyerRequestMetrics();
  const buyerWidgets = [
    { label: "Open Requests", value: String(metrics.open).padStart(2, "0") },
    { label: "Need Reply", value: String(metrics.needReply).padStart(2, "0") },
    { label: "Quote Drafts", value: String(metrics.quoteDrafts).padStart(2, "0") }
  ];
  const recentRequests = metrics.requests.slice(0, 3);

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Buyer Portal</p>
        <h1>Welcome back, buyer</h1>
        <p>Track open requests, required actions, and quotation progress.</p>
      </section>
      <section className="metric-grid">
        {buyerWidgets.map((widget) => (
          <div className="metric" key={widget.label}>
            <strong>{widget.value}</strong>
            <span>{widget.label}</span>
          </div>
        ))}
      </section>
      <section className="page-card dashboard-panel">
        <div className="panel-header">
          <h2>Recent requests</h2>
          <Link className="primary-link" href="/buyer/requests/new">
            New Request
          </Link>
        </div>
        <div className="table-list">
          {recentRequests.length > 0 ? (
            recentRequests.map((request) => (
              <div className="table-row" key={request.id}>
                <Link className="row-link" href={`/buyer/requests/${request.id}`}>
                  {request.title}
                </Link>
                <span>{request.status}</span>
                <span>{request.priority}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h2>No active requests</h2>
              <p>Create a structured sourcing request to start tracking admin review and quotation progress.</p>
            </div>
          )}
        </div>
        <div className="cta-row">
          <Link className="secondary-link" href="/buyer/requests">
            View all requests
          </Link>
          <Link className="secondary-link" href="/buyer/profile">
            Company profile
          </Link>
        </div>
      </section>
    </div>
  );
}
