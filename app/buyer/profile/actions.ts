"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { BUSINESS_TYPE_VALUES as businessTypes } from "../../lib/constants";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

export async function updateBuyerProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const businessType = value(formData, "business_type");
  const { error } = await supabase
    .from("profiles")
    .update({
      business_type: businessTypes.has(businessType) ? businessType : null,
      company_name: value(formData, "company_name") || null,
      country: value(formData, "country") || null,
      full_name: value(formData, "full_name") || null,
      phone: value(formData, "phone") || null,
      whatsapp: value(formData, "whatsapp") || null
    })
    .eq("user_id", user.id);

  if (error) {
    redirect("/buyer/profile?status=save-error");
  }

  revalidatePath("/buyer/profile");
  redirect("/buyer/profile?status=saved");
}
