import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast gate for signed-in areas: no session cookie → /login.
 * The session itself (and the tenant) is validated on the server in
 * requireContext(); this only avoids rendering app pages for visitors.
 */
export function middleware(request: NextRequest) {
  if (!request.cookies.get("rb_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setup/:path*",
    "/properties/:path*",
    "/create/:path*",
    "/generations/:path*",
    "/contacts/:path*",
    "/pipeline/:path*",
    "/deals/:path*",
    "/tasks/:path*",
    "/cma/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/help/:path*",
    "/team/:path*",
  ],
};
