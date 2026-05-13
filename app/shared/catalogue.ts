import { createPublicSupabaseClient } from "../lib/supabase/public";
import {
  productCategories as fallbackCategories,
  productGroups as fallbackProducts,
  type ProductCategory,
  type ProductGroup
} from "./data";

type ProductCategoryRow = {
  slug: string;
  name: string;
  description: string | null;
};

type ProductRow = {
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  applications: string[] | null;
  specifications: string[] | null;
  packing_options: string[] | null;
  moq: string | null;
  lead_time: string | null;
  documents: string[] | null;
  product_categories:
    | {
        slug: string;
      }
    | {
        slug: string;
      }[]
    | null;
};

const defaultRequestFields = [
  "Product specification",
  "Target quantity",
  "Destination port",
  "Packing requirement",
  "Timeline"
];

function listFromJson(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function buildTags(product: ProductGroup) {
  return [...product.specs, ...product.packingOptions].slice(0, 3);
}

function getProductCategorySlug(row: ProductRow) {
  const relation = row.product_categories;

  if (Array.isArray(relation)) {
    return relation[0]?.slug ?? "";
  }

  return relation?.slug ?? "";
}

function toProductGroup(row: ProductRow, relatedSlugs: string[]): ProductGroup {
  const specs = listFromJson(row.specifications);
  const packingOptions = listFromJson(row.packing_options);
  
  // Try to find a fallback image if the DB row doesn't have one
  const fallback = fallbackProducts.find(p => p.slug === row.slug);
  
  const product: ProductGroup = {
    applications: listFromJson(row.applications),
    category: getProductCategorySlug(row),
    description: row.long_description ?? row.short_description ?? "",
    documents: listFromJson(row.documents),
    leadTime: row.lead_time ?? "Subject to confirmed specification and production plan.",
    moq: row.moq ?? "Contact for details.",
    name: row.name,
    packingOptions,
    relatedSlugs,
    requestFields: defaultRequestFields,
    slug: row.slug,
    specs,
    summary: row.short_description ?? row.long_description ?? "",
    tags: [],
    image: fallback?.image // Assign image from fallback data
  };

  return {
    ...product,
    tags: buildTags(product)
  };
}

export async function getCatalogueData(): Promise<{
  categories: ProductCategory[];
  products: ProductGroup[];
}> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return {
      categories: fallbackCategories,
      products: fallbackProducts
    };
  }

  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("product_categories")
      .select("slug,name,description")
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "slug,name,short_description,long_description,applications,specifications,packing_options,moq,lead_time,documents,product_categories(slug)"
      )
      .eq("status", "published")
      .order("name", { ascending: true })
  ]);

  if (categoriesResult.error || productsResult.error) {
    return {
      categories: fallbackCategories,
      products: fallbackProducts
    };
  }

  const categories = (categoriesResult.data as ProductCategoryRow[]).map((category) => {
    const fallback = fallbackCategories.find(c => c.slug === category.slug);
    return {
      description: category.description ?? "",
      name: category.name,
      slug: category.slug,
      image: fallback?.image
    };
  });

  const rows = productsResult.data as unknown as ProductRow[];
  const products = rows.map((row) => {
    const category = getProductCategorySlug(row);
    const relatedSlugs = rows
      .filter((item) => item.slug !== row.slug && getProductCategorySlug(item) === category)
      .map((item) => item.slug)
      .slice(0, 3);

    return toProductGroup(row, relatedSlugs);
  });

  return {
    categories: categories.length > 0 ? categories : fallbackCategories,
    products: products.length > 0 ? products : fallbackProducts
  };
}

export async function getCatalogueProductBySlug(slug: string) {
  const { categories, products } = await getCatalogueData();
  const product = products.find((item) => item.slug === slug);

  return {
    categories,
    product,
    products
  };
}

export function getCategoryNameFromList(categories: ProductCategory[], slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? "Product";
}
