"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { trackEvent } from "../../../shared/analytics";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

function numberValue(formData: FormData, key: string) {
  const parsed = Number(value(formData, key));

  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateQuotationDraft(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const quoteId = value(formData, "quotation_id");
  const itemId = value(formData, "item_id");

  if (!supabase || !quoteId) {
    redirect("/admin/requests");
  }

  const quantity = numberValue(formData, "quantity");
  const unitPrice = numberValue(formData, "unit_price");
  const subtotal = (quantity ?? 0) * (unitPrice ?? 0);
  const { error: quoteError } = await supabase
    .from("quotations")
    .update({
      currency: value(formData, "currency") || "USD",
      incoterm: value(formData, "incoterm") || null,
      lead_time: value(formData, "lead_time") || null,
      notes: value(formData, "notes") || null,
      payment_terms: value(formData, "payment_terms") || null,
      subtotal,
      validity_days: numberValue(formData, "validity_days") ?? 7
    })
    .eq("id", quoteId);

  if (quoteError) {
    redirect(`/admin/quotations/${quoteId}?status=save-error`);
  }

  if (itemId) {
    const { error: itemError } = await supabase
      .from("quotation_items")
      .update({
        description: value(formData, "description") || null,
        product_name: value(formData, "product_name") || "Product",
        quantity,
        unit: value(formData, "unit") || null,
        unit_price: unitPrice
      })
      .eq("id", itemId);

    if (itemError) {
      redirect(`/admin/quotations/${quoteId}?status=save-error`);
    }
  }

  revalidatePath(`/admin/quotations/${quoteId}`);
  redirect(`/admin/quotations/${quoteId}?status=saved`);
}

export async function sendQuotationToBuyer(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const quoteId = value(formData, "quotation_id");

  if (!supabase || !quoteId) {
    redirect("/admin/requests");
  }

  const { data: quote } = await supabase
    .from("quotations")
    .select("request_id")
    .eq("id", quoteId)
    .maybeSingle();

  if (!quote?.request_id) {
    redirect(`/admin/quotations/${quoteId}?status=send-error`);
  }

  const { error } = await supabase
    .from("quotations")
    .update({ status: "sent" })
    .eq("id", quoteId);

  if (error) {
    redirect(`/admin/quotations/${quoteId}?status=send-error`);
  }

  await supabase
    .from("sourcing_requests")
    .update({ status: "quotation_sent" })
    .eq("id", quote.request_id);

  await trackEvent("quotation_sent", { quotation_id: quoteId, request_id: quote.request_id });

  revalidatePath(`/admin/quotations/${quoteId}`);
  revalidatePath(`/buyer/requests/${quote.request_id}`);
  redirect(`/admin/quotations/${quoteId}?status=sent`);
}
