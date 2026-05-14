"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { requireAdminRole } from "../../lib/auth/require-admin";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveArticle(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  await requireAdminRole(supabase);

  const id = value(formData, "article_id");
  const title = value(formData, "title");
  const slug = slugify(value(formData, "slug") || title);
  const status = value(formData, "status") || "draft";

  if (!title || !slug) {
    redirect("/admin/articles?status=missing-fields");
  }

  const publishedAtInput = value(formData, "published_at");
  const published_at = publishedAtInput
    ? new Date(publishedAtInput).toISOString()
    : status === "published"
    ? new Date().toISOString()
    : null;

  const payload = {
    body: value(formData, "body") || null,
    category: value(formData, "category") || null,
    excerpt: value(formData, "excerpt") || null,
    image_url: value(formData, "image_url") || null,
    keyword: value(formData, "keyword") || null,
    published_at,
    seo_description: value(formData, "seo_description") || null,
    seo_title: value(formData, "seo_title") || null,
    slug,
    status,
    title
  };

  const result = id
    ? await supabase.from("articles").update(payload).eq("id", id)
    : await supabase.from("articles").insert(payload);

  if (result.error) {
    redirect("/admin/articles?status=save-error");
  }

  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/admin/articles");
  redirect("/admin/articles?status=saved");
}
