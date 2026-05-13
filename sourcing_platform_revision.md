# Revised Direction: AI-Assisted B2B Sourcing Platform

## 1. Strategic Shift

The website should no longer be treated as a one-way export catalogue:

```txt
Buyer views product -> submits RFQ form -> admin receives email
```

It should evolve into an account-based sourcing platform:

```txt
Visitor
-> Register / Login
-> Buyer Dashboard
-> Create Sourcing Request
-> AI-assisted request structuring
-> Admin review
-> Admin follow-up / sourcing / quotation
-> Buyer tracks pipeline
```

The public website still matters for trust, SEO, and product discovery, but the long-term value should come from structured buyer relationships and repeat sourcing requests.

---

## 2. Product Principle

The platform should be positioned as:

```txt
AI-assisted B2B sourcing platform for Vietnam export products
```

AI must support operations, not replace commercial decision-making.

AI can:

1. Classify sourcing requests.
2. Standardize buyer descriptions.
3. Detect missing information.
4. Suggest related catalogue products.
5. Generate admin summaries.
6. Calculate preliminary lead score.
7. Suggest follow-up questions for admin.

AI must not:

1. Commit price.
2. Commit stock availability.
3. Commit production capacity.
4. Commit lead time.
5. Invent certificates or compliance documents.
6. Send official quotations without admin approval.

---

## 3. Core User Roles

### Visitor

Can:

1. View home, products, articles, process, quality pages.
2. Submit a quick RFQ.
3. Register as buyer.

### Buyer

Can:

1. Register and login.
2. Manage company profile.
3. Create sourcing requests.
4. View request history.
5. Track request status.
6. Message admin.
7. Upload attachments such as specs, images, packing requirements, or documents.

### Admin

Can:

1. View all sourcing requests.
2. Assign requests to staff.
3. Change request status.
4. Add internal notes.
5. Send messages to buyer.
6. Link related products.
7. Create quotation drafts.
8. Upload documents.
9. Close or mark spam requests.

### Sales / Sourcing Staff

Can:

1. View assigned requests.
2. Ask buyer for missing information.
3. Prepare quotation data.
4. Update request pipeline.
5. Add internal sourcing notes.

---

## 4. Sourcing Request Data

Buyer request fields:

```txt
Request title
Request type
Product category
Product of interest
Description
Target quantity
Unit
Destination country
Destination port
Incoterm
Packing requirement
Quality requirement
Document requirement
Target price
Timeline
Attachment
Additional notes
```

This replaces weak one-way RFQ data with a structured sourcing record that admin can actually process.

---

## 5. Request Pipeline

Recommended statuses:

```txt
new
ai_structured
admin_review
need_more_info
sourcing_in_progress
quotation_preparing
quotation_sent
sample_discussion
negotiating
won
lost
closed
spam
```

Status logic:

1. `new`: buyer submitted request.
2. `ai_structured`: AI summary and missing-field analysis completed.
3. `admin_review`: admin is checking feasibility.
4. `need_more_info`: buyer must answer questions or upload details.
5. `sourcing_in_progress`: team is checking product, supplier, or specification.
6. `quotation_preparing`: admin is drafting quotation.
7. `quotation_sent`: approved quotation sent to buyer.
8. `sample_discussion`: sample or prototype discussion is active.
9. `negotiating`: commercial discussion is active.
10. `won`: request converted to order or serious deal.
11. `lost`: buyer rejected, inactive, or not suitable.
12. `closed`: request completed without further action.
13. `spam`: irrelevant or abusive request.

---

## 6. Database Additions

### `profiles`

```txt
id
user_id
full_name
company_name
country
phone
whatsapp
business_type
role
created_at
updated_at
```

Roles:

```txt
buyer
admin
sales
sourcing
content_manager
viewer
```

### `sourcing_requests`

```txt
id
buyer_id
title
request_type
category_id
product_id
product_name
description
target_quantity
unit
destination_country
destination_port
incoterm
packing_requirement
quality_requirement
document_requirement
target_price
timeline
status
priority
lead_score
ai_summary
ai_missing_fields
ai_suggested_products
assigned_to
source
created_at
updated_at
```

### `request_messages`

```txt
id
request_id
sender_id
sender_role
message
is_internal
created_at
```

### `request_attachments`

```txt
id
request_id
uploaded_by
file_url
file_name
file_type
file_size
created_at
```

### `request_status_history`

```txt
id
request_id
old_status
new_status
changed_by
note
created_at
```

### `quotations`

```txt
id
request_id
quote_number
buyer_id
status
incoterm
currency
total_amount
validity_date
note
created_by
created_at
updated_at
```

### `quotation_items`

```txt
id
quotation_id
product_id
product_name
specification
quantity
unit
unit_price
packing
lead_time
note
```

---

## 7. Route Structure

Public routes:

```txt
/
/products
/products/[slug]
/articles
/articles/[slug]
/about
/export-process
/quality-documentation
/request-quote
```

Auth routes:

```txt
/login
/register
```

Buyer routes:

```txt
/buyer/dashboard
/buyer/requests
/buyer/requests/new
/buyer/requests/[id]
/buyer/profile
```

Admin routes:

```txt
/admin/dashboard
/admin/requests
/admin/requests/[id]
/admin/buyers
/admin/products
/admin/articles
/admin/media
/admin/seo
```

API routes:

```txt
/api/sourcing-requests
/api/sourcing-requests/[id]
/api/request-messages
/api/ai/structure-request
/api/ai/suggest-products
```

---

## 8. Implementation Phases

### Phase 1: Public Website Foundation

Build the trust and SEO base.

1. Home page.
2. Product listing.
3. Product detail.
4. Basic RFQ.
5. SEO structure.
6. Supabase `products`.
7. Supabase `inquiries`.

### Phase 2: Buyer Portal

Build the account and request workflow.

1. Register / login.
2. Buyer dashboard.
3. Company profile.
4. Create sourcing request.
5. Request detail.
6. Request history.
7. Request messages.
8. Upload attachments.
9. Admin request queue.
10. Role-based access.

### Phase 3: AI Sourcing Assistant

Add AI as an internal operating assistant.

1. AI request summary.
2. Missing-field detection.
3. Product matching.
4. Lead scoring.
5. Suggested admin questions.
6. Risk notes.
7. AI output audit trail.

### Phase 4: Quotation Workflow

Turn qualified requests into controlled commercial documents.

1. Quotation draft.
2. Quotation items.
3. PDF quotation.
4. Admin approval.
5. Buyer quote review.
6. Quotation status.

### Phase 5: CMS and SEO Growth

Scale content and organic acquisition.

1. Product CMS.
2. Article CMS.
3. Media library.
4. SEO panel.
5. Sitemap.
6. Redirects.
7. Internal link management.

---

## 9. Important Correction To Current Roadmap

The current document has two competing roadmap endings:

1. A sourcing portal roadmap with buyer account, request workflow, AI assistant, and quotation workflow.
2. A CMS/SEO-first roadmap that moves product CMS and SEO ahead of the buyer portal.

The recommended priority is:

```txt
Public trust foundation
-> Buyer portal
-> AI sourcing assistant
-> Quotation workflow
-> CMS + SEO growth
```

CMS and SEO are still important, but they should not displace the core sourcing workflow. The business model becomes stronger when buyer requests, messages, status, and quotation records live in one structured pipeline.

---

## 10. Operating Discipline

1. AI supports admin; admin controls commercial commitments.
2. Structured requests are more valuable than loose RFQ messages.
3. Buyer dashboard should reduce repeated back-and-forth.
4. Admin pipeline should make every request trackable.
5. Quotation must be reviewed by a human before sending.
6. Public website should remain serious, fast, and trust-focused.
7. SEO content should support sourcing demand, not distract from request conversion.
