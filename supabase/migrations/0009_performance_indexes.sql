create index if not exists inquiries_product_id_idx
on public.inquiries (product_id);

create index if not exists products_category_id_idx
on public.products (category_id);

create index if not exists quotations_created_by_idx
on public.quotations (created_by);

create index if not exists request_attachments_uploaded_by_idx
on public.request_attachments (uploaded_by);

create index if not exists request_messages_sender_id_idx
on public.request_messages (sender_id);

create index if not exists request_status_history_changed_by_idx
on public.request_status_history (changed_by);

create index if not exists sourcing_requests_category_id_idx
on public.sourcing_requests (category_id);

create index if not exists sourcing_requests_product_id_idx
on public.sourcing_requests (product_id);
