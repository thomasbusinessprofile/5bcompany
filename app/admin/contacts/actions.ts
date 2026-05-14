"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

function val(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

export async function saveContact(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const id = val(formData, "contact_id");
  const fullName = val(formData, "full_name");
  if (!fullName) redirect("/admin/contacts?status=missing-fields");

  const payload = {
    full_name: fullName,
    email: val(formData, "email") || null,
    phone: val(formData, "phone") || null,
    whatsapp: val(formData, "whatsapp") || null,
    role_title: val(formData, "role_title") || null,
    company_id: val(formData, "company_id") || null,
    source: val(formData, "source") || null,
    notes: val(formData, "notes") || null
  };

  const result = id
    ? await supabase.from("crm_contacts").update(payload).eq("id", id)
    : await supabase.from("crm_contacts").insert(payload).select("id").maybeSingle();

  if (result.error) {
    redirect("/admin/contacts?status=save-error");
  }

  revalidatePath("/admin/contacts");
  if (id) revalidatePath(`/admin/contacts/${id}`);
  redirect(id ? `/admin/contacts/${id}?status=saved` : "/admin/contacts?status=saved");
}

export async function deleteContact(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const id = val(formData, "contact_id");
  if (!id) redirect("/admin/contacts");

  await supabase.from("crm_contacts").delete().eq("id", id);
  revalidatePath("/admin/contacts");
  redirect("/admin/contacts?status=deleted");
}
