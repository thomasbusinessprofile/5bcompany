-- Sprint A — Contract Generation module.
-- Implements all 12 audit-locked fixes from the planning doc:
-- per-type numbering sequences, share-token expiry/revoke, counterparty
-- snapshot freezing, automatic versioning, and security-definer RPCs for
-- public event logging.

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique,
  type text not null check (type in ('loi','sample','proforma','sales','distribution')),
  version integer not null default 1,

  deal_id uuid references public.crm_deals(id) on delete set null,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  company_id uuid references public.crm_companies(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  template_id uuid,  -- FK added after contract_templates is created, see ALTER TABLE below

  -- Counterparty snapshot (frozen once status != 'draft' via trigger).
  buyer_legal_name text not null,
  buyer_address text,
  buyer_tax_id text,
  buyer_signer_name text,
  buyer_signer_email text,
  buyer_signer_title text,

  -- Commercial terms
  currency text not null default 'USD',
  total_amount numeric(14,2) not null default 0,
  tax_pct numeric(5,2) not null default 0,
  incoterm text,
  payment_terms text,
  validity_until date,
  delivery_window text,

  -- Document content
  line_items jsonb not null default '[]'::jsonb,
  terms_html text,
  language text not null default 'en',

  -- Files
  pdf_url text,
  signed_pdf_url text,

  -- Workflow
  status text not null default 'draft'
    check (status in ('draft','sent','viewed','signed','declined','expired','superseded')),
  share_token text unique,
  share_token_expires_at timestamptz,
  share_token_revoked_at timestamptz,
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  declined_at timestamptz,
  decline_reason text,

  -- Signature audit
  signer_ip inet,
  signer_user_agent text,
  signer_typed_name text,
  signature_method text,            -- 'click_to_accept' | 'wet_sign_upload'

  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contracts_status_idx on public.contracts(status);
create index contracts_deal_idx on public.contracts(deal_id);
create index contracts_contact_idx on public.contracts(contact_id);
create index contracts_share_token_idx on public.contracts(share_token);
create index contracts_buyer_email_idx on public.contracts(lower(buyer_signer_email));

create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('loi','sample','proforma','sales','distribution')),
  language text not null default 'en',
  terms_html text not null,
  default_payment_terms text,
  default_incoterm text,
  default_validity_days integer not null default 14,
  variables jsonb not null default '[]'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add FK now that templates exists.
alter table public.contracts
  drop constraint if exists contracts_template_id_fkey,
  add constraint contracts_template_id_fkey foreign key (template_id)
    references public.contract_templates(id) on delete set null;

create table public.contract_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  event_type text not null,
  actor text,
  actor_email text,
  ip inet,
  user_agent text,
  metadata jsonb,
  occurred_at timestamptz not null default now()
);

create index contract_events_contract_idx on public.contract_events(contract_id, occurred_at desc);

create table public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  unique (contract_id, version)
);

create index contract_versions_contract_idx on public.contract_versions(contract_id, version desc);

create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function app_private.set_updated_at();

create trigger contract_templates_set_updated_at
before update on public.contract_templates
for each row execute function app_private.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Numbering sequences (one per type) + auto-fill trigger
-- ─────────────────────────────────────────────────────────────────────────
create sequence contracts_loi_seq;
create sequence contracts_sample_seq;
create sequence contracts_proforma_seq;
create sequence contracts_sales_seq;
create sequence contracts_distribution_seq;

create or replace function app_private.assign_contract_number()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  v_prefix text;
  v_seq text;
  v_n bigint;
begin
  if new.contract_number is not null and new.contract_number <> '' then
    return new;
  end if;

  case new.type
    when 'loi' then v_prefix := 'LOI'; v_seq := 'contracts_loi_seq';
    when 'sample' then v_prefix := 'SAMPLE'; v_seq := 'contracts_sample_seq';
    when 'proforma' then v_prefix := 'PROFORMA'; v_seq := 'contracts_proforma_seq';
    when 'sales' then v_prefix := 'SALES'; v_seq := 'contracts_sales_seq';
    when 'distribution' then v_prefix := 'DIST'; v_seq := 'contracts_distribution_seq';
    else raise exception 'unknown contract type: %', new.type;
  end case;

  v_n := nextval(v_seq);
  new.contract_number := v_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(v_n::text, 4, '0');
  return new;
end;
$$;

create trigger contracts_assign_number
before insert on public.contracts
for each row execute function app_private.assign_contract_number();

-- ─────────────────────────────────────────────────────────────────────────
-- Counterparty + content freezing once contract leaves 'draft'
-- ─────────────────────────────────────────────────────────────────────────
create or replace function app_private.freeze_contract_after_sent()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
begin
  if old.status <> 'draft' then
    -- Buyer snapshot must not change after first send.
    if new.buyer_legal_name is distinct from old.buyer_legal_name
       or new.buyer_address is distinct from old.buyer_address
       or new.buyer_tax_id is distinct from old.buyer_tax_id
       or new.buyer_signer_name is distinct from old.buyer_signer_name
       or new.buyer_signer_email is distinct from old.buyer_signer_email
       or new.buyer_signer_title is distinct from old.buyer_signer_title then
      raise exception 'buyer counterparty fields are frozen after contract is sent (status=%)', old.status;
    end if;
  end if;
  return new;
end;
$$;

create trigger contracts_freeze_buyer
before update on public.contracts
for each row execute function app_private.freeze_contract_after_sent();

-- ─────────────────────────────────────────────────────────────────────────
-- Auto-version on edits after 'sent'
-- ─────────────────────────────────────────────────────────────────────────
create or replace function app_private.snapshot_contract_version()
returns trigger
language plpgsql
set search_path = public, app_private
as $$
declare
  v_actor uuid;
begin
  -- Only snapshot meaningful business-content changes; ignore pure status
  -- transitions or PDF URL updates.
  if old.status not in ('draft') and (
        new.line_items is distinct from old.line_items
     or new.terms_html is distinct from old.terms_html
     or new.total_amount is distinct from old.total_amount
     or new.currency is distinct from old.currency
     or new.tax_pct is distinct from old.tax_pct
     or new.incoterm is distinct from old.incoterm
     or new.payment_terms is distinct from old.payment_terms
     or new.validity_until is distinct from old.validity_until
     or new.delivery_window is distinct from old.delivery_window
  ) then
    v_actor := app_private.current_profile_id();
    insert into public.contract_versions (contract_id, version, snapshot, changed_by)
    values (old.id, old.version, to_jsonb(old), v_actor);
    new.version := old.version + 1;
  end if;
  return new;
end;
$$;

create trigger contracts_snapshot_version
before update on public.contracts
for each row execute function app_private.snapshot_contract_version();

-- ─────────────────────────────────────────────────────────────────────────
-- Public event-logging RPC (security definer) — used by /sign/[token]
-- in Sprint B; defined now to avoid a second migration later.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.log_contract_event(
  p_token text,
  p_event_type text,
  p_actor_email text default null,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_contract_id uuid;
begin
  select id into v_contract_id
    from public.contracts
   where share_token = p_token
     and (share_token_expires_at is null or share_token_expires_at > now())
     and share_token_revoked_at is null;

  if v_contract_id is null then
    raise exception 'invalid_or_expired_token';
  end if;

  insert into public.contract_events (contract_id, event_type, actor, actor_email, metadata)
  values (v_contract_id, p_event_type, 'buyer', p_actor_email, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

grant execute on function public.log_contract_event(text, text, text, jsonb) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────
alter table public.contracts enable row level security;
alter table public.contract_templates enable row level security;
alter table public.contract_events enable row level security;
alter table public.contract_versions enable row level security;

grant select, insert, update, delete on public.contracts to authenticated;
grant select, insert, update, delete on public.contract_templates to authenticated;
grant select on public.contract_events to authenticated;
grant select on public.contract_versions to authenticated;

-- contracts: internal full access; buyer reads where their email matches.
create policy "contracts internal access"
  on public.contracts for all
  using (app_private.current_role() in ('admin','sales','sourcing','viewer','content_manager'))
  with check (app_private.current_role() in ('admin','sales','sourcing','content_manager'));

create policy "contracts buyer read own"
  on public.contracts for select
  using (
    buyer_signer_email is not null
    and lower(buyer_signer_email) = lower((select email from auth.users where id = (select auth.uid())))
  );

create policy "contract_templates internal access"
  on public.contract_templates for all
  using (app_private.current_role() in ('admin','sales','sourcing','viewer','content_manager'))
  with check (app_private.current_role() in ('admin','sales','sourcing','content_manager'));

create policy "contract_events internal read"
  on public.contract_events for select
  using (app_private.current_role() in ('admin','sales','sourcing','viewer','content_manager'));

create policy "contract_events internal insert"
  on public.contract_events for insert
  with check (app_private.current_role() in ('admin','sales','sourcing','content_manager'));

create policy "contract_versions internal read"
  on public.contract_versions for select
  using (app_private.current_role() in ('admin','sales','sourcing','viewer','content_manager'));

-- ─────────────────────────────────────────────────────────────────────────
-- Seed templates (Sprint A starter set — English, 2 types)
-- ─────────────────────────────────────────────────────────────────────────
insert into public.contract_templates (name, type, language, terms_html, default_payment_terms, default_incoterm, default_validity_days, variables) values
(
  'LOI — standard',
  'loi',
  'en',
  '<h2>Letter of Intent</h2>
<p>This Letter of Intent is entered into between <strong>{{seller.legal_name}}</strong> (the Seller) and <strong>{{buyer.legal_name}}</strong> (the Buyer) on {{issued_at}}.</p>
<h3>1. Subject</h3>
<p>The Parties express their intent to negotiate in good faith for the supply of the goods described in the line items below, subject to mutually agreed final terms in a definitive Sales Contract.</p>
<h3>2. Goods</h3>
{{line_items_table}}
<h3>3. Indicative Commercial Terms</h3>
<ul>
  <li>Total indicative value: {{total}} {{currency}}</li>
  <li>Incoterm: {{incoterm}}</li>
  <li>Payment terms: {{payment_terms}}</li>
  <li>Delivery window: {{delivery_window}}</li>
</ul>
<h3>4. Validity</h3>
<p>This LOI is valid until <strong>{{validity_until}}</strong>. Either Party may withdraw before signature of the definitive Sales Contract without penalty.</p>
<h3>5. Confidentiality</h3>
<p>All information exchanged in connection with this LOI shall be kept confidential for a period of two (2) years.</p>
<h3>6. Non-binding nature</h3>
<p>Except for Section 5 (Confidentiality), this LOI is a non-binding expression of intent and does not constitute a contract for sale.</p>',
  '30% T/T deposit on order confirmation, 70% T/T against B/L copy',
  'FOB Hai Phong',
  14,
  '["buyer.legal_name","buyer.address","buyer.signer_name","incoterm","payment_terms","delivery_window","validity_until","total","currency","line_items_table"]'::jsonb
),
(
  'Sales Contract — FOB standard',
  'sales',
  'en',
  '<h2>Commercial Sales Contract</h2>
<p><strong>Contract No:</strong> {{contract_number}}<br/>
<strong>Date:</strong> {{issued_at}}</p>
<h3>The Parties</h3>
<p><strong>Seller:</strong> {{seller.legal_name}}, {{seller.address}}, Tax ID {{seller.tax_id}}.</p>
<p><strong>Buyer:</strong> {{buyer.legal_name}}, {{buyer.address}}, Tax ID {{buyer.tax_id}}.</p>
<h3>1. Goods and Quantity</h3>
{{line_items_table}}
<h3>2. Price and Payment</h3>
<p>Total contract value: <strong>{{total}} {{currency}}</strong>{{#tax_pct}} (incl. {{tax_pct}}% tax){{/tax_pct}}.</p>
<p>Payment terms: {{payment_terms}}.</p>
<h3>3. Delivery</h3>
<p>Incoterm: <strong>{{incoterm}}</strong> (Incoterms 2020).</p>
<p>Delivery window: {{delivery_window}}, calculated from receipt of the Buyer''s deposit.</p>
<h3>4. Packing and Marking</h3>
<p>Standard export packing as specified in the line items above. ISPM-15 compliant pallets where applicable.</p>
<h3>5. Quality and Inspection</h3>
<p>Goods shall conform to the specifications in Annex A (sample reference) or the Buyer''s purchase order, whichever is later. Pre-shipment inspection may be performed by a third party at the Buyer''s cost.</p>
<h3>6. Documents</h3>
<p>Seller shall provide: commercial invoice, packing list, bill of lading, certificate of origin (Form A / Form B / Form EUR.1 as applicable), and any product certificates referenced in the line items.</p>
<h3>7. Force Majeure</h3>
<p>Neither Party is liable for delay or non-performance caused by events beyond reasonable control, including natural disasters, government actions, port closures, or pandemics. The affected Party shall notify the other within 7 calendar days.</p>
<h3>8. Disputes</h3>
<p>Any dispute shall be settled by arbitration at the Vietnam International Arbitration Centre (VIAC) in Hanoi, in English, under the VIAC Rules.</p>
<h3>9. Validity</h3>
<p>This Contract becomes binding upon signature by both Parties and remains in force until full execution of all obligations.</p>',
  '30% T/T deposit on contract signature, 70% T/T against B/L copy',
  'FOB Hai Phong',
  14,
  '["buyer.legal_name","buyer.address","buyer.tax_id","buyer.signer_name","incoterm","payment_terms","delivery_window","validity_until","total","currency","tax_pct","line_items_table","contract_number","issued_at"]'::jsonb
);

commit;
