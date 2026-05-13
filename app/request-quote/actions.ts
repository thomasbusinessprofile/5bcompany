"use server";

import { redirect } from "next/navigation";
import { createPublicSupabaseClient } from "../lib/supabase/public";
import { validateEmail } from "../lib/form-utils";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}


export async function createPublicInquiry(formData: FormData) {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    redirect("/request-quote?status=config-error");
  }

  const fullName = getFormValue(formData, "full_name");
  const email = getFormValue(formData, "email");
  const productSlug = getFormValue(formData, "product_slug");
  const productName = getFormValue(formData, "product_name");
  const companyName = getFormValue(formData, "company_name");

  if (!fullName || !validateEmail(email) || !productName || !companyName) {
    redirect("/request-quote?status=missing-fields");
  }

  let productId: string | null = null;

  if (productSlug) {
    const { data } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
    productId = data?.id ?? null;
  }

  const { error } = await supabase.from("inquiries").insert({
    company_name: getFormValue(formData, "company_name") || null,
    country: getFormValue(formData, "country") || null,
    destination_port: getFormValue(formData, "destination_port") || null,
    email,
    full_name: fullName,
    message: getFormValue(formData, "message") || null,
    packing_requirement: getFormValue(formData, "packing_requirement") || null,
    phone: getFormValue(formData, "phone") || null,
    product_id: productId,
    product_name: productName,
    quantity: getFormValue(formData, "quantity") || null,
    source_page: productSlug ? `/products/${productSlug}` : "/request-quote",
    status: "new"
  });

  if (error) {
    redirect("/request-quote?status=submit-error");
  }

  redirect("/request-quote?status=submitted");
}
