-- Sprint B — public RPCs the buyer-facing /sign/[token] page uses.
-- Anon-callable, security definer, all validate the share token + expiry
-- before touching contracts.

create or replace function public.get_contract_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_row public.contracts;
begin
  select * into v_row from public.contracts
   where share_token = p_token
     and (share_token_expires_at is null or share_token_expires_at > now())
     and share_token_revoked_at is null
     and status in ('sent','viewed');
  if v_row.id is null then
    return null;
  end if;
  return jsonb_build_object(
    'id', v_row.id,
    'contract_number', v_row.contract_number,
    'type', v_row.type,
    'version', v_row.version,
    'buyer_legal_name', v_row.buyer_legal_name,
    'buyer_signer_name', v_row.buyer_signer_name,
    'buyer_signer_email', v_row.buyer_signer_email,
    'buyer_signer_title', v_row.buyer_signer_title,
    'buyer_address', v_row.buyer_address,
    'buyer_tax_id', v_row.buyer_tax_id,
    'currency', v_row.currency,
    'total_amount', v_row.total_amount,
    'tax_pct', v_row.tax_pct,
    'incoterm', v_row.incoterm,
    'payment_terms', v_row.payment_terms,
    'validity_until', v_row.validity_until,
    'delivery_window', v_row.delivery_window,
    'line_items', v_row.line_items,
    'terms_html', v_row.terms_html,
    'language', v_row.language,
    'pdf_url', v_row.pdf_url,
    'status', v_row.status,
    'sent_at', v_row.sent_at,
    'viewed_at', v_row.viewed_at,
    'created_at', v_row.created_at
  );
end;
$$;
grant execute on function public.get_contract_by_token(text) to anon, authenticated;

create or replace function public.accept_contract(
  p_token text, p_typed_name text, p_ip text default null, p_user_agent text default null
) returns jsonb
language plpgsql security definer set search_path = public, app_private
as $$
declare v_id uuid; v_status text;
begin
  if p_typed_name is null or length(btrim(p_typed_name)) < 2 then
    raise exception 'typed_name_too_short';
  end if;
  select id, status into v_id, v_status from public.contracts
   where share_token = p_token
     and (share_token_expires_at is null or share_token_expires_at > now())
     and share_token_revoked_at is null
   for update;
  if v_id is null then raise exception 'invalid_or_expired_token'; end if;
  if v_status not in ('sent','viewed') then
    raise exception 'cannot_accept_in_status_%', v_status;
  end if;
  update public.contracts set
    status = 'signed', signed_at = now(),
    signer_typed_name = p_typed_name,
    signer_ip = nullif(p_ip,'')::inet,
    signer_user_agent = p_user_agent,
    signature_method = 'click_to_accept'
  where id = v_id;
  insert into public.contract_events (contract_id, event_type, actor, ip, user_agent, metadata)
  values (v_id, 'signed', 'buyer', nullif(p_ip,'')::inet, p_user_agent,
          jsonb_build_object('typed_name', p_typed_name, 'method', 'click_to_accept'));
  return jsonb_build_object('id', v_id, 'status', 'signed');
end;
$$;
grant execute on function public.accept_contract(text, text, text, text) to anon, authenticated;

create or replace function public.decline_contract(
  p_token text, p_reason text, p_ip text default null, p_user_agent text default null
) returns jsonb
language plpgsql security definer set search_path = public, app_private
as $$
declare v_id uuid; v_status text;
begin
  select id, status into v_id, v_status from public.contracts
   where share_token = p_token
     and (share_token_expires_at is null or share_token_expires_at > now())
     and share_token_revoked_at is null
   for update;
  if v_id is null then raise exception 'invalid_or_expired_token'; end if;
  if v_status not in ('sent','viewed') then raise exception 'cannot_decline_in_status_%', v_status; end if;
  update public.contracts set status = 'declined', declined_at = now(),
    decline_reason = nullif(btrim(coalesce(p_reason,'')), '')
  where id = v_id;
  insert into public.contract_events (contract_id, event_type, actor, ip, user_agent, metadata)
  values (v_id, 'declined', 'buyer', nullif(p_ip,'')::inet, p_user_agent,
          jsonb_build_object('reason', p_reason));
  return jsonb_build_object('id', v_id, 'status', 'declined');
end;
$$;
grant execute on function public.decline_contract(text, text, text, text) to anon, authenticated;

create or replace function public.mark_contract_viewed(
  p_token text, p_ip text default null, p_user_agent text default null
) returns void
language plpgsql security definer set search_path = public, app_private
as $$
declare v_id uuid; v_status text;
begin
  select id, status into v_id, v_status from public.contracts
   where share_token = p_token
     and (share_token_expires_at is null or share_token_expires_at > now())
     and share_token_revoked_at is null;
  if v_id is null then return; end if;
  if v_status = 'sent' then
    update public.contracts set status = 'viewed', viewed_at = now() where id = v_id;
  end if;
  insert into public.contract_events (contract_id, event_type, actor, ip, user_agent)
  values (v_id, 'viewed', 'buyer', nullif(p_ip,'')::inet, p_user_agent);
end;
$$;
grant execute on function public.mark_contract_viewed(text, text, text) to anon, authenticated;
