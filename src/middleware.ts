import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/crm",
  "/leads",
  "/contacts",
  "/companies",
  "/deals",
  "/activities",
  "/tasks",
  "/calendar",
  "/projects",
  "/employees",
  "/hr",
  "/recruitment",
  "/finance",
  "/invoices",
  "/expenses",
  "/reports",
  "/cms",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/crm/:path*",
    "/leads/:path*",
    "/contacts/:path*",
    "/companies/:path*",
    "/deals/:path*",
    "/activities/:path*",
    "/tasks/:path*",
    "/calendar/:path*",
    "/projects/:path*",
    "/employees/:path*",
    "/hr/:path*",
    "/recruitment/:path*",
    "/finance/:path*",
    "/invoices/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/cms/:path*",
    "/settings/:path*",
  ],
};
