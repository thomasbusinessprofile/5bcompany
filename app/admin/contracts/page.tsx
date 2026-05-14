import Link from "next/link";
import { listContracts } from "../../lib/contracts/data";
import { CONTRACT_TYPE_LABEL, formatMoney } from "../../lib/contracts/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contracts | Admin", robots: { index: false } };

export default async function AdminContractsPage() {
  const contracts = await listContracts();

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">Contracts</p>
        <h1>Contracts ({contracts.length})</h1>
        <p>LOI, sample agreements, proforma invoices, sales and distribution contracts.</p>
      </section>

      <div className="pipeline-actions">
        <Link className="primary-link" href="/admin/contracts/new">+ New contract</Link>
      </div>

      <section className="page-card">
        {contracts.length === 0 ? (
          <p className="muted">No contracts yet.</p>
        ) : (
          <div className="table-list">
            {contracts.map((c) => (
              <Link className="table-row contract-row" href={`/admin/contracts/${c.id}`} key={c.id}>
                <strong>{c.contractNumber}</strong>
                <span className="muted">{CONTRACT_TYPE_LABEL[c.type]}</span>
                <span>{c.buyerLegalName}</span>
                <span className="muted">{formatMoney(c.totalAmount, c.currency)}</span>
                <span className={`status-pill ${c.status}`}>{c.status}</span>
                <span className="muted">{new Date(c.updatedAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
