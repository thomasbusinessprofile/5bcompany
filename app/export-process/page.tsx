import Link from "next/link";
import { workflowSteps } from "../shared/data";

export const metadata = {
  title: "Export Process | 5B Trading",
  description:
    "A disciplined export sourcing workflow from inquiry and spec review to quotation, QC, shipment, and after-shipment support."
};

export default function ExportProcessPage() {
  return (
    <div className="page-shell">
      <section className="section-title">
        <p className="eyebrow">Export Process</p>
        <h1>A workflow buyers can trust</h1>
        <p>
          This page proves discipline: requirements, quotation, production, QC,
          documents, and shipment are handled as a traceable process.
        </p>
      </section>
      <section className="card-grid" aria-label="Export workflow steps">
        {workflowSteps.map((step, index) => (
          <article className="product-card" key={step.title}>
            <span className="tag">{String(index + 1).padStart(2, "0")}</span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            <div className="tag-row">
              <span className="tag">Owner</span>
              <span className="tag">Status</span>
              <span className="tag">Next action</span>
            </div>
          </article>
        ))}
      </section>
      <div className="cta-row">
        <Link className="primary-link" href="/request-quote">
          Create Request
        </Link>
        <Link className="secondary-link" href="/articles">
          Read Insights
        </Link>
      </div>
    </div>
  );
}
