alter table public.sourcing_requests
add column if not exists ai_suggested_questions jsonb not null default '[]'::jsonb;
