grant insert, update on public.product_categories to authenticated;
grant insert, update on public.products to authenticated;

create policy "product categories cms insert"
on public.product_categories for insert
with check (app_private.current_role() in ('admin', 'content_manager'));

create policy "product categories cms update"
on public.product_categories for update
using (app_private.current_role() in ('admin', 'content_manager'))
with check (app_private.current_role() in ('admin', 'content_manager'));

create policy "products cms insert"
on public.products for insert
with check (app_private.current_role() in ('admin', 'content_manager'));

create policy "products cms update"
on public.products for update
using (app_private.current_role() in ('admin', 'content_manager'))
with check (app_private.current_role() in ('admin', 'content_manager'));
