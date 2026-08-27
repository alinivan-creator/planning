import { NextResponse } from "next/server";
import { findDemoUser } from "@/lib/auth/users";
import { SESSION_COOKIE } from "@/lib/rbac";

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string };
  const user = findDemoUser(body.userId);
  if (!user) {
    return NextResponse.json({ error: "Utilizator inexistent" }, { status: 401 });
  }

  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
