import Link from "next/link";
import { getAdminInquiryMetrics } from "../../shared/admin-data";

export const metadata = {
  title: "Admin Dashboard | 5B Trading",
  description: "Admin request operations overview for sourcing pipeline management."
};

export default async function AdminDashboardPage() {
  const metrics = await getAdminInquiryMetrics();
  const adminWidgets = [
    { label: "New", value: String(metrics.newCount).padStart(2, "0") },
    { label: "Need Info", value: String(metrics.needInfo).padStart(2, "0") },
    { label: "Quote Prep", value: String(metrics.quotePrep).padStart(2, "0") },
    { label: "Visible RFQs", value: String(metrics.total).padStart(2, "0") }
  ];

  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Admin</p>
        <h1>Request operations overview</h1>
        <p>Admin focuses on pipeline, response speed, and commercial quality.</p>
      </section>
      <section className="metric-grid">
        {adminWidgets.map((widget) => (
          <div className="metric" key={widget.label}>
            <strong>{widget.value}</strong>
            <span>{widget.label}</span>
          </div>
        ))}
      </section>
      <section className="page-card dashboard-panel">
        <div className="panel-header">
          <h2>Pipeline by status</h2>
          <Link className="primary-link" href="/admin/requests">
            View Requests
          </Link>
        </div>
        <div className="status-lanes">
          <span>Admin Review</span>
          <span>Need More Info</span>
          <span>Quotation Preparing</span>
          <span>Negotiating</span>
        </div>
      </section>
    </div>
  );
}
