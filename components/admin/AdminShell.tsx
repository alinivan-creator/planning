"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calculator,
  FileStack,
  FileText,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { roleLabel } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Panou HR", icon: LayoutDashboard },
  { href: "/admin/angajati", label: "Angajați", icon: Users },
  { href: "/admin/distribuire", label: "Distribuire", icon: FileStack },
  { href: "/admin/documente", label: "Documente HR", icon: FileText },
  { href: "/admin/calculator-ture", label: "Calculator ture", icon: Calculator },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resetDemo, currentUser, logout, state } = useStore();
  const department = state.departments.find(
    (item) => item.id === currentUser?.departmentId,
  );

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full bg-slate-50">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#0284c7] text-white md:flex">
        <div className="px-5 py-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/70">TuraPlan</p>
          <h1 className="mt-1 text-lg font-semibold">
            {currentUser ? roleLabel(currentUser.role) : "Staff"}
          </h1>
          <p className="mt-1 text-xs text-white/80">
            {currentUser?.name}
            {department ? ` · ${department.name}` : " · Toată compania"}
          </p>
        </div>
        <nav className="flex flex-1 flex-col px-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm",
                  active ? "bg-[#0369a1]" : "hover:bg-white/10",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="mx-3 mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Deconectare
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#0284c7]">
              {currentUser?.role === "admin" ? "Acces global" : "Izolat pe departament"}
            </p>
            <h2 className="text-base font-semibold text-slate-800">
              {currentUser?.role === "supervisor"
                ? `Echipa ${department?.name ?? ""}`
                : "Administrare companie"}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset date
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold",
                pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "bg-[#0284c7] text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
