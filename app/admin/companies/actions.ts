"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { requireAdminRole } from "../../lib/auth/require-admin";

function val(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

export async function saveCompany(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);

  const id = val(formData, "company_id");
  const name = val(formData, "name");
  if (!name) redirect("/admin/companies?status=missing-fields");

  const payload = {
    name,
    country: val(formData, "country") || null,
    website: val(formData, "website") || null,
    industry: val(formData, "industry") || null,
    size_band: val(formData, "size_band") || null,
    notes: val(formData, "notes") || null
  };

  const result = id
    ? await supabase.from("crm_companies").update(payload).eq("id", id)
    : await supabase.from("crm_companies").insert(payload);

  if (result.error) redirect("/admin/companies?status=save-error");

  revalidatePath("/admin/companies");
  if (id) revalidatePath(`/admin/companies/${id}`);
  redirect(id ? `/admin/companies/${id}?status=saved` : "/admin/companies?status=saved");
}

export async function deleteCompany(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  await requireAdminRole(supabase);
  const id = val(formData, "company_id");
  if (id) await supabase.from("crm_companies").delete().eq("id", id);
  revalidatePath("/admin/companies");
  redirect("/admin/companies?status=deleted");
}
