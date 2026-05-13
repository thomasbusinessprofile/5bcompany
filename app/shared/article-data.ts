import { createPublicSupabaseClient } from "../lib/supabase/public";
import { createSupabaseServerClient } from "../lib/supabase/server";

export type Article = {
  body: string;
  excerpt: string;
  id: string;
  keyword: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: string;
  title: string;
};

const fallbackArticles: Article[] = [
  {
    body: "Confirm roll height, roll length, finish, packing, retail label requirements, destination port, and target timeline before admin prepares quotation.",
    excerpt:
      "Prepare roll size, quantity, destination port, packing label needs, and timeline before requesting a quotation.",
    id: "fallback-bamboo",
    keyword: "Vietnam bamboo fence supplier",
    seoDescription: "Buyer guide for sourcing bamboo fence from Vietnam with structured request inputs.",
    seoTitle: "How to source bamboo fence from Vietnam",
    slug: "how-to-source-bamboo-fence-from-vietnam",
    status: "published",
    title: "How to source bamboo fence from Vietnam"
  },
  {
    body: "Prepare thickness, width, roll weight or length, hand roll or machine roll type, color, packing, monthly quantity, and destination port before quotation.",
    excerpt:
      "Clarify thickness, width, length, roll type, color, and monthly quantity before quote preparation.",
    id: "fallback-stretch",
    keyword: "Stretch film supplier Vietnam",
    seoDescription: "Checklist for buyers preparing stretch film sourcing requests from Vietnam.",
    seoTitle: "Stretch film sourcing checklist",
    slug: "stretch-film-sourcing-checklist",
    status: "published",
    title: "Stretch film sourcing checklist"
  }
];

type ArticleRow = {
  body: string | null;
  excerpt: string | null;
  id: string;
  keyword: string | null;
  seo_description: string | null;
  seo_title: string | null;
  slug: string;
  status: string;
  title: string;
};

function toArticle(row: ArticleRow): Article {
  return {
    body: row.body ?? "",
    excerpt: row.excerpt ?? "",
    id: row.id,
    keyword: row.keyword ?? "",
    seoDescription: row.seo_description ?? "",
    seoTitle: row.seo_title ?? row.title,
    slug: row.slug,
    status: row.status,
    title: row.title
  };
}

export async function getPublicArticles() {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    return fallbackArticles;
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id,slug,title,excerpt,body,keyword,seo_title,seo_description,status")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return fallbackArticles;
  }

  return (data as ArticleRow[]).map(toArticle);
}

export async function getPublicArticleBySlug(slug: string) {
  const articles = await getPublicArticles();

  return articles.find((article) => article.slug === slug) ?? null;
}

export async function getCmsArticles() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("articles")
    .select("id,slug,title,excerpt,body,keyword,seo_title,seo_description,status")
    .order("updated_at", { ascending: false });

  return ((data ?? []) as ArticleRow[]).map(toArticle);
}
