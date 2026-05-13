"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";

const businessTypes = new Set([
  "importer",
  "distributor",
  "wholesaler",
  "retailer",
  "manufacturer",
  "sourcing_agent",
  "other"
]);

function value(formData: FormData, key: string) {
  const item = formData.get(key);

  return typeof item === "string" ? item.trim() : "";
}

function normalizeBusinessType(input: string) {
  const normalized = input.toLowerCase().replaceAll(" ", "_");

  return businessTypes.has(normalized) ? normalized : "other";
}

export async function registerBuyer(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/register?status=config-error");
  }

  const email = value(formData, "email");
  const password = value(formData, "password");
  const fullName = value(formData, "full_name");
  const companyName = value(formData, "company_name");

  if (!email || !password || !fullName || !companyName) {
    redirect("/register?status=missing-fields");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_type: normalizeBusinessType(value(formData, "business_type")),
        company_name: companyName,
        country: value(formData, "country"),
        full_name: fullName,
        phone: value(formData, "phone"),
        whatsapp: value(formData, "phone")
      }
    }
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      redirect("/register?status=email-exists");
    }
    redirect("/register?status=submit-error");
  }

  if (data.session) {
    redirect("/buyer/dashboard");
  }

  redirect("/login?status=check-email");
}
