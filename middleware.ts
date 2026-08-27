import { NextResponse, type NextRequest } from "next/server";
import { findDemoUser } from "@/lib/auth/users";
import { canAccessAdmin, canAccessWorkerPortal, homePathFor, SESSION_COOKIE } from "@/lib/rbac";

const PUBLIC_PREFIXES = ["/login", "/api/auth"];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const user = findDemoUser(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL(homePathFor(user), request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublic(pathname)) {
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL(homePathFor(user), request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isWorkerRoute =
    pathname.startsWith("/prezentare") ||
    pathname.startsWith("/programa") ||
    pathname.startsWith("/calendaristic") ||
    pathname.startsWith("/informa");

  if (isAdminRoute && !canAccessAdmin(user)) {
    return NextResponse.redirect(new URL("/prezentare", request.url));
  }

  if (isWorkerRoute && !canAccessWorkerPortal(user)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
