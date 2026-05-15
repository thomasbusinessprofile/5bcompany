import Link from "next/link";
import { listContracts } from "../../lib/contracts/data";
import { CONTRACT_TYPE_LABEL, formatMoney } from "../../lib/contracts/types";
import { tA } from "../../lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contracts | Admin", robots: { index: false } };

export default async function AdminContractsPage() {
  const contracts = await listContracts();

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">{tA("Contracts")}</p>
        <h1>{tA("Contracts")} ({contracts.length})</h1>
        <p>LOI, sample agreements, proforma invoices, sales và distribution contracts.</p>
      </section>

      <div className="pipeline-actions">
        <Link className="primary-link" href="/admin/contracts/new">{tA("+ New contract")}</Link>
      </div>

      <section className="page-card">
        {contracts.length === 0 ? (
          <p className="muted">{tA("No contracts yet.")}</p>
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
