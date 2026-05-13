create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = app_private, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
