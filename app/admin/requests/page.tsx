import Link from "next/link";
import { getAdminInquiryMetrics, getAdminRequestQueue } from "../../shared/admin-data";
import { formatStatus } from "../../lib/form-utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Requests | Admin | 5B Trading",
  robots: { index: false, follow: false }
};

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "need_more_info", label: "Need info" },
  { key: "quotation_preparing", label: "Quote prep" },
  { key: "negotiating", label: "Negotiating" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
] as const;

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return iso;
  }
}

export default async function AdminRequestsPage({ searchParams }: Props) {
  const { status: statusFilter, q } = await searchParams;
  const [queue, metrics] = await Promise.all([getAdminRequestQueue(), getAdminInquiryMetrics()]);

  const search = (q ?? "").trim().toLowerCase();
  const filtered = queue.filter((r) => {
    if (statusFilter && statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const haystack = [r.title, r.companyName, r.fullName, r.country, r.productName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const widgets = [
    { label: "Total", value: metrics.total, key: "all" },
    { label: "New", value: metrics.newCount, key: "new" },
    { label: "Need info", value: metrics.needInfo, key: "need_more_info" },
    { label: "Quote prep", value: metrics.quotePrep, key: "quotation_preparing" },
    { label: "Won", value: metrics.wonCount, key: "won" },
    { label: "Avg reply", value: metrics.averageAdminResponseTime, key: null }
  ] as const;

  const buildHref = (overrides: Partial<{ status: string; q: string }>) => {
    const params = new URLSearchParams();
    const status = overrides.status ?? statusFilter;
    const query = overrides.q ?? q;
    if (status && status !== "all") params.set("status", status);
    if (query) params.set("q", query);
    const s = params.toString();
    return s ? `/admin/requests?${s}` : "/admin/requests";
  };

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Request queue</p>
        <h1>Inbound buyer requests</h1>
        <p>
          Public RFQ inquiries and authenticated buyer portal requests land here, sorted
          newest first.
        </p>
      </section>

      {/* KPI strip — clickable status filters */}
      <section className="metric-grid">
        {widgets.map((w) => {
          const isActive = (statusFilter ?? "all") === (w.key ?? "");
          const content = (
            <div className={`metric ${isActive ? "metric-active" : ""}`}>
              <strong>{w.value}</strong>
              <span>{w.label}</span>
            </div>
          );
          return w.key === null ? (
            <div key={w.label}>{content}</div>
          ) : (
            <Link className="metric-link" href={buildHref({ status: w.key })} key={w.label}>
              {content}
            </Link>
          );
        })}
      </section>

      {/* Filter chips + search */}
      <nav className="filter-bar" aria-label="Status filter">
        {STATUS_FILTERS.map((f) => {
          const active = (statusFilter ?? "all") === f.key;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "filter-chip active" : "filter-chip"}
              href={buildHref({ status: f.key })}
              key={f.key}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <form className="search-bar" method="get">
        {statusFilter && statusFilter !== "all" ? (
          <input name="status" type="hidden" value={statusFilter} />
        ) : null}
        <input
          defaultValue={q ?? ""}
          name="q"
          placeholder="Search company, name, country, product…"
          type="search"
        />
        <button className="secondary-link" type="submit">Search</button>
        {q ? (
          <Link className="ghost-link" href={buildHref({ q: "" })}>Clear</Link>
        ) : null}
      </form>

      <section className="page-card dashboard-panel">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h2>
              {queue.length === 0 ? "Inbox is empty" : "No matches"}
            </h2>
            <p>
              {queue.length === 0 ? (
                <>
                  No buyer has submitted an RFQ yet.{" "}
                  <Link className="auth-link" href="/request-quote">
                    Preview the public request form →
                  </Link>
                </>
              ) : (
                <>
                  No requests match the current filters.{" "}
                  <Link className="auth-link" href="/admin/requests">
                    Clear filters →
                  </Link>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="table-list request-table">
            <div className="table-row table-head">
              <strong>Request</strong>
              <strong>Country</strong>
              <strong>Product</strong>
              <strong>Status</strong>
              <strong>Priority</strong>
              <strong>Received</strong>
            </div>
            {filtered.map((request) => (
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
                    {request.companyName}
                    {request.fullName ? ` · ${request.fullName}` : ""}
                  </small>
                </span>
                <span>{request.country || "—"}</span>
                <span>
                  {request.productName || "—"}
                  {request.quantity ? <small>{request.quantity}</small> : null}
                </span>
                <span>
                  <span className={`status-pill ${request.status}`}>
                    {formatStatus(request.status)}
                  </span>
                </span>
                <span>{request.priority}</span>
                <span>
                  {fmtDate(request.createdAt)}
                  <small>{request.source === "buyer_portal" ? "Portal" : "Public RFQ"}</small>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
