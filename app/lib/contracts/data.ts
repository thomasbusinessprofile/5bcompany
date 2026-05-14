import { createSupabaseServerClient } from "../supabase/server";
import type { Contract, ContractTemplate, LineItem } from "./types";

type ContractRow = {
  id: string;
  contract_number: string;
  type: Contract["type"];
  version: number;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  quotation_id: string | null;
  template_id: string | null;
  buyer_legal_name: string;
  buyer_address: string | null;
  buyer_tax_id: string | null;
  buyer_signer_name: string | null;
  buyer_signer_email: string | null;
  buyer_signer_title: string | null;
  currency: string;
  total_amount: string | number;
  tax_pct: string | number;
  incoterm: string | null;
  payment_terms: string | null;
  validity_until: string | null;
  delivery_window: string | null;
  line_items: unknown;
  terms_html: string | null;
  language: string;
  pdf_url: string | null;
  signed_pdf_url: string | null;
  status: Contract["status"];
  share_token: string | null;
  share_token_expires_at: string | null;
  share_token_revoked_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  signer_typed_name: string | null;
  signature_method: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

const CONTRACT_COLUMNS =
  "id, contract_number, type, version, deal_id, contact_id, company_id, quotation_id, template_id, buyer_legal_name, buyer_address, buyer_tax_id, buyer_signer_name, buyer_signer_email, buyer_signer_title, currency, total_amount, tax_pct, incoterm, payment_terms, validity_until, delivery_window, line_items, terms_html, language, pdf_url, signed_pdf_url, status, share_token, share_token_expires_at, share_token_revoked_at, sent_at, viewed_at, signed_at, declined_at, signer_typed_name, signature_method, owner_id, created_at, updated_at";

export { CONTRACT_COLUMNS };
export type { ContractRow };

export function toContract(row: ContractRow): Contract {
  return {
    id: row.id,
    contractNumber: row.contract_number,
    type: row.type,
    version: row.version,
    dealId: row.deal_id,
    contactId: row.contact_id,
    companyId: row.company_id,
    quotationId: row.quotation_id,
    templateId: row.template_id,
    buyerLegalName: row.buyer_legal_name,
    buyerAddress: row.buyer_address,
    buyerTaxId: row.buyer_tax_id,
    buyerSignerName: row.buyer_signer_name,
    buyerSignerEmail: row.buyer_signer_email,
    buyerSignerTitle: row.buyer_signer_title,
    currency: row.currency,
    totalAmount: Number(row.total_amount),
    taxPct: Number(row.tax_pct),
    incoterm: row.incoterm,
    paymentTerms: row.payment_terms,
    validityUntil: row.validity_until,
    deliveryWindow: row.delivery_window,
    lineItems: Array.isArray(row.line_items) ? (row.line_items as LineItem[]) : [],
    termsHtml: row.terms_html,
    language: row.language,
    pdfUrl: row.pdf_url,
    signedPdfUrl: row.signed_pdf_url,
    status: row.status,
    shareToken: row.share_token,
    shareTokenExpiresAt: row.share_token_expires_at,
    shareTokenRevokedAt: row.share_token_revoked_at,
    sentAt: row.sent_at,
    viewedAt: row.viewed_at,
    signedAt: row.signed_at,
    declinedAt: row.declined_at,
    signerTypedName: row.signer_typed_name,
    signatureMethod: row.signature_method,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listContracts(): Promise<Contract[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(200);
  return ((data ?? []) as unknown as ContractRow[]).map(toContract);
}

export async function getContractById(id: string): Promise<Contract | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("contracts")
    .select(CONTRACT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return data ? toContract(data as unknown as ContractRow) : null;
}

export async function listContractTemplates(): Promise<ContractTemplate[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("contract_templates")
    .select(
      "id, name, type, language, terms_html, default_payment_terms, default_incoterm, default_validity_days, variables"
    )
    .order("name");
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    type: r.type as ContractTemplate["type"],
    language: r.language as string,
    termsHtml: r.terms_html as string,
    defaultPaymentTerms: (r.default_payment_terms as string) ?? null,
    defaultIncoterm: (r.default_incoterm as string) ?? null,
    defaultValidityDays: Number(r.default_validity_days ?? 14),
    variables: Array.isArray(r.variables) ? (r.variables as string[]) : []
  }));
}

export async function getContractTemplateById(id: string): Promise<ContractTemplate | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("contract_templates")
    .select(
      "id, name, type, language, terms_html, default_payment_terms, default_incoterm, default_validity_days, variables"
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    type: data.type as ContractTemplate["type"],
    language: data.language as string,
    termsHtml: data.terms_html as string,
    defaultPaymentTerms: (data.default_payment_terms as string) ?? null,
    defaultIncoterm: (data.default_incoterm as string) ?? null,
    defaultValidityDays: Number(data.default_validity_days ?? 14),
    variables: Array.isArray(data.variables) ? (data.variables as string[]) : []
  };
}

export async function listContractEvents(contractId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("contract_events")
    .select("id, event_type, actor, actor_email, ip, user_agent, metadata, occurred_at")
    .eq("contract_id", contractId)
    .order("occurred_at", { ascending: false });
  return data ?? [];
}

export async function listContractVersions(contractId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("contract_versions")
    .select("id, version, changed_by, changed_at")
    .eq("contract_id", contractId)
    .order("version", { ascending: false });
  return data ?? [];
}
