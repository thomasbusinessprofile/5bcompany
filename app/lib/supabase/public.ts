import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../env";

export function createPublicSupabaseClient() {
  const { anonKey, isConfigured, url } = getSupabaseConfig();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  });
}
