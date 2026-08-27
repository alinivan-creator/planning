"use client";

import { useRouter } from "next/navigation";
import { HardHat, Shield, UserRoundCog } from "lucide-react";
import { DEMO_USERS, departments } from "@/lib/auth/users";
import { roleLabel } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";

export function LoginScreen() {
  const { login } = useStore();
  const router = useRouter();

  async function choose(userId: string, role: UserRole) {
    await login(userId);
    router.push(role === "worker" ? "/prezentare" : "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#0284c7]">
          Autentificare pe roluri
        </p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-slate-900">
          TuraPlan
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
          Worker vede doar datele proprii. Supervisorul este izolat pe departament.
          Adminul are acces global.
        </p>

        <ul className="mt-8 space-y-2">
          {DEMO_USERS.map((user) => {
            const Icon =
            user.role === "admin"
              ? Shield
              : user.role === "supervisor"
                ? UserRoundCog
                : HardHat;
            const department = departments.find((item) => item.id === user.departmentId);
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => choose(user.id, user.role)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm hover:border-[#0284c7]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#0284c7]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {roleLabel(user.role)}
                      {department ? ` · ${department.name}` : " · Toată compania"}
                    </span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {user.role}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Demo local. În producție, sesiunea vine din Supabase Auth + RLS.
        </p>
      </div>
    </div>
  );
}
