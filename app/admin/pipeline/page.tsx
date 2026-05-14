import Link from "next/link";
import { listDealStages, listDeals } from "../../shared/crm-data";
import { PipelineBoard } from "./PipelineBoard";
import { moveDealStage } from "./actions";

export const metadata = { title: "Pipeline | Admin | 5B Trading", robots: { index: false } };

export default async function PipelinePage() {
  const [stages, deals] = await Promise.all([listDealStages(), listDeals()]);

  const open = deals.filter((d) => !d.closedAt);
  const openValue = open.reduce((sum, d) => sum + (d.valueUsd ?? 0), 0);
  const won = deals.filter((d) => stages.find((s) => s.id === d.stageId)?.isWon);
  const wonValue = won.reduce((sum, d) => sum + (d.valueUsd ?? 0), 0);

  return (
    <div className="page-shell">
      <section className="section-title wide-title">
        <p className="eyebrow">CRM · Pipeline</p>
        <h1>Sales pipeline</h1>
        <p>
          Drag deals between stages. {open.length} open · {open.length > 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(openValue)
            : "$0"} in flight ·{" "}
          {won.length > 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(wonValue)
            : "$0"} won.
        </p>
      </section>

      <div className="pipeline-actions">
        <Link className="primary-link" href="/admin/deals/new">+ New deal</Link>
      </div>

      <PipelineBoard initialDeals={deals} moveAction={moveDealStage} stages={stages} />
    </div>
  );
}
