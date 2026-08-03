import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { canAccessAdminPanel, canAccessDoctorPanel } from "@/lib/roles";

const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = Boolean(payload);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/dashboard/admin") &&
    payload &&
    !canAccessAdminPanel(payload.roleId, payload.viewMode)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    pathname.startsWith("/dashboard/doctor") &&
    payload &&
    !canAccessDoctorPanel(payload.roleId, payload.viewMode)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
