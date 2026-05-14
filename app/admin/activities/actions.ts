"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeInternalPath } from "../../lib/auth/safe-redirect";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { requireAdminRole } from "../../lib/auth/require-admin";

function val(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

const TYPES = ["call", "email", "meeting", "whatsapp", "note", "task"] as const;

export async function saveActivity(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const type = val(formData, "type");
  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    redirect("/admin/activities?status=invalid-type");
  }

  const contactId = val(formData, "contact_id") || null;
  const occurredInput = val(formData, "occurred_at");
  const dueInput = val(formData, "due_at");

  const dealId = val(formData, "deal_id") || null;

  const payload = {
    type,
    subject: val(formData, "subject") || null,
    body: val(formData, "body") || null,
    contact_id: contactId,
    deal_id: dealId,
    inquiry_id: val(formData, "inquiry_id") || null,
    occurred_at: occurredInput ? new Date(occurredInput).toISOString() : new Date().toISOString(),
    due_at: dueInput ? new Date(dueInput).toISOString() : null
  };

  const id = val(formData, "activity_id");
  const result = id
    ? await supabase.from("crm_activities").update(payload).eq("id", id)
    : await supabase.from("crm_activities").insert(payload);

  if (result.error) {
    redirect(`/admin/activities?status=save-error`);
  }

  if (contactId) revalidatePath(`/admin/contacts/${contactId}`);
  if (dealId) revalidatePath(`/admin/deals/${dealId}`);
  revalidatePath("/admin/activities");
  revalidatePath("/admin/tasks");

  redirect(safeInternalPath(val(formData, "redirect_to")) ?? "/admin/activities?status=saved");
}

export async function toggleTaskComplete(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "activity_id");
  if (!id) redirect("/admin/tasks");

  const current = await supabase.from("crm_activities").select("completed_at, contact_id").eq("id", id).maybeSingle();
  const completed_at = current.data?.completed_at ? null : new Date().toISOString();
  await supabase.from("crm_activities").update({ completed_at }).eq("id", id);

  if (current.data?.contact_id) revalidatePath(`/admin/contacts/${current.data.contact_id}`);
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/activities");
  redirect(safeInternalPath(val(formData, "redirect_to")) ??"/admin/tasks");
}

export async function deleteActivity(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "activity_id");
  if (!id) redirect("/admin/activities");

  const current = await supabase.from("crm_activities").select("contact_id").eq("id", id).maybeSingle();
  await supabase.from("crm_activities").delete().eq("id", id);
  if (current.data?.contact_id) revalidatePath(`/admin/contacts/${current.data.contact_id}`);
  revalidatePath("/admin/activities");
  revalidatePath("/admin/tasks");
  redirect(safeInternalPath(val(formData, "redirect_to")) ??"/admin/activities");
}
