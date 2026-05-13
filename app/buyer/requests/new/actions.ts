"use server";

import { redirect } from "next/navigation";
import { getCurrentBuyerProfileId } from "../../../shared/buyer-data";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

function numericValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function createBuyerSourcingRequest(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const buyerId = await getCurrentBuyerProfileId();
  const title = value(formData, "title");
  const productName = value(formData, "product_name");

  if (!title || !productName) {
    redirect("/buyer/requests/new?status=missing-fields");
  }

  const categorySlug = value(formData, "category_slug");
  const productSlug = value(formData, "product_slug");
  let categoryId: string | null = null;
  let productId: string | null = null;

  if (categorySlug) {
    const { data } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    categoryId = data?.id ?? null;
  }

  if (productSlug) {
    const { data } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
    productId = data?.id ?? null;
  }

  const { data, error } = await supabase
    .from("sourcing_requests")
    .insert({
      buyer_id: buyerId,
      category_id: categoryId,
      description: value(formData, "description") || null,
      destination_country: value(formData, "destination_country") || null,
      destination_port: value(formData, "destination_port") || null,
      document_requirement: value(formData, "document_requirement") || null,
      incoterm: value(formData, "incoterm") || null,
      packing_requirement: value(formData, "packing_requirement") || null,
      product_id: productId,
      product_name: productName,
      quality_requirement: value(formData, "quality_requirement") || null,
      source: "buyer_portal",
      status: "new",
      target_price: numericValue(formData, "target_price"),
      target_quantity: numericValue(formData, "target_quantity"),
      timeline: value(formData, "timeline") || null,
      title,
      unit: value(formData, "unit") || null
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect("/buyer/requests/new?status=submit-error");
  }

  redirect(`/buyer/requests/${data.id}`);
}
