import { createSupabaseServerClient } from "../lib/supabase/server";

export type CmsCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CmsProduct = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  applications: string[];
  specifications: string[];
  packingOptions: string[];
  documents: string[];
  images: string[];
  moq: string;
  leadTime: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  applications: unknown;
  specifications: unknown;
  packing_options: unknown;
  documents: unknown;
  images: unknown;
  moq: string | null;
  lead_time: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object" && "url" in v && typeof (v as { url: unknown }).url === "string") {
        return (v as { url: string }).url;
      }
      return "";
    })
    .filter(Boolean);
}

export async function getProductCmsData() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { categories: [] as CmsCategory[], products: [] as CmsProduct[] };
  }

  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("product_categories").select("id,slug,name").order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id,slug,name,short_description,long_description,applications,specifications,packing_options,documents,images,moq,lead_time,seo_title,seo_description,status,category_id"
      )
      .order("updated_at", { ascending: false })
  ]);

  return {
    categories: ((categoriesResult.data ?? []) as CategoryRow[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug
    })),
    products: ((productsResult.data ?? []) as ProductRow[]).map((p) => ({
      id: p.id,
      categoryId: p.category_id ?? "",
      slug: p.slug,
      name: p.name,
      shortDescription: p.short_description ?? "",
      longDescription: p.long_description ?? "",
      applications: asStringArray(p.applications),
      specifications: asStringArray(p.specifications),
      packingOptions: asStringArray(p.packing_options),
      documents: asStringArray(p.documents),
      images: asStringArray(p.images),
      moq: p.moq ?? "",
      leadTime: p.lead_time ?? "",
      seoTitle: p.seo_title ?? "",
      seoDescription: p.seo_description ?? "",
      status: p.status
    }))
  };
}
