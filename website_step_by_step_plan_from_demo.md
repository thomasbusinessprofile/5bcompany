# Step-by-Step Website Plan From UI Demo

## 0. Build Rule

Do not build immediately.

First define:

1. Page scope.
2. User flow.
3. Data fields.
4. Access rules.
5. UI sections.
6. API behavior.
7. Acceptance criteria.

Only start coding after each part is reviewed and approved.

---

## 1. Product Direction Confirmed By Demo

The demo positions the website as:

```txt
B2B Export Sourcing Portal
```

Core message:

```txt
Sourcing portal first.
AI assists the workflow.
AI is not the main positioning.
```

---

## 1A. Technical Stack Declaration

Use this stack unless there is a later explicit change:

```txt
Framework: Next.js App Router
Language: TypeScript preferred
Styling: Tailwind CSS or CSS Modules, decided before build
Database: Supabase Postgres
Auth: Supabase Auth
Storage: Supabase Storage
Hosting: Vercel
Runtime: Node.js runtime for admin/API operations
API layer: Next.js Route Handlers for external/API-style calls
Server mutations: Server Actions may be used for form-heavy internal flows
AI provider MVP: OpenRouter
AI model MVP: nvidia/nemotron-3-super-120b-a12b:free
Email/notification: planned later, not required for first MVP
```

### Routing strategy

Use Next.js App Router route groups:

```txt
app/(public)
app/(auth)
app/(buyer)
app/(admin)
app/api
```

### Rendering strategy

1. Public product and article pages should prefer Server Components for SEO and fast load.
2. Buyer/admin dashboards can use Server Components for initial data and Client Components for filters, forms, uploads, and interactive states.
3. Admin-heavy operations should run on the Node.js runtime, not Edge.
4. AI endpoints should run server-side only.
5. OpenRouter API keys must be stored in server environment variables only.

### Acceptance criteria

1. App Router is confirmed before build.
2. Supabase Auth + `profiles` table is the identity foundation.
3. Public pages are SEO-friendly by default.
4. Buyer/admin portals are protected by middleware and RLS, not UI hiding alone.

The website should be planned around three connected areas:

1. Public Website: trust, products, SEO, request entry point.
2. Buyer Portal: account, dashboard, sourcing requests, messages, attachments.
3. Admin Portal: request queue, review, pipeline, quotation preparation, CMS and SEO tools.

---

## 2. Recommended Implementation Order

```txt
Step 1: Public website structure
Step 2: Product catalogue and product detail
Step 3: Buyer account flow
Step 4: Buyer dashboard
Step 5: New sourcing request flow
Step 6: Request detail, messages, attachments
Step 7: Admin dashboard
Step 8: Admin request queue
Step 9: Admin request review
Step 10: AI helper rules
Step 11: Quotation preparation
Step 12: CMS and SEO tools
Step 13: Media SEO and responsive polish
```

This order follows the PPT demo and avoids building advanced CMS before the sourcing workflow is clear.

Before Step 1 implementation, complete these planning passes:

```txt
Tech stack pass
Auth + role pass
RLS matrix pass
Status state machine pass
API contract pass
Seed data pass
Error/empty state pass
```

---

## 3. Step 1: Public Website Structure

### Goal

Create the basic navigation and page map before implementation.

### Pages

```txt
/
/products
/products/[slug]
/export-process
/articles
/articles/[slug]
/login
/register
```

### Header navigation

```txt
Logo
Products
Sourcing
Export Process
Insights
Create Request
```

### Footer groups

1. Company information.
2. Product groups.
3. Export support.
4. Contact.
5. Legal / privacy.

### Acceptance criteria

1. Every public page has a clear route.
2. `Create Request` is visible as the main CTA.
3. Public website explains product capability and request workflow.
4. AI is not promoted as the main sales promise.

---

## 4. Step 2: Home Page

### Goal

Make buyer understand the business within 10 seconds.

### Sections from demo

1. Hero:
   `Reliable export sourcing for serious buyers`
2. Supporting text:
   `Browse products, create a sourcing request, and coordinate with a real export team.`
3. Primary CTA:
   `Create Request`
4. Secondary CTA:
   `View Products`
5. Trust metrics:
   `7+ Product groups`, `B2B Request workflow`, `QC Shipment review`, `CMS-ready`
6. Featured product groups:
   Bamboo, Packaging, Charcoal / Biochar, Rattan Furniture.

### Acceptance criteria

1. Buyer understands this is an export sourcing website, not only a catalogue.
2. Product groups are visible above or near first screen.
3. CTA leads buyer toward request creation.
4. Tone remains serious and B2B.

---

## 5. Step 3: Product Catalogue

### Goal

Show export-ready product groups and lead buyer toward product detail or request creation.

### Product cards

From demo:

1. Bamboo Sticks.
2. Bamboo Fence.
3. Packaging Tape.
4. Stretch Film.
5. BBQ Charcoal.
6. Rattan Furniture.

Each card should show:

```txt
Product name
Specs
Packing
MOQ
View detail
```

### Acceptance criteria

1. Product list is scannable.
2. Buyer can filter or browse by group.
3. Every product card has a detail route.
4. Every product detail route can lead to `Create Request`.

---

## 6. Step 4: Product Detail Pages

### Goal

Give enough sourcing information for buyer to create a structured request.

### Example 1: Bamboo Fence

Required sections:

1. Product group: Bamboo Products.
2. Product name: Bamboo Fence.
3. Commercial description.
4. Specifications.
5. Packing.
6. Request CTA.

Request CTA should ask buyer for:

```txt
Quantity
Destination port
Packing
Document needs
Timeline
```

### Example 2: Packaging Materials

Product pages should separate:

1. Stretch film.
2. Packaging tape.

Buyer inputs should include:

```txt
Thickness
Width / length
Monthly quantity
Roll type
Color
Destination port
```

### Example 3: Charcoal and Biochar

BBQ charcoal and biochar should be separated because buyers need different information.

Important rule:

```txt
No unsupported claims about certification, carbon credit, lab data, or compliance.
```

### Acceptance criteria

1. Each product page has specs, packing, MOQ or fallback text.
2. Product detail is connected to request creation.
3. Claims are conservative and verifiable.
4. Product page supports SEO with H1, meta title, meta description, image alt text, FAQ, and internal links.

---

## 7. Step 5: Export Process Page

### Goal

Build trust by showing a disciplined export workflow.

### Sections from demo

```txt
1. Inquiry
2. Spec Review
3. Quotation
4. Production
5. QC
6. Shipment
```

Each step should show:

```txt
Owner
Status
Next action
```

### CTAs

1. Primary: `Create Request`.
2. Secondary: `Download Company Profile`.

### Acceptance criteria

1. Buyer understands the company has a process.
2. No vague promise like instant price or guaranteed stock.
3. Page supports conversion into sourcing request.

---

## 8. Step 6: Insights / SEO Articles

### Goal

Use articles to educate buyers and support Google search.

### Article layout from demo

1. H1 title.
2. Intro.
3. H2 sections.
4. Specification table.
5. Product image with alt text.
6. Internal product links.
7. FAQ.
8. Request CTA.

### SEO panel fields

```txt
SEO title
Meta description
Focus keyword
Canonical URL
Schema type
```

### Acceptance criteria

1. Article is useful for buyer, not just keyword text.
2. Article links to product pages.
3. Article has request CTA.
4. Draft articles are not indexed.

---

## 9. Step 7: Buyer Account

### Goal

Move from anonymous RFQ to long-term buyer relationship.

### Register fields from demo

```txt
Work email
Company name
Country
Business type
WhatsApp / Phone
Password
```

### Login routing

```txt
Buyer -> /buyer/dashboard
Admin -> /admin/dashboard
Sales -> /admin/requests
```

### Acceptance criteria

1. Buyer can register and login.
2. Buyer profile stores company details.
3. Role determines destination after login.
4. Auth is required for buyer dashboard and admin portal.

### Auth strategy

Use Supabase Auth for identity and a `profiles` table for business profile and app role.

```txt
auth.users.id -> profiles.user_id
```

The source of truth for application authorization is `profiles.role`.

Recommended roles:

```txt
buyer
admin
sales
sourcing
content_manager
viewer
```

MVP should use `profiles.role` checked server-side and in Supabase RLS policies. JWT custom claims can be added later for performance, but should not be required for the first build unless the team is ready to maintain claim syncing.

### Login redirect behavior

```txt
buyer -> /buyer/dashboard
admin -> /admin/dashboard
sales -> /admin/requests
sourcing -> /admin/requests
content_manager -> /admin/products
viewer -> /admin/dashboard
```

### Middleware rules

```txt
/buyer/* requires authenticated user with role buyer
/admin/* requires authenticated user with role admin, sales, sourcing, content_manager, or viewer
/login and /register redirect authenticated users to role destination
```

### Auth edge cases

1. No profile after auth signup: create profile or route to onboarding.
2. Expired session: redirect to login with return path.
3. Role missing: block portal access and show account setup state.
4. Suspended user, if added later: block login destination.

---

## 9A. RLS Policy Matrix

### Goal

Prevent buyer data leaks and keep admin access controlled.

### Role definitions

```txt
buyer: can manage own profile and own requests
admin: full operational access
sales: can work assigned requests and buyer-visible messages
sourcing: can work assigned sourcing data and internal notes
content_manager: can manage products, articles, media, SEO
viewer: read-only admin access
```

### Matrix

| Table | Buyer | Admin | Sales | Sourcing | Content manager | Viewer |
| --- | --- | --- | --- | --- | --- | --- |
| `profiles` | Read/update own profile | CRUD | Read assigned buyer profiles | Read assigned buyer profiles | Read limited | Read limited |
| `product_categories` | Read published | CRUD | Read | Read | CRUD | Read |
| `products` | Read published | CRUD | Read | Read | CRUD | Read |
| `articles` | Read published | CRUD | Read | Read | CRUD | Read |
| `media_assets` | Read public assets | CRUD | Read/upload scoped docs | Read/upload scoped docs | CRUD | Read |
| `seo_metadata` | No direct access | CRUD | Read | Read | CRUD | Read |
| `inquiries` | Create own quick RFQ only | CRUD | Read/update assigned | Read assigned | No access by default | Read |
| `sourcing_requests` | Create/read/update own allowed fields | CRUD | Read/update assigned | Read/update assigned | No access by default | Read |
| `request_messages` | Read/send own non-internal messages | CRUD | Read/send assigned messages | Read/send assigned messages | No access by default | Read non-internal/admin scoped |
| `request_attachments` | Read/upload own request files | CRUD | Read/upload assigned | Read/upload assigned | No access by default | Read scoped |
| `request_status_history` | Read own request history | CRUD | Read/create assigned transitions | Read/create assigned transitions | No access by default | Read |
| `quotations` | Read approved/sent own quotations | CRUD | Create/update assigned drafts | Read/update assigned sourcing fields | No access by default | Read |
| `quotation_items` | Read approved/sent own quote items | CRUD | Create/update assigned drafts | Read/update assigned sourcing fields | No access by default | Read |
| `redirects` | No access | CRUD | No access | No access | CRUD | Read |
| `internal_links` | No access | CRUD | Read | Read | CRUD | Read |

### RLS principles

1. Buyer can only access rows linked to `auth.uid()` through `profiles.user_id`.
2. Buyer must never read `is_internal = true` messages.
3. Buyer must never update admin-only fields such as `status`, `priority`, `lead_score`, `ai_summary`, `assigned_to`.
4. Sales and sourcing can access assigned requests or requests admin explicitly makes visible to their role.
5. Service-role key must only be used server-side.

### Acceptance criteria

1. Every table has a defined read/write policy before build.
2. Buyer cannot query another buyer's request by guessing ID.
3. Internal notes are invisible to buyers.
4. Admin and sales access works through RLS, not only through frontend filtering.

---

## 10. Step 8: Buyer Dashboard

### Goal

Give buyer a clear workspace to track requests and required actions.

### Demo widgets

```txt
Open Requests
Need Reply
Quote Drafts
Recent Requests
New Request
```

### Recent request row fields

```txt
Request title
Status
Priority
Last update
```

### Acceptance criteria

1. Buyer sees open requests immediately.
2. Requests needing buyer reply are obvious.
3. Buyer can create a new request from dashboard.
4. Dashboard is useful even with a small number of requests.

---

## 11. Step 9: New Sourcing Request

### Goal

This is the core product feature.

### Required fields

```txt
Request title
Product category
Product requirement
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

### Optional helper panel

Name from demo:

```txt
Smart Request Helper
```

Helper can show:

```txt
Missing fields
Suggested clarification questions
Suggested attachment
Suggested related products
```

Helper must not:

```txt
Quote
Promise supply
Promise lead time
Create certificates
Send official commercial response
```

### Acceptance criteria

1. Buyer can submit a structured request.
2. Form can save enough data for admin to act.
3. AI helper is optional and clearly secondary.
4. Request is created with status `new`.

### Error and empty states

1. Missing required field: show field-level error.
2. File too large: reject before upload when possible.
3. Upload failed: keep form data and allow retry.
4. Session expired: redirect to login and return to draft if possible.
5. Duplicate submit: prevent double request creation.
6. Network error: show retry state.

---

## 12. Step 10: Buyer Request Detail

### Goal

Let buyer track status, answer admin, and upload more information.

### Sections from demo

1. Request title.
2. Current status.
3. Request summary.
4. Submitted information.
5. Messages.
6. Attachments.
7. Next required action.

### Example status

```txt
Need More Info
```

### Message behavior

Buyer and admin can exchange messages. Internal admin notes must not be visible to buyer.

### Message system specification

MVP should use normal server-backed messages with refresh/reload after send. Real-time subscriptions can be added later.

Message format:

```txt
Plain text only for MVP
No markdown rendering for buyer messages in MVP
Maximum message length: 2,000 characters
```

Attachment MVP:

```txt
Allowed: pdf, doc, docx, xls, xlsx, jpg, jpeg, png, webp
Max file size: 10 MB per file
Max files per request in MVP: 10
Storage path: request_attachments/{request_id}/{attachment_id}-{safe_filename}
```

Visibility:

```txt
Buyer-visible message: is_internal = false
Internal admin note: is_internal = true
```

Notification MVP:

```txt
No real-time notification required for first build.
Dashboard should show Need Reply counts.
Email notifications can be Phase 2 after message workflow works.
```

Message edge cases:

1. Empty message cannot send.
2. Buyer cannot send message on closed/spam request unless admin reopens it.
3. Buyer cannot delete admin messages.
4. Admin can add internal notes that never appear in buyer UI.
5. Attachment upload failure should not delete typed message.

### Acceptance criteria

1. Buyer can see what is missing.
2. Buyer can reply to admin.
3. Buyer can upload supporting files.
4. Buyer cannot see internal notes.

---

## 13. Step 11: Admin Dashboard

### Goal

Give admin an operational overview.

### Demo widgets

```txt
New
Need Info
Quote Prep
Won
Pipeline by status
```

### Acceptance criteria

1. Admin sees total requests by status.
2. Admin can identify urgent requests.
3. Admin can jump to request queue.
4. Admin dashboard focuses on pipeline and response speed.

---

## 14. Step 12: Admin Request Queue

### Goal

Prioritize and assign buyer requests.

### Filters from demo

```txt
All
New
Need Info
Quote Prep
High Priority
```

### Table columns from demo

```txt
Request
Country
Product
Status
Priority
Owner
```

### Acceptance criteria

1. Admin can filter by status and priority.
2. Admin can assign owner.
3. Admin can open request review page.
4. Queue supports unassigned requests.

---

## 15. Step 13: Admin Request Review

### Goal

Let admin review buyer details, request data, missing information, and next actions.

### Sections from demo

1. Buyer details.
2. Request data.
3. Missing fields.
4. Admin actions.
5. AI helper suggestion.

### Admin actions

```txt
Send buyer question
Assign to sales
Create quote draft
Upload document
Change status
Add internal note
```

### Acceptance criteria

1. Admin can see buyer and request context in one page.
2. Admin can ask for missing information.
3. Admin can move status through the pipeline.
4. AI output is treated as a suggestion only.

### Request status state machine

Allowed request transitions:

```txt
new -> ai_structured
new -> admin_review
new -> spam

ai_structured -> admin_review
ai_structured -> spam

admin_review -> need_more_info
admin_review -> sourcing_in_progress
admin_review -> quotation_preparing
admin_review -> closed
admin_review -> spam

need_more_info -> admin_review
need_more_info -> sourcing_in_progress
need_more_info -> closed
need_more_info -> spam

sourcing_in_progress -> need_more_info
sourcing_in_progress -> quotation_preparing
sourcing_in_progress -> closed

quotation_preparing -> quotation_sent
quotation_preparing -> need_more_info
quotation_preparing -> sourcing_in_progress

quotation_sent -> sample_discussion
quotation_sent -> negotiating
quotation_sent -> won
quotation_sent -> lost
quotation_sent -> closed

sample_discussion -> negotiating
sample_discussion -> quotation_preparing
sample_discussion -> won
sample_discussion -> lost

negotiating -> quotation_preparing
negotiating -> won
negotiating -> lost
negotiating -> closed

won -> closed
lost -> closed
spam -> closed
```

Who can change request status:

```txt
buyer: cannot directly change pipeline status
admin: all valid transitions
sales: assigned requests, except spam and won unless approved
sourcing: assigned requests through admin_review, need_more_info, sourcing_in_progress
viewer: none
content_manager: none
```

Rollback rule:

```txt
Rollback is allowed only through explicit valid transitions and must create request_status_history.
```

Every status change must write:

```txt
old_status
new_status
changed_by
note
created_at
```

---

## 16. Step 14: AI Helper Specification

### Goal

Define AI behavior before implementation.

### AI provider

MVP provider:

```txt
Provider: OpenRouter
Model: nvidia/nemotron-3-super-120b-a12b:free
API style: OpenAI-compatible chat completions through OpenRouter
Environment variable: OPENROUTER_API_KEY
Server endpoint: /api/ai/structure-request
```

Notes:

1. The selected OpenRouter page lists this as a free model variant with model id `nvidia/nemotron-3-super-120b-a12b:free`.
2. Free model availability, rate limits, and routing can change, so implementation must verify current OpenRouter docs before build.
3. The app must have a rule-based fallback if OpenRouter is unavailable, rate-limited, or returns invalid JSON.
4. AI requests must run server-side only. Do not call OpenRouter directly from the browser.

### MVP AI scope

For MVP, AI should only do:

```txt
Missing field detection
Structured admin summary
Suggested buyer questions
```

Do not include in MVP:

```txt
Lead scoring
Risk notes
Product matching
Previous request analysis
Uploaded document analysis
```

These can move to Phase 2 after the request workflow is stable.

### AI inputs

MVP inputs:

```txt
Buyer profile
Request form fields
Product category/product name
Admin-defined required-field rules
```

Phase 2 inputs:

```txt
Buyer profile
Request form
Product catalogue
Previous request history
Uploaded documents if allowed
Admin sourcing rules
```

### AI outputs

MVP outputs:

```txt
Structured summary
Missing fields
Suggested buyer questions
```

Phase 2 outputs:

```txt
Structured summary
Missing fields
Suggested product matches
Suggested buyer questions
Lead score
Risk notes
Suggested next step
```

### Guardrails

1. AI cannot commit price.
2. AI cannot commit availability.
3. AI cannot commit lead time.
4. AI cannot invent certification.
5. AI cannot send quotation without admin approval.
6. AI output must be saved for admin review.

### Acceptance criteria

1. AI output is auditable.
2. Admin can accept, ignore, or edit AI suggestions.
3. Buyer-facing wording does not imply AI has made a commercial decision.
4. If OpenRouter fails, the system still returns rule-based missing-field detection.

---

## 17. Step 15: Quotation Preparation

### Goal

Create controlled quotation drafts from qualified requests.

### Quotation draft fields

```txt
Request ID
Buyer
Product items
Specification
Quantity
Unit
Unit price
Currency
Incoterm
Packing
Lead time
Validity date
Notes
Status
Created by
Approved by
```

### Quotation statuses

```txt
draft
internal_review
approved
sent
revised
accepted
rejected
expired
```

### Acceptance criteria

1. Quotation is created by admin or sales.
2. Official quotation requires approval.
3. Buyer sees only approved quotation.
4. Quotation remains linked to the sourcing request.

### Quotation state machine

Allowed quotation transitions:

```txt
draft -> internal_review
draft -> revised

internal_review -> approved
internal_review -> revised
internal_review -> draft

approved -> sent
approved -> revised

sent -> accepted
sent -> rejected
sent -> expired
sent -> revised

revised -> internal_review
revised -> approved

accepted -> expired
rejected -> revised
expired -> revised
```

Who can change quotation status:

```txt
buyer: can mark sent quotation as accepted/rejected if buyer review is enabled
admin: all valid transitions
sales: draft, internal_review, revised, sent on assigned requests if approved
sourcing: can edit item sourcing fields but not send official quotation
viewer: none
content_manager: none
```

Commercial rule:

```txt
Only approved quotations can be sent to buyer.
```

---

## 18. Step 16: CMS And SEO Tools

### Goal

Maintain products, articles, media, and SEO without editing code.

### Product CMS

```txt
Name
Category
Slug
Specifications
Packing options
MOQ
Lead time
Related products
SEO fields
Publish status
```

### Article CMS

```txt
Title
Slug
Excerpt
Content blocks
Cover image
Related products
SEO fields
Publish status
```

### SEO publish checklist

```txt
SEO title
Meta description
Image alt text
Internal links
Request CTA
Schema
No placeholder content
```

### Acceptance criteria

1. Draft content can exist safely.
2. Published content must pass required checks.
3. Public pages never show empty placeholder content.
4. SEO tools support products and articles.

### Initial product data before full CMS

Because product pages are needed before CMS is complete, use seeded Supabase rows first.

MVP product data source:

```txt
Seeded rows in Supabase products and product_categories
Admin CRUD can be minimal or delayed
No hardcoded product data in page components except fallback constants
```

Seed data should include:

```txt
Bamboo Sticks
Bamboo Fence
Packaging Tape
Stretch Film
BBQ Charcoal
Biochar
Rattan Furniture
```

Each seeded product should include:

```txt
slug
name
category
short_description
specifications
packing_options
moq fallback
lead_time fallback
seo_title
seo_description
status = published or draft
```

---

## 19. Step 17: Media SEO And Responsive Behavior

### Goal

Manage images properly and keep request access easy on mobile.

### Media fields

```txt
File URL
Storage path
Original filename
SEO filename
Alt text
Caption
Product link
Article link
Width
Height
File size
Mime type
Status
```

### Mobile rule from demo

```txt
Create request fast
```

On mobile, the request CTA should stay easy to reach from product detail, article, and dashboard pages.

### Acceptance criteria

1. Every public image has alt text.
2. Images are attached to products or articles.
3. Mobile layout keeps request CTA visible and usable.
4. No published page depends on placeholder images.

Note: this belongs to the CMS domain, but it is kept as a separate planning step because mobile request access is also a conversion requirement.

---

## 20. API Contract Pass

### Goal

Define request and response shapes before buyer portal and admin portal are built.

### MVP API contracts

```txt
POST /api/sourcing-requests
GET /api/sourcing-requests
GET /api/sourcing-requests/[id]
PATCH /api/sourcing-requests/[id]
POST /api/request-messages
GET /api/request-messages?request_id=
POST /api/request-attachments
POST /api/ai/structure-request
```

### `POST /api/sourcing-requests`

Request:

```txt
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
additional_notes
```

Response success:

```txt
id
status
created_at
```

Common errors:

```txt
400 validation_error
401 unauthorized
403 forbidden
409 duplicate_submission
500 server_error
```

### `PATCH /api/sourcing-requests/[id]`

Allowed updates depend on role.

Buyer may update limited request fields only while request is not closed, spam, won, or lost.

Admin/sales may update:

```txt
status
priority
assigned_to
internal fields
allowed request fields
```

### `POST /api/request-messages`

Request:

```txt
request_id
message
is_internal
```

Rules:

1. Buyer cannot create internal messages.
2. Buyer can only message on own request.
3. Admin/sales can message on accessible request.

### `POST /api/ai/structure-request`

MVP request:

```txt
request_id or draft request fields
```

MVP response:

```txt
summary
missing_fields
suggested_questions
guardrail_notes
provider
model
fallback_used
```

Provider/model values for MVP:

```txt
provider = openrouter
model = nvidia/nemotron-3-super-120b-a12b:free
```

### Acceptance criteria

1. Each core workflow has a defined API or Server Action contract.
2. Error codes are predictable.
3. Role-specific update rules are documented before implementation.
4. Buyer and admin UI can be built against the same contracts.

---

## 21. Error And Empty State Pass

### Public pages

1. Product not found.
2. No products in category.
3. Article draft or unavailable.
4. Failed product fetch.

### Auth

1. Invalid login.
2. Email already registered.
3. Expired session.
4. Missing profile.
5. Role not allowed.

### Buyer portal

1. No requests yet.
2. Request submission failed.
3. Request upload failed.
4. Request not found or not owned by buyer.
5. Message send failed.

### Admin portal

1. No requests in selected filter.
2. Unassigned request.
3. Invalid status transition.
4. Assignment failed.
5. AI helper unavailable.

### Quotation

1. No quote created yet.
2. Quote is draft and not visible to buyer.
3. Quote expired.
4. Invalid quotation transition.

### Acceptance criteria

1. Every page has empty and failure states.
2. Form data is preserved after recoverable errors where possible.
3. Unauthorized access never reveals private row details.
4. Invalid transitions are blocked with clear feedback.

---

## 22. Monitoring And Analytics Pass

### MVP events to track

```txt
product_viewed
create_request_clicked
request_started
request_submitted
request_submission_failed
buyer_message_sent
admin_status_changed
quotation_sent
```

### Operational metrics

```txt
New requests per week
Average admin response time
Requests waiting for buyer reply
Requests waiting for admin review
Quote preparation time
Won/lost count
```

### Acceptance criteria

1. The team can see whether buyers start but abandon requests.
2. Admin can measure response speed.
3. Analytics does not expose private buyer data unnecessarily.

---

## 23. Language And I18n Decision

### MVP recommendation

Use English for the public buyer-facing website because target buyers are international.

Admin interface can be English first, then Vietnamese labels can be added later if the operating team prefers.

### Future i18n

Plan for:

```txt
English public site
Vietnamese admin option
Possible Vietnamese content for company/internal pages
```

Do not implement full i18n until content and workflow are stable.

---

## 24. Database Planning Checklist

Prepare these tables before build:

```txt
profiles
product_categories
products
articles
media_assets
seo_metadata
inquiries
sourcing_requests
request_messages
request_attachments
request_status_history
quotations
quotation_items
redirects
internal_links
```

MVP tables for first working portal:

```txt
profiles
product_categories
products
inquiries
sourcing_requests
request_messages
request_attachments
request_status_history
```

CMS and quotation tables can follow after the sourcing request workflow is stable.

---

## 25. Final Build Sequence

### Planning pass

1. Confirm sitemap.
2. Confirm product categories.
3. Confirm request fields.
4. Confirm statuses.
5. Confirm admin actions.
6. Confirm AI guardrails.
7. Confirm tech stack.
8. Confirm auth strategy.
9. Confirm RLS matrix.
10. Confirm API contracts.
11. Confirm initial seed data.
12. Confirm error and empty states.

### Design pass

1. Home wireframe.
2. Product listing wireframe.
3. Product detail wireframe.
4. Register/login wireframe.
5. Buyer dashboard wireframe.
6. New request wireframe.
7. Request detail wireframe.
8. Admin queue wireframe.
9. Admin review wireframe.

### Data pass

1. Supabase schema.
2. RLS policy plan.
3. Storage bucket plan.
4. Status transition rules.
5. Seed data plan.

### API contract pass

1. Define API routes or Server Actions.
2. Define request/response shapes.
3. Define validation errors.
4. Define role-specific update rules.
5. Define file upload contract.

### Build pass

1. Public pages.
2. Auth.
3. Buyer portal.
4. Admin portal.
5. Messaging and attachments.
6. AI helper.
7. Quotation draft.
8. CMS and SEO.

### QA pass

1. Buyer can register.
2. Buyer can create request.
3. Admin can review request.
4. Admin can ask for more information.
5. Buyer can reply.
6. Admin can prepare quotation.
7. AI cannot make commercial commitments.
8. Public pages remain SEO-ready.
