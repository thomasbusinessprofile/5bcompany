import { createSupabaseServerClient } from "../lib/supabase/server";

export type QuotationDetail = {
  currency: string;
  id: string;
  incoterm: string;
  items: Array<{
    amount: number;
    description: string;
    id: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
  leadTime: string;
  notes: string;
  paymentTerms: string;
  quoteNumber: string;
  requestId: string;
  requestTitle: string;
  status: string;
  subtotal: number;
  validityDays: number;
};

type QuotationRow = {
  currency: string;
  id: string;
  incoterm: string | null;
  lead_time: string | null;
  notes: string | null;
  payment_terms: string | null;
  quote_number: string;
  request_id: string;
  sourcing_requests: {
    title: string;
  } | null;
  status: string;
  subtotal: number;
  validity_days: number;
};

type QuotationItemRow = {
  amount: number;
  description: string | null;
  id: string;
  product_name: string;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
};

export async function getQuotationById(id: string): Promise<QuotationDetail | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: quote, error } = await supabase
    .from("quotations")
    .select("id,request_id,quote_number,status,currency,incoterm,payment_terms,validity_days,lead_time,notes,subtotal,sourcing_requests(title)")
    .eq("id", id)
    .maybeSingle();

  if (error || !quote) {
    return null;
  }

  const { data: items } = await supabase
    .from("quotation_items")
    .select("id,product_name,description,quantity,unit,unit_price,amount")
    .eq("quotation_id", id)
    .order("sort_order", { ascending: true });

  const row = quote as unknown as QuotationRow;

  return {
    currency: row.currency,
    id: row.id,
    incoterm: row.incoterm ?? "",
    items: ((items ?? []) as QuotationItemRow[]).map((item) => ({
      amount: Number(item.amount ?? 0),
      description: item.description ?? "",
      id: item.id,
      productName: item.product_name,
      quantity: Number(item.quantity ?? 0),
      unit: item.unit ?? "",
      unitPrice: Number(item.unit_price ?? 0)
    })),
    leadTime: row.lead_time ?? "",
    notes: row.notes ?? "",
    paymentTerms: row.payment_terms ?? "",
    quoteNumber: row.quote_number,
    requestId: row.request_id,
    requestTitle: row.sourcing_requests?.title ?? "Sourcing request",
    status: row.status,
    subtotal: Number(row.subtotal ?? 0),
    validityDays: row.validity_days
  };
}

export async function getSentQuotationsForRequest(requestId: string): Promise<QuotationDetail[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("quotations")
    .select("id")
    .eq("request_id", requestId)
    .in("status", ["sent", "sent_to_buyer", "accepted", "rejected"])
    .order("created_at", { ascending: false });

  const quotes = await Promise.all(
    (data ?? []).map((quote) => getQuotationById(quote.id as string))
  );

  return quotes.filter((quote): quote is QuotationDetail => quote !== null);
}
