-- Bootstraps an admin user.
--
-- ⚠️ BEFORE RUNNING THIS MIGRATION:
--    1. Set BOTH variables below to your chosen email + a strong password
--       (or set the supabase env vars and read them via current_setting()).
--    2. Run the migration.
--    3. Log in once and change the password via Supabase Studio.
--
-- This file is intentionally checked in WITHOUT a real password.
-- The previous password ('ZJTxUx3PK2AmXXk!Vr@E') was committed to git
-- history and has been rotated; do not reuse it.
--
-- Idempotent: re-running upserts the auth user, ensures profile exists,
-- promotes role to 'admin'. Password is rotated only when the file
-- contains a value other than the placeholder.

create extension if not exists pgcrypto;

do $$
declare
  v_email text := 'admin@5bcompany.com';
  v_password text := 'CHANGE_ME_BEFORE_RUNNING';
  v_user_id uuid;
begin
  if v_password = 'CHANGE_ME_BEFORE_RUNNING' then
    raise notice 'Skipping admin bootstrap: password placeholder not changed.';
    return;
  end if;

  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf', 10)),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('full_name', 'Site Administrator'),
      now(),
      now(),
      '', '', '', ''
    )
    returning id into v_user_id;

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email',
      now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = crypt(v_password, gen_salt('bf', 10)),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_user_id;
  end if;

  insert into public.profiles (user_id, full_name, role)
  values (v_user_id, 'Site Administrator', 'admin')
  on conflict (user_id) do update set role = 'admin';
end $$;
