"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Deal, DealStage } from "../../shared/crm-data";

type Props = {
  stages: DealStage[];
  initialDeals: Deal[];
  moveAction: (formData: FormData) => Promise<void>;
};

function formatMoney(usd: number | null) {
  if (usd === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd);
}

export function PipelineBoard({ stages, initialDeals, moveAction }: Props) {
  const [deals, setDeals] = useState(initialDeals);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onDragStart(e: React.DragEvent, dealId: string) {
    setDraggingId(dealId);
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setHoverStage(null);
    if (!dealId) return;

    const currentDeal = deals.find((d) => d.id === dealId);
    if (!currentDeal || currentDeal.stageId === stageId) return;

    // Optimistic update
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stageId } : d)));

    const form = new FormData();
    form.append("deal_id", dealId);
    form.append("stage_id", stageId);
    startTransition(() => {
      void moveAction(form);
    });
  }

  return (
    <div className="pipeline-board" role="list">
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stageId === stage.id);
        const totalValue = stageDeals.reduce((sum, d) => sum + (d.valueUsd ?? 0), 0);
        return (
          <section
            aria-label={stage.name}
            className={`pipeline-column ${hoverStage === stage.id ? "drop-target" : ""} ${stage.isWon ? "won" : ""} ${stage.isLost ? "lost" : ""}`}
            key={stage.id}
            onDragLeave={() => setHoverStage(null)}
            onDragOver={(e) => {
              e.preventDefault();
              if (hoverStage !== stage.id) setHoverStage(stage.id);
            }}
            onDrop={(e) => onDrop(e, stage.id)}
          >
            <header className="pipeline-column-head">
              <h2>{stage.name}</h2>
              <p>
                {stageDeals.length} · {formatMoney(totalValue)}
              </p>
            </header>
            <div className="pipeline-cards">
              {stageDeals.length === 0 ? (
                <p className="pipeline-empty muted">Drop a deal here</p>
              ) : (
                stageDeals.map((deal) => (
                  <Link
                    className={`pipeline-card ${draggingId === deal.id ? "dragging" : ""}`}
                    draggable
                    href={`/admin/deals/${deal.id}`}
                    key={deal.id}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={(e) => onDragStart(e, deal.id)}
                  >
                    <strong>{deal.title}</strong>
                    {deal.companyName ? <span className="muted">{deal.companyName}</span> : null}
                    <span className="pipeline-card-meta">
                      <span>{formatMoney(deal.valueUsd)}</span>
                      {deal.expectedCloseDate ? (
                        <time>{new Date(deal.expectedCloseDate).toLocaleDateString()}</time>
                      ) : null}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
