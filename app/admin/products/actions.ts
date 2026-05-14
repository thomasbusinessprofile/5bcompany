"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

function listValue(formData: FormData, key: string) {
  return value(formData, key)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveProduct(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const id = value(formData, "product_id");
  const name = value(formData, "name");
  const slug = slugify(value(formData, "slug") || name);

  if (!name || !slug) {
    redirect("/admin/products?status=missing-fields");
  }

  const payload = {
    applications: listValue(formData, "applications"),
    category_id: value(formData, "category_id") || null,
    documents: listValue(formData, "documents"),
    images: listValue(formData, "images"),
    lead_time: value(formData, "lead_time") || null,
    long_description: value(formData, "long_description") || null,
    moq: value(formData, "moq") || null,
    name,
    packing_options: listValue(formData, "packing_options"),
    seo_description: value(formData, "seo_description") || null,
    seo_title: value(formData, "seo_title") || null,
    short_description: value(formData, "short_description") || null,
    slug,
    specifications: listValue(formData, "specifications"),
    status: value(formData, "status") || "draft"
  };

  const result = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (result.error) {
    redirect("/admin/products?status=save-error");
  }

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products?status=saved");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const id = value(formData, "product_id");
  if (!id) redirect("/admin/products");
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?status=deleted");
}
