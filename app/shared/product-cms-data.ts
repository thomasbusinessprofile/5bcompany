import { createSupabaseServerClient } from "../lib/supabase/server";

export type CmsCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CmsProduct = {
  categoryId: string;
  id: string;
  name: string;
  shortDescription: string;
  slug: string;
  status: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  category_id: string | null;
  id: string;
  name: string;
  short_description: string | null;
  slug: string;
  status: string;
};

export async function getProductCmsData() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { categories: [], products: [] };
  }

  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("product_categories").select("id,slug,name").order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id,slug,name,short_description,status,category_id")
      .order("updated_at", { ascending: false })
  ]);

  return {
    categories: ((categoriesResult.data ?? []) as CategoryRow[]).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    })),
    products: ((productsResult.data ?? []) as ProductRow[]).map((product) => ({
      categoryId: product.category_id ?? "",
      id: product.id,
      name: product.name,
      shortDescription: product.short_description ?? "",
      slug: product.slug,
      status: product.status
    }))
  };
}
