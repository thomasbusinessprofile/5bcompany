export type ContractType = "loi" | "sample" | "proforma" | "sales" | "distribution";

export type ContractStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "declined"
  | "expired"
  | "superseded";

export type LineItem = {
  product_id?: string | null;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
};

export type Contract = {
  id: string;
  contractNumber: string;
  type: ContractType;
  version: number;
  dealId: string | null;
  contactId: string | null;
  companyId: string | null;
  quotationId: string | null;
  templateId: string | null;
  buyerLegalName: string;
  buyerAddress: string | null;
  buyerTaxId: string | null;
  buyerSignerName: string | null;
  buyerSignerEmail: string | null;
  buyerSignerTitle: string | null;
  currency: string;
  totalAmount: number;
  taxPct: number;
  incoterm: string | null;
  paymentTerms: string | null;
  validityUntil: string | null;
  deliveryWindow: string | null;
  lineItems: LineItem[];
  termsHtml: string | null;
  language: string;
  pdfUrl: string | null;
  signedPdfUrl: string | null;
  status: ContractStatus;
  shareToken: string | null;
  shareTokenExpiresAt: string | null;
  shareTokenRevokedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  signerTypedName: string | null;
  signatureMethod: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContractTemplate = {
  id: string;
  name: string;
  type: ContractType;
  language: string;
  termsHtml: string;
  defaultPaymentTerms: string | null;
  defaultIncoterm: string | null;
  defaultValidityDays: number;
  variables: string[];
};

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  loi: "Letter of Intent",
  sample: "Sample Agreement",
  proforma: "Proforma Invoice",
  sales: "Sales Contract",
  distribution: "Distribution Agreement"
};

export function validateLineItems(input: unknown): LineItem[] {
  if (!Array.isArray(input)) return [];
  const out: LineItem[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const quantity = Number(r.quantity ?? 0);
    const unit_price = Number(r.unit_price ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    if (!Number.isFinite(unit_price) || unit_price < 0) continue;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue;
    out.push({
      product_id: typeof r.product_id === "string" ? r.product_id : null,
      name,
      description: typeof r.description === "string" ? r.description : "",
      quantity,
      unit: typeof r.unit === "string" ? r.unit : "pc",
      unit_price,
      // Always recompute subtotal — never trust client.
      subtotal: Math.round(quantity * unit_price * 100) / 100
    });
  }
  return out;
}

export function sumLineItems(items: LineItem[]): number {
  return Math.round(items.reduce((sum, i) => sum + i.subtotal, 0) * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
