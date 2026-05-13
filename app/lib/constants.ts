export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "10 MB";
export const MAX_MESSAGE_LENGTH = 2000;
export const DEFAULT_QUOTATION_VALIDITY_DAYS = 14;

export const ATTACHMENT_ACCEPT = ".pdf,.docx,.xlsx,image/png,image/jpeg,image/webp";

export const BUSINESS_TYPES = [
  { label: "Importer", value: "importer" },
  { label: "Distributor", value: "distributor" },
  { label: "Wholesaler", value: "wholesaler" },
  { label: "Retailer", value: "retailer" },
  { label: "Manufacturer", value: "manufacturer" },
  { label: "Sourcing agent", value: "sourcing_agent" },
  { label: "Other", value: "other" }
] as const;

export const BUSINESS_TYPE_VALUES: Set<string> = new Set(BUSINESS_TYPES.map((b) => b.value));

export const INCOTERMS = ["EXW", "FOB", "CFR", "CIF", "DDP"] as const;

export const REQUEST_STATUSES = [
  "new",
  "ai_structured",
  "admin_review",
  "need_more_info",
  "sourcing_in_progress",
  "quotation_preparing",
  "quotation_sent",
  "sample_discussion",
  "negotiating",
  "won",
  "lost",
  "closed",
  "spam"
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const QUOTATION_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "sent_to_buyer",
  "accepted",
  "rejected",
  "expired",
  "cancelled"
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];
