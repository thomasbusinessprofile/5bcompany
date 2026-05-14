"use client";

import { useMemo, useState } from "react";
import type { LineItem } from "../../lib/contracts/types";

type Props = {
  initial?: LineItem[];
  currency: string;
};

function newRow(): LineItem {
  return { name: "", description: "", quantity: 1, unit: "pc", unit_price: 0, subtotal: 0 };
}

export function LineItemsEditor({ initial, currency }: Props) {
  const [rows, setRows] = useState<LineItem[]>(initial && initial.length > 0 ? initial : [newRow()]);

  const total = useMemo(() => rows.reduce((s, r) => s + r.quantity * r.unit_price, 0), [rows]);

  function update(i: number, patch: Partial<LineItem>) {
    setRows((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        const merged = { ...r, ...patch };
        merged.subtotal = Math.round(merged.quantity * merged.unit_price * 100) / 100;
        return merged;
      })
    );
  }

  function remove(i: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function add() {
    setRows((prev) => [...prev, newRow()]);
  }

  const fmt = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency}`;

  return (
    <div className="line-items-editor">
      <div className="li-row li-row-head">
        <span>Item</span>
        <span>Qty</span>
        <span>Unit</span>
        <span>Unit price</span>
        <span>Subtotal</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div className="li-row" key={i}>
          <div className="li-name">
            <input
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Bamboo fence roll 1.8 × 3 m, carbonised"
              type="text"
              value={r.name}
            />
            <input
              className="li-desc"
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder="Optional spec / SKU notes"
              type="text"
              value={r.description ?? ""}
            />
          </div>
          <input
            min={0}
            onChange={(e) => update(i, { quantity: Number(e.target.value) })}
            step="any"
            type="number"
            value={r.quantity}
          />
          <input
            onChange={(e) => update(i, { unit: e.target.value })}
            placeholder="pc / roll / kg"
            type="text"
            value={r.unit}
          />
          <input
            min={0}
            onChange={(e) => update(i, { unit_price: Number(e.target.value) })}
            step="any"
            type="number"
            value={r.unit_price}
          />
          <span className="li-sub">{fmt(r.subtotal)}</span>
          <button aria-label="Remove" className="ghost-link danger" onClick={() => remove(i)} type="button">
            ×
          </button>
        </div>
      ))}
      <div className="li-actions">
        <button className="ghost-link" onClick={add} type="button">+ Add line</button>
        <div className="li-total">
          Total: <strong>{fmt(total)}</strong>
        </div>
      </div>
      <input name="line_items_json" type="hidden" value={JSON.stringify(rows)} />
    </div>
  );
}
