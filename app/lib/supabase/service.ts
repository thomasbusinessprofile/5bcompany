import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../env";

/**
 * Server-only Supabase client using the service role key. Bypasses RLS.
 *
 * Use ONLY in trusted server contexts (server actions, route handlers, cron)
 * that have already authenticated the request via a separate mechanism
 * (e.g. a short-lived share_token or admin cookie). NEVER ship this client
 * down to a client component or browser bundle.
 */
export function createSupabaseServiceClient() {
  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
