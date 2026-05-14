import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export const metadata = { title: "Quotations | Admin | 5B Trading", robots: { index: false } };

type QuotationRow = {
  id: string;
  quote_number: string;
  status: string;
  currency: string;
  subtotal: string | number | null;
  created_at: string;
  updated_at: string;
  request_id: string;
};

export default async function AdminQuotationsPage() {
  const supabase = await createSupabaseServerClient();
  let quotations: QuotationRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("quotations")
      .select("id, quote_number, status, currency, subtotal, created_at, updated_at, request_id")
      .order("updated_at", { ascending: false })
      .limit(200);
    quotations = (data ?? []) as QuotationRow[];
  }

  const fmtMoney = (n: string | number | null, cur: string) =>
    n === null
      ? "—"
      : new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(Number(n));

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Quotations</p>
        <h1>Quotations ({quotations.length})</h1>
        <p>
          Drafts and sent quotations. Create a quotation from a sourcing request via
          the buyer portal request detail.
        </p>
      </section>

      <section className="page-card">
        {quotations.length === 0 ? (
          <p className="muted">
            No quotations yet. Open a request in <Link href="/admin/requests">Requests</Link>{" "}
            and use the &ldquo;Prepare quotation&rdquo; action.
          </p>
        ) : (
          <div className="table-list">
            {quotations.map((q) => (
              <Link className="table-row" href={`/admin/quotations/${q.id}`} key={q.id}>
                <strong>{q.quote_number}</strong>
                <span className="muted">{q.status}</span>
                <span>{fmtMoney(q.subtotal, q.currency)}</span>
                <span className="muted">{new Date(q.updated_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
