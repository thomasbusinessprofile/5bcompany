"use server";

import { redirect } from "next/navigation";
import { getRoleHome } from "../lib/auth/roles";
import { createSupabaseServerClient } from "../lib/supabase/server";

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login?status=config-error");
  }

  const email = value(formData, "email");
  const password = value(formData, "password");
  const next = value(formData, "next");

  if (!email || !password) {
    redirect("/login?status=missing-fields");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect("/login?status=invalid");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user?.id)
    .maybeSingle();

  redirect(next || getRoleHome(profile?.role));
}
