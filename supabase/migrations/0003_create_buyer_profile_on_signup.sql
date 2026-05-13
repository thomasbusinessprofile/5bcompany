create or replace function app_private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = app_private, public
as $$
begin
  insert into public.profiles (
    user_id,
    full_name,
    company_name,
    country,
    phone,
    whatsapp,
    business_type,
    role
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', ''),
    nullif(new.raw_user_meta_data ->> 'country', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'whatsapp', ''),
    nullif(new.raw_user_meta_data ->> 'business_type', '')::public.business_type,
    'buyer'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists auth_users_create_profile on auth.users;

create trigger auth_users_create_profile
after insert on auth.users
for each row execute function app_private.create_profile_for_new_user();
