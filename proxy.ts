import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessAdminArea, canAccessBuyerArea, getRoleHome } from "./app/lib/auth/roles";
import { getSupabaseConfig } from "./app/lib/env";

export async function proxy(request: NextRequest) {
  const { anonKey, isConfigured, url } = getSupabaseConfig();
  const { pathname } = request.nextUrl;

  if (!isConfigured || !url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, options, value }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && (pathname.startsWith("/buyer") || pathname.startsWith("/admin"))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("status", "expired");
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = profile?.role;

  if (!role && (pathname.startsWith("/buyer") || pathname.startsWith("/admin"))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("status", "missing-profile");
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && role) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = getRoleHome(role);
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (pathname.startsWith("/buyer") && !canAccessBuyerArea(role)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("status", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !canAccessAdminArea(role)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("status", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/buyer/:path*", "/admin/:path*", "/login", "/register"]
};
