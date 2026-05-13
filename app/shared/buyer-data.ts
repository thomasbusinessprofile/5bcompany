import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";

export type BuyerSourcingRequest = {
  destination: string;
  id: string;
  nextAction: string;
  priority: string;
  product: string;
  quantity: string;
  status: string;
  title: string;
};

export type BuyerRequestDetail = BuyerSourcingRequest & {
  attachments: string[];
  description: string;
  documentRequirement: string;
  incoterm: string;
  messages: Array<{
    author: string;
    body: string;
    createdAt: string;
    id: string;
    tone: "admin" | "buyer";
  }>;
  packing: string;
  qualityRequirement: string;
  timeline: string;
};

export type BuyerProfile = {
  businessType: string;
  companyName: string;
  country: string;
  fullName: string;
  phone: string;
  whatsapp: string;
};

type SourcingRequestRow = {
  description?: string | null;
  destination_country: string | null;
  destination_port: string | null;
  document_requirement?: string | null;
  id: string;
  incoterm?: string | null;
  packing_requirement?: string | null;
  priority: string;
  product_name: string | null;
  quality_requirement?: string | null;
  status: string;
  target_quantity: number | null;
  timeline?: string | null;
  title: string;
  unit: string | null;
};

type RequestMessageRow = {
  created_at: string;
  id: string;
  is_internal: boolean;
  message: string;
  sender_role: string;
};

type RequestAttachmentRow = {
  file_name: string;
};

function statusToAction(status: string) {
  switch (status) {
    case "new":
      return "Admin review pending.";
    case "need_more_info":
      return "Please reply to admin questions.";
    case "quotation_preparing":
      return "Admin preparing quotation draft.";
    case "quotation_sent":
      return "Review quotation.";
    default:
      return "Track request progress.";
  }
}

function formatDestination(row: SourcingRequestRow) {
  return [row.destination_port, row.destination_country].filter(Boolean).join(", ") || "-";
}

function formatQuantity(row: SourcingRequestRow) {
  if (!row.target_quantity) {
    return "-";
  }

  return [row.target_quantity, row.unit].filter(Boolean).join(" ");
}

export async function getCurrentBuyerProfileId() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.id) {
    redirect("/login?status=invalid");
  }

  return profile.id as string;
}

export async function getBuyerSourcingRequests(): Promise<BuyerSourcingRequest[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sourcing_requests")
    .select("id,title,product_name,target_quantity,unit,destination_country,destination_port,status,priority")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return (data as SourcingRequestRow[]).map((request) => ({
    destination: formatDestination(request),
    id: request.id,
    nextAction: statusToAction(request.status),
    priority: request.priority,
    product: request.product_name ?? "-",
    quantity: formatQuantity(request),
    status: request.status.replaceAll("_", " "),
    title: request.title
  }));
}

export async function getBuyerRequestMetrics() {
  const requests = await getBuyerSourcingRequests();

  return {
    needReply: requests.filter((item) => item.status === "need more info").length,
    open: requests.filter((item) => !["won", "lost", "closed", "spam"].includes(item.status)).length,
    quoteDrafts: requests.filter((item) => item.status.includes("quotation")).length,
    requests
  };
}

export async function getBuyerSourcingRequestById(id: string): Promise<BuyerRequestDetail | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: request, error } = await supabase
    .from("sourcing_requests")
    .select(
      "id,title,description,product_name,target_quantity,unit,destination_country,destination_port,incoterm,packing_requirement,quality_requirement,document_requirement,timeline,status,priority"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !request) {
    return null;
  }

  const [messagesResult, attachmentsResult] = await Promise.all([
    supabase
      .from("request_messages")
      .select("id,message,sender_role,is_internal,created_at")
      .eq("request_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("request_attachments").select("file_name").eq("request_id", id)
  ]);

  const row = request as SourcingRequestRow;
  const messages = ((messagesResult.data ?? []) as RequestMessageRow[])
    .filter((message) => !message.is_internal)
    .map((message) => ({
      author: message.sender_role === "buyer" ? "Buyer" : "Admin",
      body: message.message,
      createdAt: message.created_at,
      id: message.id,
      tone: (message.sender_role === "buyer" ? "buyer" : "admin") as "buyer" | "admin"
    }));
  const attachments = ((attachmentsResult.data ?? []) as RequestAttachmentRow[]).map(
    (attachment) => attachment.file_name
  );

  return {
    attachments,
    description: row.description ?? "Admin review is in progress.",
    destination: formatDestination(row),
    documentRequirement: row.document_requirement ?? "-",
    id: row.id,
    incoterm: row.incoterm ?? "-",
    messages,
    nextAction: statusToAction(row.status),
    packing: row.packing_requirement ?? "-",
    priority: row.priority,
    product: row.product_name ?? "-",
    qualityRequirement: row.quality_requirement ?? "-",
    quantity: formatQuantity(row),
    status: row.status.replaceAll("_", " "),
    timeline: row.timeline ?? "-",
    title: row.title
  };
}

export async function getBuyerProfile(): Promise<BuyerProfile | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name,company_name,country,phone,whatsapp,business_type")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    businessType: data.business_type ?? "",
    companyName: data.company_name ?? "",
    country: data.country ?? "",
    fullName: data.full_name ?? "",
    phone: data.phone ?? "",
    whatsapp: data.whatsapp ?? ""
  };
}
