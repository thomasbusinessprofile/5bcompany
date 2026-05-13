# Auth And Data Foundation

## Stack

```txt
Auth: Supabase Auth
App role source: public.profiles.role
Database: Supabase Postgres
Storage: Supabase Storage later for request attachments
```

## MVP Roles

```txt
buyer
admin
sales
sourcing
content_manager
viewer
```

## Signup Flow

1. Buyer submits register form.
2. Supabase Auth creates `auth.users` row.
3. App creates `public.profiles` row with `role = buyer`.
4. Buyer lands on `/buyer/dashboard`.
5. If profile is missing, route to onboarding/profile setup.

## Login Routing

```txt
buyer -> /buyer/dashboard
admin -> /admin/dashboard
sales -> /admin/requests
sourcing -> /admin/requests
content_manager -> /admin/products
viewer -> /admin/dashboard
```

## Migration Files

```txt
supabase/migrations/0001_sourcing_portal_foundation.sql
supabase/seed.sql
```

## RLS Rules

1. Buyer can read/update own profile.
2. Buyer can read/create own sourcing requests.
3. Buyer cannot update admin-only request fields such as `status`, `priority`, `lead_score`, `ai_summary`, `assigned_to`.
4. Buyer cannot read internal messages.
5. Admin can operate all requests.
6. Sales/sourcing can operate assigned requests.
7. Viewer can read operational data but cannot mutate.

## Next Implementation Step

After creating a Supabase project and adding environment variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Implement:

1. Supabase browser/server clients.
2. Register server action.
3. Login server action.
4. Middleware role redirect.
5. Buyer dashboard route guard.
