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

  if ((pathname === "/login" || pathname === "/register") && role) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = getRoleHome(role);
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (pathname.startsWith("/buyer") && !canAccessBuyerArea(role)) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = getRoleHome(role);
    targetUrl.search = "";
    return NextResponse.redirect(targetUrl);
  }

  if (pathname.startsWith("/admin") && !canAccessAdminArea(role)) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = getRoleHome(role);
    targetUrl.search = "";
    return NextResponse.redirect(targetUrl);
  }

  return response;
}

export const config = {
  matcher: ["/buyer/:path*", "/admin/:path*", "/login", "/register"]
};
