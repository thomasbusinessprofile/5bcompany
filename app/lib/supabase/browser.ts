"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "../env";

// Browser-side Supabase client that reuses the session cookie set by the
// server. Use this for client components that need authenticated calls
// (e.g. uploading to storage as an admin).
export function createSupabaseBrowserClient() {
  const { anonKey, isConfigured, url } = getSupabaseConfig();
  if (!isConfigured || !url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
