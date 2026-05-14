-- Round 4 of the CRM: outbound email + reusable templates.

begin;

create table public.crm_email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text,
  body_text text,
  variables jsonb not null default '[]'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger crm_email_templates_set_updated_at
before update on public.crm_email_templates
for each row execute function app_private.set_updated_at();

create table public.crm_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  cc text,
  bcc text,
  from_email text not null,
  reply_to text,
  subject text not null,
  body_html text,
  body_text text,
  status text not null default 'queued',
  provider_id text,
  error text,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  deal_id uuid references public.crm_deals(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  template_id uuid references public.crm_email_templates(id) on delete set null,
  activity_id uuid references public.crm_activities(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_emails_contact_idx on public.crm_emails (contact_id, created_at desc);
create index crm_emails_deal_idx on public.crm_emails (deal_id, created_at desc);
create index crm_emails_status_idx on public.crm_emails (status);

create trigger crm_emails_set_updated_at
before update on public.crm_emails
for each row execute function app_private.set_updated_at();

alter table public.crm_email_templates enable row level security;
alter table public.crm_emails enable row level security;

grant select, insert, update, delete on public.crm_email_templates to authenticated;
grant select, insert, update, delete on public.crm_emails to authenticated;

create policy "crm_email_templates internal access"
  on public.crm_email_templates for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

create policy "crm_emails internal access"
  on public.crm_emails for all
  using (app_private.current_role() in ('admin', 'sales', 'sourcing', 'viewer', 'content_manager'))
  with check (app_private.current_role() in ('admin', 'sales', 'sourcing', 'content_manager'));

-- Seed two common templates so the UI is usable on first login.
insert into public.crm_email_templates (name, subject, body_text, body_html, variables) values
  (
    'RFQ acknowledgement',
    'Got your sourcing request — {{product_name}}',
    'Hi {{first_name}},

Thanks for the request on {{product_name}}. I''ll come back within one working day with a sourcing plan and indicative timeline.

In the meantime, if it helps to talk:
- WhatsApp: +84 825 646 868
- Email: hello@5bcompany.com

Best,
5B Trading',
    '<p>Hi {{first_name}},</p><p>Thanks for the request on <strong>{{product_name}}</strong>. I''ll come back within one working day with a sourcing plan and indicative timeline.</p><p>In the meantime, if it helps to talk:<br/>WhatsApp: +84 825 646 868<br/>Email: hello@5bcompany.com</p><p>Best,<br/>5B Trading</p>',
    '["first_name","product_name"]'::jsonb
  ),
  (
    'Quotation ready',
    'Your quotation — {{product_name}}',
    'Hi {{first_name}},

Please find attached our quotation for {{product_name}} ({{quantity}}). Valid for 14 days.

Happy to walk through the spec on a quick call — when works for you?

Best,
5B Trading',
    '<p>Hi {{first_name}},</p><p>Please find attached our quotation for <strong>{{product_name}}</strong> ({{quantity}}). Valid for 14 days.</p><p>Happy to walk through the spec on a quick call — when works for you?</p><p>Best,<br/>5B Trading</p>',
    '["first_name","product_name","quantity"]'::jsonb
  )
on conflict do nothing;

commit;
