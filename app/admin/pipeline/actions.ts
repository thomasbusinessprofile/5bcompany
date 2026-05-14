"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

function val(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function num(formData: FormData, key: string): number | null {
  const v = val(formData, key);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function saveDeal(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const id = val(formData, "deal_id");
  const title = val(formData, "title");
  const stageId = val(formData, "stage_id");
  if (!title || !stageId) redirect("/admin/pipeline?status=missing-fields");

  const payload = {
    title,
    stage_id: stageId,
    company_id: val(formData, "company_id") || null,
    contact_id: val(formData, "contact_id") || null,
    inquiry_id: val(formData, "inquiry_id") || null,
    value_usd: num(formData, "value_usd"),
    currency: val(formData, "currency") || "USD",
    product_summary: val(formData, "product_summary") || null,
    expected_close_date: val(formData, "expected_close_date") || null,
    lost_reason: val(formData, "lost_reason") || null,
    source: val(formData, "source") || null
  };

  const result = id
    ? await supabase.from("crm_deals").update(payload).eq("id", id)
    : await supabase.from("crm_deals").insert(payload).select("id").maybeSingle();

  if (result.error) redirect("/admin/pipeline?status=save-error");

  revalidatePath("/admin/pipeline");
  if (id) revalidatePath(`/admin/deals/${id}`);
  if (payload.contact_id) revalidatePath(`/admin/contacts/${payload.contact_id}`);

  const redirectTo = val(formData, "redirect_to");
  redirect(redirectTo || (id ? `/admin/deals/${id}` : "/admin/pipeline?status=saved"));
}

export async function moveDealStage(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const dealId = val(formData, "deal_id");
  const stageId = val(formData, "stage_id");
  if (!dealId || !stageId) redirect("/admin/pipeline");

  await supabase.from("crm_deals").update({ stage_id: stageId }).eq("id", dealId);
  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/deals/${dealId}`);
  redirect(val(formData, "redirect_to") || "/admin/pipeline");
}

export async function deleteDeal(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const id = val(formData, "deal_id");
  if (!id) redirect("/admin/pipeline");
  await supabase.from("crm_deals").delete().eq("id", id);
  revalidatePath("/admin/pipeline");
  redirect("/admin/pipeline?status=deleted");
}

// Convert an inquiry (RFQ) into a deal, prefilling fields from the inquiry row.
export async function convertInquiryToDeal(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const inquiryId = val(formData, "inquiry_id");
  if (!inquiryId) redirect("/admin/requests");

  const inq = await supabase
    .from("inquiries")
    .select("id, product_name, quantity, company_name, country, contact_id")
    .eq("id", inquiryId)
    .maybeSingle();

  if (!inq.data) redirect("/admin/requests");

  const leadStage = await supabase
    .from("crm_deal_stages")
    .select("id")
    .eq("name", "Qualified")
    .maybeSingle();

  let companyId: string | null = null;
  if (inq.data.contact_id) {
    const c = await supabase
      .from("crm_contacts")
      .select("company_id")
      .eq("id", inq.data.contact_id)
      .maybeSingle();
    companyId = (c.data?.company_id as string) ?? null;
  }

  const title = `${inq.data.product_name ?? "RFQ"} — ${inq.data.company_name ?? "Unknown"}`;

  const { data: created } = await supabase
    .from("crm_deals")
    .insert({
      title,
      stage_id: leadStage.data?.id,
      company_id: companyId,
      contact_id: inq.data.contact_id ?? null,
      inquiry_id: inq.data.id,
      product_summary: [inq.data.product_name, inq.data.quantity].filter(Boolean).join(" · "),
      source: "RFQ form"
    })
    .select("id")
    .maybeSingle();

  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/requests/${inquiryId}`);
  redirect(created?.id ? `/admin/deals/${created.id}` : "/admin/pipeline");
}
