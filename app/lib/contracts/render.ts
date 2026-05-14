import { company as sellerCompany } from "../../shared/company";
import { formatMoney, type Contract, type LineItem } from "./types";

// Marker we'll split the rendered terms on when generating the PDF, so the
// line-items table is rendered by React PDF as proper cells, not raw HTML.
export const LINE_ITEMS_MARKER = "__LINE_ITEMS_TABLE__";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  } catch {
    return iso;
  }
}

export function renderContractTerms(contract: Contract): string {
  const total = formatMoney(contract.totalAmount, contract.currency);
  const vars: Record<string, string> = {
    "contract_number": contract.contractNumber,
    "issued_at": fmtDate(contract.sentAt ?? contract.createdAt),
    "validity_until": fmtDate(contract.validityUntil),
    "buyer.legal_name": contract.buyerLegalName ?? "",
    "buyer.address": contract.buyerAddress ?? "",
    "buyer.tax_id": contract.buyerTaxId ?? "—",
    "buyer.signer_name": contract.buyerSignerName ?? "",
    "buyer.signer_title": contract.buyerSignerTitle ?? "",
    "seller.legal_name": sellerCompany.legalNameEn,
    "seller.address": sellerCompany.address,
    "seller.tax_id": sellerCompany.taxId,
    "currency": contract.currency,
    "total": total,
    "tax_pct": String(contract.taxPct ?? 0),
    "incoterm": contract.incoterm ?? "—",
    "payment_terms": contract.paymentTerms ?? "—",
    "delivery_window": contract.deliveryWindow ?? "—",
    "line_items_table": LINE_ITEMS_MARKER
  };

  const source = contract.termsHtml ?? "";
  return source.replace(/\{\{\s*([a-z0-9_.]+)\s*\}\}/gi, (_, key: string) => {
    const v = vars[key.toLowerCase()];
    return v ?? "";
  });
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|ul|ol)>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Splits the rendered terms into ordered blocks the PDF generator can render
// natively: plain paragraphs and one structured line-items table.
export type ContractBlock =
  | { type: "text"; content: string }
  | { type: "heading"; level: 2 | 3; content: string }
  | { type: "list"; items: string[] }
  | { type: "line_items" };

export function parseTermsToBlocks(html: string, lineItems: LineItem[]): ContractBlock[] {
  const out: ContractBlock[] = [];
  const parts = html.split(LINE_ITEMS_MARKER);

  parts.forEach((part, idx) => {
    out.push(...parseHtmlChunk(part));
    if (idx < parts.length - 1) {
      out.push({ type: "line_items" });
    }
  });

  // Fallback — if no marker present but line_items has items, still render
  // a table at the bottom so nothing gets dropped.
  if (lineItems.length > 0 && !out.some((b) => b.type === "line_items")) {
    out.push({ type: "line_items" });
  }

  return out;
}

function parseHtmlChunk(html: string): ContractBlock[] {
  const out: ContractBlock[] = [];
  // Very small HTML splitter — block tags only.
  const re = /<(h2|h3|ul|ol|p)>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(html)) !== null) {
    const between = html.slice(last, m.index).trim();
    if (between) {
      const text = stripHtml(between);
      if (text) out.push({ type: "text", content: text });
    }
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (tag === "h2" || tag === "h3") {
      out.push({ type: "heading", level: tag === "h2" ? 2 : 3, content: stripHtml(inner) });
    } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(inner.matchAll(/<li>([\s\S]*?)<\/li>/gi))
        .map((li) => stripHtml(li[1]))
        .filter(Boolean);
      if (items.length > 0) out.push({ type: "list", items });
    } else {
      const text = stripHtml(inner);
      if (text) out.push({ type: "text", content: text });
    }
    last = re.lastIndex;
  }
  const tail = html.slice(last).trim();
  if (tail) {
    const text = stripHtml(tail);
    if (text) out.push({ type: "text", content: text });
  }
  return out;
}
