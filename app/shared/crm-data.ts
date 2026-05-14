import { createSupabaseServerClient } from "../lib/supabase/server";

export type CrmCompany = {
  id: string;
  name: string;
  country: string | null;
  website: string | null;
  industry: string | null;
  sizeBand: string | null;
  notes: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  contactCount?: number;
};

export type CrmContact = {
  id: string;
  companyId: string | null;
  companyName: string | null;
  profileId: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  roleTitle: string | null;
  source: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: { id: string; name: string; color: string }[];
};

type ContactRow = {
  id: string;
  company_id: string | null;
  profile_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  role_title: string | null;
  source: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  crm_companies?: { name: string } | null;
  crm_contact_tags?: { tag_id: string; crm_tags: { id: string; name: string; color: string } | null }[];
};

type CompanyRow = {
  id: string;
  name: string;
  country: string | null;
  website: string | null;
  industry: string | null;
  size_band: string | null;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

function toContact(row: ContactRow): CrmContact {
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.crm_companies?.name ?? null,
    profileId: row.profile_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    roleTitle: row.role_title,
    source: row.source,
    notes: row.notes,
    lastContactedAt: row.last_contacted_at,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags:
      row.crm_contact_tags
        ?.map((t) => t.crm_tags)
        .filter((t): t is { id: string; name: string; color: string } => t !== null) ?? []
  };
}

function toCompany(row: CompanyRow): CrmCompany {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    website: row.website,
    industry: row.industry,
    sizeBand: row.size_band,
    notes: row.notes,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const CONTACT_SELECT =
  "id, company_id, profile_id, full_name, email, phone, whatsapp, role_title, source, notes, last_contacted_at, owner_id, created_at, updated_at, crm_companies(name), crm_contact_tags(tag_id, crm_tags(id,name,color))";

const COMPANY_SELECT =
  "id, name, country, website, industry, size_band, notes, owner_id, created_at, updated_at";

export async function listContacts(search?: string): Promise<CrmContact[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("crm_contacts")
    .select(CONTACT_SELECT)
    .order("last_contacted_at", { ascending: false, nullsFirst: false })
    .limit(200);

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(`full_name.ilike.${s},email.ilike.${s}`);
  }

  const { data } = await query;
  return ((data ?? []) as unknown as ContactRow[]).map(toContact);
}

export async function getContactById(id: string): Promise<CrmContact | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("crm_contacts")
    .select(CONTACT_SELECT)
    .eq("id", id)
    .maybeSingle();

  return data ? toContact(data as unknown as ContactRow) : null;
}

export async function getContactInquiries(contactId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("inquiries")
    .select("id, product_name, quantity, status, created_at, message")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function listCompanies(search?: string): Promise<CrmCompany[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("crm_companies")
    .select(COMPANY_SELECT + ", crm_contacts(count)")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(`name.ilike.${s},country.ilike.${s}`);
  }

  const { data } = await query;
  return ((data ?? []) as unknown as (CompanyRow & { crm_contacts?: { count: number }[] })[]).map(
    (row) => ({
      ...toCompany(row),
      contactCount: row.crm_contacts?.[0]?.count ?? 0
    })
  );
}

export async function getCompanyById(id: string): Promise<CrmCompany | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("crm_companies")
    .select(COMPANY_SELECT)
    .eq("id", id)
    .maybeSingle();

  return data ? toCompany(data as CompanyRow) : null;
}

export async function getCompanyContacts(companyId: string): Promise<CrmContact[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("crm_contacts")
    .select(CONTACT_SELECT)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as ContactRow[]).map(toContact);
}

export type ActivityType = "call" | "email" | "meeting" | "whatsapp" | "note" | "task";

export type CrmActivity = {
  id: string;
  type: ActivityType;
  subject: string | null;
  body: string | null;
  contactId: string | null;
  contactName: string | null;
  companyId: string | null;
  inquiryId: string | null;
  ownerId: string | null;
  occurredAt: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

type ActivityRow = {
  id: string;
  type: ActivityType;
  subject: string | null;
  body: string | null;
  contact_id: string | null;
  company_id: string | null;
  inquiry_id: string | null;
  owner_id: string | null;
  occurred_at: string;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  crm_contacts?: { full_name: string } | null;
};

const ACTIVITY_SELECT =
  "id, type, subject, body, contact_id, company_id, inquiry_id, owner_id, occurred_at, due_at, completed_at, created_at, crm_contacts(full_name)";

function toActivity(row: ActivityRow): CrmActivity {
  return {
    id: row.id,
    type: row.type,
    subject: row.subject,
    body: row.body,
    contactId: row.contact_id,
    contactName: row.crm_contacts?.full_name ?? null,
    companyId: row.company_id,
    inquiryId: row.inquiry_id,
    ownerId: row.owner_id,
    occurredAt: row.occurred_at,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    createdAt: row.created_at
  };
}

export async function listActivitiesForContact(contactId: string): Promise<CrmActivity[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("crm_activities")
    .select(ACTIVITY_SELECT)
    .eq("contact_id", contactId)
    .order("occurred_at", { ascending: false });
  return ((data ?? []) as unknown as ActivityRow[]).map(toActivity);
}

export async function listActivitiesGlobal(options?: { type?: ActivityType; limit?: number }): Promise<CrmActivity[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let q = supabase
    .from("crm_activities")
    .select(ACTIVITY_SELECT)
    .order("occurred_at", { ascending: false })
    .limit(options?.limit ?? 100);
  if (options?.type) q = q.eq("type", options.type);
  const { data } = await q;
  return ((data ?? []) as unknown as ActivityRow[]).map(toActivity);
}

export async function listOpenTasks(): Promise<CrmActivity[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("crm_activities")
    .select(ACTIVITY_SELECT)
    .eq("type", "task")
    .is("completed_at", null)
    .order("due_at", { ascending: true, nullsFirst: false });
  return ((data ?? []) as unknown as ActivityRow[]).map(toActivity);
}

export async function listTags() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("crm_tags").select("id, name, color").order("name");
  return data ?? [];
}
