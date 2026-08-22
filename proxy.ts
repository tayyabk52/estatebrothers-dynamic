import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return request.cookies.getAll(); }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); supabaseResponse = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options)); } } });
  const { data: claimsData } = await supabase.auth.getClaims();
  const hasAuthenticatedUser = Boolean(claimsData?.claims.sub);
  const { pathname } = request.nextUrl;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  if (!hasAuthenticatedUser && isAdminRoute && !isAdminLogin) { const loginUrl = request.nextUrl.clone(); loginUrl.pathname = "/admin/login"; return NextResponse.redirect(loginUrl); }
  if (hasAuthenticatedUser && isAdminLogin) { const { data: isAdmin } = await supabase.rpc("is_admin"); if (!isAdmin) return supabaseResponse; const dashboardUrl = request.nextUrl.clone(); dashboardUrl.pathname = "/admin"; return NextResponse.redirect(dashboardUrl); }
  if (hasAuthenticatedUser && isAdminRoute && !isAdminLogin) { const { data: isAdmin } = await supabase.rpc("is_admin"); if (!isAdmin) { const loginUrl = request.nextUrl.clone(); loginUrl.pathname = "/admin/login"; loginUrl.searchParams.set("error", "not-approved"); return NextResponse.redirect(loginUrl); } }
  return supabaseResponse;
}

export const config = { matcher: ["/admin/:path*"] };
