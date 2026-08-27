import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findDemoUser } from "@/lib/auth/users";
import { SESSION_COOKIE } from "@/lib/rbac";

export async function GET() {
  const jar = await cookies();
  const user = findDemoUser(jar.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ user });
}
