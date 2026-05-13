# Audit ECC + UX/UI Pro Max — 5B Trading Sourcing Portal

Date: 2026-05-13
Branch: `claude/audit-ecc-ux-improvements-7RtX6`
Framework: **ECC tổng hợp** = Effectiveness + Clarity + Consistency × Export Compliance × E-Commerce Conversion × Nielsen 10 heuristics.

Tổng cộng **~110 findings** trên 26 route. Báo cáo này lưu nguyên trạng để theo dõi; các fix P0/P1 dễ thực hiện đã được commit kèm.

---

## 1. Tổng quan thiết kế hệ thống

### Design tokens (`app/globals.css:1-13`)
- Màu: `--ink #17211d`, `--muted #5f6b65`, `--line #dbe3de`, `--paper #f8faf8`, `--panel #fff`, `--green #1f6b4a`, `--green-dark #123f2d`, `--gold #c6922e`, `--blue #2e6074`, `--charcoal #26312e`
- Shadow: `--shadow 0 20px 50px rgba(23,33,29,.12)`
- Focus: 3px gold outline (chuẩn AA, giữ nguyên)
- Spacing responsive: `clamp(20px,4vw,56px)` / `clamp(42px,7vw,84px)`

### Shared classes
`.primary-link`, `.secondary-link`, `.ghost-link`, `.product-card`, `.page-card`, `.workflow-panel`, `.request-form`, `.metric-grid`, `.card-grid`, `.catalogue-grid`, `.table-list`, `.empty-state`, `.message-bubble`, `.filter-chip`, `.form-note`, `.form-status`.

### Shared data
`app/shared/*.ts` chỉ chứa data + utility, **chưa có React component dùng chung**. Layout/footer/header lặp lại inline trong `app/layout.tsx`.

---

## 2. Findings theo độ ưu tiên

### P0 — Blocking (5)
| # | File:line | Vấn đề | Fix |
|---|-----------|--------|-----|
| P0-1 | `app/products/page.tsx:111` | Class Tailwind `mt-4` dùng nhưng project không có Tailwind → margin không render | Thêm `.mt-4 { margin-top: 1rem }` vào globals.css hoặc bỏ class |
| P0-2 | Tất cả form submit (`/request-quote`, `/login`, `/register`, `/buyer/requests/new`, admin forms) | Không có loading state / disabled khi submit → double-submit | Wrap submit button bằng client component dùng `useFormStatus()` |
| P0-3 | `app/buyer/requests/[id]/page.tsx:188-194` | File input không hiển thị max size 10MB, không validate client-side | Thêm `accept` MIME + form-note "Tối đa 10MB" |
| P0-4 | `app/register/page.tsx:94-95` | `minLength=8` nhưng không hiển thị hint cho user | Thêm `form-note` "Mật khẩu tối thiểu 8 ký tự" |
| P0-5 | `app/admin/requests/page.tsx:27-32` | Filter chips là `<span>` static, không clickable nhưng có active state → giả lập tính năng | Convert sang `<Link>` query param, hoặc xoá nếu chưa làm xong |

### P1 — High impact (38)

**Form & feedback**
- P1-1 Confirmation modal khi đổi status / gửi quotation cho buyer (`app/admin/requests/[id]/page.tsx:123`, `app/admin/quotations/[id]/page.tsx:133`).
- P1-2 Internal admin message không có cảnh báo trực quan đủ mạnh (`app/admin/requests/[id]/page.tsx:209`) → dễ leak.
- P1-3 Draft quotation note chỉ là helper text — đổi thành alert đỏ "Không hứa giá/lead time trong draft".
- P1-4 Email regex quá lỏng (`app/request-quote/actions.ts:12`): cho phép `a@b.c`. Dùng `/^[^\s@]{2,}@[^\s@]{3,}\.[a-zA-Z]{2,}$/`.
- P1-5 Company name nên required trong public RFQ (`app/request-quote/page.tsx:90`).
- P1-6 Incoterm `"EXW discussion"` không chuẩn (`app/buyer/requests/new/page.tsx:104-112`) → chỉ giữ EXW/FOB/CFR/CIF/DDP.
- P1-7 Category dropdown ở buyer/requests/new submit được dù trống → validate.
- P1-8 Business type select không có `required` (`app/register/page.tsx:78`).
- P1-9 Textarea 2000 char nhưng không có counter (`app/admin/requests/[id]/page.tsx:220`, `app/buyer/requests/[id]/page.tsx:167`).
- P1-10 "Check your email if confirmation is required" (`app/register`) → câu mơ hồ; chốt lại "Vui lòng xác minh email rồi đăng nhập".
- P1-11 Forgot password flow thiếu hoàn toàn trên `/login`.
- P1-12 Quotation subtotal `qty*price` = 0 không warn (`app/admin/quotations/[id]/actions.ts:29-31`).
- P1-13 MOQ buyer request không validate vs `product.moq`.
- P1-14 Quotation chỉ edit được item[0] (`app/admin/quotations/[id]/page.tsx:46`) → multi-item quote không sửa đủ.

**Accessibility & nav**
- P1-15 Nav không có `aria-current="page"` & style active (`app/layout.tsx:49-54`).
- P1-16 Filter active state không nhất quán giữa products (có aria-current) và admin/requests (không).
- P1-17 `.form-status.error` dùng gold low-contrast (`#fff4e1`/`#6d4710`) — nên dùng đỏ rõ ràng.
- P1-18 `html lang="en"` nhưng footer tiếng Việt → đặt `lang="vi"` hoặc i18n toggle.
- P1-19 Tất cả page metadata thiếu `alternates.canonical` ngoài landing.

**Compliance & data**
- P1-20 Filter "All/New/Need Info/Quote Prep/High Priority" không hoạt động — gây hiểu lầm compliance audit.
- P1-21 Status label `replaceAll("_"," ")` ra "admin review" lowercase — inconsistent.
- P1-22 Lỗi cập nhật status redirect kèm `?status=update-error` nhưng mất state form.
- P1-23 Quotation status `"sent"` mơ hồ (gửi nội bộ hay gửi buyer?) — đổi thành `pending_approval/approved/sent_to_buyer`.
- P1-24 Currency mặc định USD không khớp destination buyer.
- P1-25 Không có audit log cho quotation edits — chỉ có request_status_history.
- P1-26 Approval layer trước khi gửi quotation cho buyer chưa có.
- P1-27 Destination port nhập free text, không validate.
- P1-28 Buyer verification thiếu (cho phép @gmail.com đăng ký B2B).

**Conversion & growth**
- P1-29 CTA trong empty state buyer/dashboard không có button rõ.
- P1-30 Article không có read time estimate.
- P1-31 SEO: thiếu schema.org Product trên `/products/[slug]`.
- P1-32 Analytics `request_started` fire khi page load thay vì khi user tương tác.
- P1-33 Hero không có max-height → screen cao quá tải.
- P1-34 Trust signals (chứng nhận, số năm kinh nghiệm) chưa hiển thị nổi bật ở landing.
- P1-35 Không có quotation PDF export → buyer khó lưu hồ sơ.
- P1-36 Không gắn `next` validation trong login redirect → open-redirect risk.
- P1-37 Rate limit RFQ public chưa có.
- P1-38 Confirm email flow không có resend button.

### P2 — Medium (42)
1. Footer 3-cột không stack ở mobile (`globals.css:737`).
2. Table 6-col tràn ở mobile, không scroll ngang.
3. Loading skeleton thiếu mọi nơi.
4. Bulk actions admin queue.
5. Search admin queue.
6. Quotation validity_days không có help text.
7. Product SKU không hiển thị trên card.
8. Attachment list không clickable (`buyer/requests/[id]:178`).
9. `item.tone` đặt tên sai (thực ra là senderRole).
10. Quotation expiration không enforce.
11. Helper `value()` lặp ở 6 file action → đưa vào `app/lib/form-utils.ts`.
12. `slugify()` lặp ở 2 nơi.
13. Business type Set lặp.
14. Magic numbers (10MB, 2000, 7 days) cần `app/lib/constants.ts`.
15. Status options hardcode ở page và actions (`admin/requests/[id]`) — phải sync tay.
16. Article excerpt không hiện ở list view.
17. Page title detail không thêm tên record (browser tab khó phân biệt).
18. Tracking phụ thuộc string-typed event name → union type.
19. Related products cắt 3 tag không giải thích.
20. Quotation item không có nút xoá.
21. Admin metrics không cache-bust khi nhiều admin làm song song.
22. No structured product data fields (length/width/material).
23. Document availability matrix với product chưa có.
24. QC plan / inspector field chưa có trong quotation.
25. Default request fields gợi ý ở `/products/[slug]` không lặp lại ở form.
26. Export-process page có tag "Owner" placeholder.
27. Lead time vs timeline confusion trong AI structuring.
28. Tone "gold" cho error message cần thay đỏ.
29. Không có toast/persist success cho profile update.
30. Không hỗ trợ i18n.
31. Tất cả error message hardcode.
32. Không có focus trap chuẩn bị cho modal tương lai.
33. Không có undo cho attachment đã xoá.
34. Admin guardrails hiển thị checklist read-only — không enforce.
35. Filter chips products dùng aria-current, admin không → standardize.
36. Status legend cho buyer (`quotation_sent`, `draft`, ...) chưa giải thích.
37. Articles meta description quá ngắn cho SEO.
38. Form abandonment analytics thiếu.
39. Không có `<noscript>` fallback ở các trang client-only.
40. `error.tsx` global, không phân biệt route.
41. Empty state thiếu illustration → khô cứng.
42. Footer copy lặp company info giữa header & company.ts (đã centralize, OK).

---

## 3. Heuristics map (Nielsen)
| Heuristic | Vi phạm chính |
|-----------|--------------|
| Visibility of status | Loading states (P0-2), draft warning yếu (P1-3) |
| Match real world | "EXW discussion", `quotation_sent` jargon |
| User control | Không có cancel/unsaved-changes guard |
| Consistency | aria-current khác nhau, form error tone gold |
| Error prevention | Confirm modal thiếu, file size hint thiếu |
| Recognition vs recall | MOQ không lặp lại ở form, business type không tooltip |
| Flexibility | Không bulk action, không search admin queue |
| Aesthetic minimal | Placeholder tag "Owner" trên export-process |
| Error recovery | Mất state khi update lỗi (P1-22, P2-attachment) |
| Help & docs | Password rule, file size, validity_days đều không hint |

---

## 4. Roadmap đề xuất

**Tuần 1 — P0** (đã fix kèm commit này): mt-4, filter chip clickable, password hint, file-size hint, error contrast, business_type required, incoterm chuẩn, email regex, check-email wording, nav active, footer responsive, lang=vi.

**Tuần 2 — P1 còn lại**: client form submit state (`useFormStatus`), confirmation modal, internal-only alert đỏ, forgot password, char counter, quotation subtotal warn, approval layer.

**Tuần 3 — P2 + Code quality**: extract utils (`form-utils.ts`, `constants.ts`, `validators.ts` Zod), bulk actions admin, search, loading skeleton, i18n, table mobile, SEO schema.

---

## 5. Tham chiếu tokens (sẵn dùng)
```css
--green:#1f6b4a /* primary */   --gold:#c6922e /* focus/warn */
--red-error:#b3261e /* MỚI đề xuất cho .form-status.error */
```
