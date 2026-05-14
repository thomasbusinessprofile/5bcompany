-- Bootstraps an admin user.
--
-- Step 1 — Run in Supabase SQL editor with the service_role (or psql as
--          postgres). The pgcrypto extension is needed for crypt() to hash
--          the password the same way Supabase Auth does.
--
-- Email:    admin@5bcompany.com
-- Password: ZJTxUx3PK2AmXXk!Vr@E   ← change immediately after first login
--
-- Idempotent: re-running upserts the auth user, ensures profile exists,
-- promotes role to 'admin'.

create extension if not exists pgcrypto;

do $$
declare
  v_email text := 'admin@5bcompany.com';
  v_password text := 'ZJTxUx3PK2AmXXk!Vr@E';
  v_user_id uuid;
begin
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
      crypt(v_password, gen_salt('bf')),
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
    -- Ensure password is the known value (rotate by editing v_password above).
    update auth.users
       set encrypted_password = crypt(v_password, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_user_id;
  end if;

  -- The on-signup trigger creates a profile with role='buyer' for new users.
  -- For an existing user with no profile (eg. created via Studio UI), insert
  -- one. Then promote to admin in either case.
  insert into public.profiles (user_id, full_name, role)
  values (v_user_id, 'Site Administrator', 'admin')
  on conflict (user_id) do update set role = 'admin';
end $$;
