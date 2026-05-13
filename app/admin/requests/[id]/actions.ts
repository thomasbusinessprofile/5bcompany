"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStaffProfileId } from "../../../shared/admin-data";
import { structureRequestWithAi } from "../../../shared/ai-request-structure";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { trackEvent } from "../../../shared/analytics";

const requestStatuses = new Set([
  "new",
  "ai_structured",
  "admin_review",
  "need_more_info",
  "sourcing_in_progress",
  "quotation_preparing",
  "quotation_sent",
  "sample_discussion",
  "negotiating",
  "won",
  "lost",
  "closed",
  "spam"
]);

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

export async function updateRequestStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffProfileId();
  const requestId = value(formData, "request_id");
  const status = value(formData, "status");
  const note = value(formData, "note");

  if (!supabase || !staffId || !requestId || !requestStatuses.has(status)) {
    redirect(requestId ? `/admin/requests/${requestId}?status=update-error` : "/admin/requests");
  }

  const { data: current } = await supabase
    .from("sourcing_requests")
    .select("status")
    .eq("id", requestId)
    .maybeSingle();

  const { error } = await supabase
    .from("sourcing_requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    redirect(`/admin/requests/${requestId}?status=update-error`);
  }

  await supabase.from("request_status_history").insert({
    changed_by: staffId,
    new_status: status,
    note: note || null,
    old_status: current?.status ?? null,
    request_id: requestId
  });

  await trackEvent("admin_status_changed", { request_id: requestId, old_status: current?.status, new_status: status });

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  redirect(`/admin/requests/${requestId}?status=updated`);
}

export async function sendAdminMessage(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffProfileId();
  const requestId = value(formData, "request_id");
  const message = value(formData, "message");
  const isInternal = value(formData, "is_internal") === "on";

  if (!supabase || !staffId || !requestId || !message) {
    redirect(requestId ? `/admin/requests/${requestId}?status=message-error` : "/admin/requests");
  }

  const { error } = await supabase.from("request_messages").insert({
    is_internal: isInternal,
    message,
    request_id: requestId,
    sender_id: staffId,
    sender_role: "admin"
  });

  if (error) {
    redirect(`/admin/requests/${requestId}?status=message-error`);
  }

  revalidatePath(`/admin/requests/${requestId}`);
  redirect(`/admin/requests/${requestId}?status=message-sent#messages`);
}

export async function structureRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffProfileId();
  const requestId = value(formData, "request_id");

  if (!supabase || !staffId || !requestId) {
    redirect(requestId ? `/admin/requests/${requestId}?status=ai-error` : "/admin/requests");
  }

  const { data: request, error } = await supabase
    .from("sourcing_requests")
    .select(
      "title,description,product_name,target_quantity,unit,destination_country,destination_port,incoterm,packing_requirement,quality_requirement,document_requirement,timeline,status"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !request) {
    redirect(`/admin/requests/${requestId}?status=ai-error`);
  }

  const structured = await structureRequestWithAi({
    description: request.description ?? "",
    destination: [request.destination_port, request.destination_country].filter(Boolean).join(", "),
    documentRequirement: request.document_requirement ?? "",
    incoterm: request.incoterm ?? "",
    packing: request.packing_requirement ?? "",
    product: request.product_name ?? "",
    qualityRequirement: request.quality_requirement ?? "",
    quantity: [request.target_quantity, request.unit].filter(Boolean).join(" "),
    timeline: request.timeline ?? "",
    title: request.title
  });

  const nextStatus = request.status === "new" ? "ai_structured" : request.status;
  const { error: updateError } = await supabase
    .from("sourcing_requests")
    .update({
      ai_missing_fields: structured.missingFields,
      ai_suggested_questions: structured.questions,
      ai_summary: structured.summary,
      lead_score: structured.leadScore,
      status: nextStatus
    })
    .eq("id", requestId);

  if (updateError) {
    redirect(`/admin/requests/${requestId}?status=ai-error`);
  }

  if (nextStatus !== request.status) {
    await supabase.from("request_status_history").insert({
      changed_by: staffId,
      new_status: nextStatus,
      note: "AI structured request for admin review.",
      old_status: request.status,
      request_id: requestId
    });
  }

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/admin/requests");
  redirect(`/admin/requests/${requestId}?status=ai-structured`);
}

export async function createQuotationDraft(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const staffId = await getCurrentStaffProfileId();
  const requestId = value(formData, "request_id");

  if (!supabase || !staffId || !requestId) {
    redirect(requestId ? `/admin/requests/${requestId}?status=quote-error` : "/admin/requests");
  }

  const { data: request } = await supabase
    .from("sourcing_requests")
    .select("id,buyer_id,title,product_name,target_quantity,unit,incoterm,timeline")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) {
    redirect(`/admin/requests/${requestId}?status=quote-error`);
  }

  const existing = await supabase
    .from("quotations")
    .select("id")
    .eq("request_id", requestId)
    .eq("status", "draft")
    .maybeSingle();

  if (existing.data?.id) {
    redirect(`/admin/quotations/${existing.data.id}`);
  }

  const quoteNumber = `QT-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${requestId.slice(0, 6).toUpperCase()}`;
  const { data: quote, error } = await supabase
    .from("quotations")
    .insert({
      buyer_id: request.buyer_id,
      created_by: staffId,
      incoterm: request.incoterm ?? null,
      lead_time: request.timeline ?? null,
      notes: "Draft only. Final price, stock, lead time, and documents require admin approval.",
      quote_number: quoteNumber,
      request_id: requestId,
      status: "draft"
    })
    .select("id")
    .single();

  if (error || !quote?.id) {
    redirect(`/admin/requests/${requestId}?status=quote-error`);
  }

  await supabase.from("quotation_items").insert({
    product_name: request.product_name ?? request.title,
    quantity: request.target_quantity ?? null,
    quotation_id: quote.id,
    sort_order: 10,
    unit: request.unit ?? null
  });

  await supabase
    .from("sourcing_requests")
    .update({ status: "quotation_preparing" })
    .eq("id", requestId);

  redirect(`/admin/quotations/${quote.id}`);
}
