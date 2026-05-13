// API Contracts for the Sourcing Platform

// 1. Sourcing Requests
export interface CreateSourcingRequestPayload {
  title: string;
  request_type?: string;
  category_id: string;
  product_id: string;
  product_name?: string;
  description?: string;
  target_quantity?: string;
  unit?: string;
  destination_country?: string;
  destination_port?: string;
  incoterm?: string;
  packing_requirement?: string;
  quality_requirement?: string;
  document_requirement?: string;
  target_price?: string;
  timeline?: string;
  additional_notes?: string;
}

export interface UpdateSourcingRequestPayload {
  status?: string;
  priority?: string;
  assigned_to?: string;
  // Admin/Sales can update allowed fields below
  title?: string;
  description?: string;
  target_quantity?: string;
  // ... other allowed fields
}

export interface SourcingRequestResponse {
  id: string;
  buyer_id: string;
  title: string;
  request_type: string;
  category_id: string;
  product_id: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  // ... full record fields based on the database schema
}

// 2. Request Messages
export interface CreateRequestMessagePayload {
  request_id: string;
  message: string;
  is_internal?: boolean;
}

export interface RequestMessageResponse {
  id: string;
  request_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

// 3. Request Attachments
export interface UploadRequestAttachmentPayload {
  file: File;
  request_id: string;
}

export interface RequestAttachmentResponse {
  id: string;
  request_id: string;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// 4. AI Helper
export interface AIStructureRequestPayload {
  request_id?: string;
  draft_request_fields?: Partial<CreateSourcingRequestPayload>;
}

export interface AIStructureRequestResponse {
  summary: string;
  missing_fields: string[];
  suggested_questions: string[];
  guardrail_notes: string[];
  provider: string;
  model: string;
  fallback_used: boolean;
}

export interface APIErrorResponse {
  error: string;
}
