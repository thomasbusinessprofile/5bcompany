import { createSupabaseServerClient } from "../lib/supabase/server";

export type AdminInquiry = {
  companyName: string;
  country: string;
  createdAt: string;
  email: string;
  fullName: string;
  id: string;
  priority: string;
  productName: string;
  quantity: string;
  source: "public_rfq" | "buyer_portal";
  status: string;
  title: string;
};

type InquiryRow = {
  company_name: string | null;
  country: string | null;
  created_at: string;
  email: string | null;
  full_name: string | null;
  id: string;
  priority: string;
  product_name: string | null;
  quantity: string | null;
  status: string;
};

type AdminSourcingRequestRow = {
  created_at: string;
  destination_country: string | null;
  destination_port: string | null;
  id: string;
  priority: string;
  product_name: string | null;
  profiles: {
    company_name: string | null;
    country: string | null;
    full_name: string | null;
  } | null;
  status: string;
  target_quantity: number | null;
  title: string;
  unit: string | null;
};

export type AdminRequestDetail = {
  aiMissingFields: string[];
  aiQuestions: string[];
  aiSummary: string;
  attachments: string[];
  buyer: string;
  description: string;
  destination: string;
  documentRequirement: string;
  id: string;
  incoterm: string;
  messages: Array<{
    author: string;
    body: string;
    id: string;
    internal: boolean;
    tone: "admin" | "buyer";
  }>;
  packing: string;
  priority: string;
  product: string;
  qualityRequirement: string;
  quantity: string;
  status: string;
  timeline: string;
  title: string;
};

type AdminRequestDetailRow = AdminSourcingRequestRow & {
  ai_missing_fields: string[] | null;
  ai_suggested_questions: string[] | null;
  ai_summary: string | null;
  lead_score: number | null;
  description: string | null;
  document_requirement: string | null;
  incoterm: string | null;
  packing_requirement: string | null;
  quality_requirement: string | null;
  timeline: string | null;
};

type AdminMessageRow = {
  id: string;
  is_internal: boolean;
  message: string;
  sender_role: string;
};

type AdminAttachmentRow = {
  file_name: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export async function getAdminInquiries(): Promise<AdminInquiry[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("inquiries")
    .select("id,full_name,company_name,email,country,product_name,quantity,status,priority,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return (data as InquiryRow[]).map((inquiry) => ({
    companyName: inquiry.company_name ?? "-",
    country: inquiry.country ?? "-",
    createdAt: formatDate(inquiry.created_at),
    email: inquiry.email ?? "-",
    fullName: inquiry.full_name ?? "-",
    id: inquiry.id,
    priority: inquiry.priority,
    productName: inquiry.product_name ?? "-",
    quantity: inquiry.quantity ?? "-",
    source: "public_rfq",
    status: inquiry.status,
    title: inquiry.product_name ?? "Public RFQ"
  }));
}

export async function getAdminSourcingRequests(): Promise<AdminInquiry[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sourcing_requests")
    .select(
      "id,title,product_name,target_quantity,unit,destination_country,destination_port,status,priority,created_at,profiles!sourcing_requests_buyer_id_fkey(full_name,company_name,country)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return (data as unknown as AdminSourcingRequestRow[]).map((request) => ({
    companyName: request.profiles?.company_name ?? "-",
    country: [request.destination_port, request.destination_country].filter(Boolean).join(", ") || request.profiles?.country || "-",
    createdAt: formatDate(request.created_at),
    email: "-",
    fullName: request.profiles?.full_name ?? "-",
    id: request.id,
    priority: request.priority,
    productName: request.product_name ?? "-",
    quantity: [request.target_quantity, request.unit].filter(Boolean).join(" ") || "-",
    source: "buyer_portal",
    status: request.status,
    title: request.title
  }));
}

export async function getAdminRequestQueue() {
  const [inquiries, sourcingRequests] = await Promise.all([
    getAdminInquiries(),
    getAdminSourcingRequests()
  ]);

  return [...sourcingRequests, ...inquiries].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}

export async function getAdminInquiryMetrics() {
  const inquiries = await getAdminRequestQueue();

  return {
    averageAdminResponseTime: "2.4 hours", // MVP Mock: Real calculation requires joining status_history
    lostCount: inquiries.filter((item) => item.status === "lost").length,
    needInfo: inquiries.filter((item) => item.status === "need_more_info").length,
    newCount: inquiries.filter((item) => item.status === "new").length,
    quotePrep: inquiries.filter((item) => item.status === "quotation_preparing").length,
    total: inquiries.length,
    wonCount: inquiries.filter((item) => item.status === "won").length
  };
}

export async function getCurrentStaffProfileId() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile?.id ?? null;
}

export async function getAdminSourcingRequestById(id: string): Promise<AdminRequestDetail | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: request, error } = await supabase
    .from("sourcing_requests")
    .select(
      "id,title,description,product_name,target_quantity,unit,destination_country,destination_port,incoterm,packing_requirement,quality_requirement,document_requirement,timeline,status,priority,lead_score,ai_summary,ai_missing_fields,ai_suggested_questions,created_at,profiles!sourcing_requests_buyer_id_fkey(full_name,company_name,country)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !request) {
    return null;
  }

  const [messagesResult, attachmentsResult] = await Promise.all([
    supabase
      .from("request_messages")
      .select("id,message,sender_role,is_internal")
      .eq("request_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("request_attachments").select("file_name").eq("request_id", id)
  ]);

  const row = request as unknown as AdminRequestDetailRow;

  return {
    aiMissingFields: Array.isArray(row.ai_missing_fields) ? row.ai_missing_fields : [],
    aiQuestions: Array.isArray(row.ai_suggested_questions) ? row.ai_suggested_questions : [],
    aiSummary: row.ai_summary ?? "",
    attachments: ((attachmentsResult.data ?? []) as AdminAttachmentRow[]).map(
      (attachment) => attachment.file_name
    ),
    buyer: [row.profiles?.company_name, row.profiles?.full_name].filter(Boolean).join(" / ") || "-",
    description: row.description ?? "No description provided.",
    destination: [row.destination_port, row.destination_country].filter(Boolean).join(", ") || "-",
    documentRequirement: row.document_requirement ?? "-",
    id: row.id,
    incoterm: row.incoterm ?? "-",
    messages: ((messagesResult.data ?? []) as AdminMessageRow[]).map((message) => ({
      author: message.is_internal ? "Internal note" : message.sender_role === "buyer" ? "Buyer" : "Admin",
      body: message.message,
      id: message.id,
      internal: message.is_internal,
      tone: (message.sender_role === "buyer" ? "buyer" : "admin") as "admin" | "buyer"
    })),
    packing: row.packing_requirement ?? "-",
    priority: row.priority,
    product: row.product_name ?? "-",
    qualityRequirement: row.quality_requirement ?? "-",
    quantity: [row.target_quantity, row.unit].filter(Boolean).join(" ") || "-",
    status: row.status,
    timeline: row.timeline ?? "-",
    title: row.title
  };
}
