"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Home,
  LayoutGrid,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { roleLabel } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import { NotificationBadge } from "./NotificationBadge";

const PRIMARY_ITEMS = [
  { href: "/prezentare", label: "Prezentare generală", icon: Home },
  { href: "/programa", label: "Programă", icon: LayoutGrid },
  { href: "/calendaristic", label: "Calendaristic", icon: CalendarDays },
  { href: "/informa", label: "A informa", icon: Bell, badge: true },
] as const;

export function Drawer({
  open,
  onClose,
  alertCount,
}: {
  open: boolean;
  onClose: () => void;
  alertCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  async function handleLogout() {
    await logout();
    onClose();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-slate-900/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-label="Închide meniul"
      />

      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-[#0284c7] text-white shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        inert={!open ? true : undefined}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-5 text-[15px] font-medium"
        >
          <X className="h-5 w-5" strokeWidth={2} />
          Închide
        </button>

        {currentUser ? (
          <p className="px-5 pb-3 text-xs text-white/80">
            {currentUser.name} · {roleLabel(currentUser.role)}
          </p>
        ) : null}

        <nav className="flex flex-1 flex-col px-2">
          {PRIMARY_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 rounded-md px-4 py-3.5 text-[15px] transition-colors",
                  active ? "bg-[#0369a1]" : "hover:bg-white/10",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  {"badge" in item && item.badge ? (
                    <NotificationBadge
                      count={alertCount}
                      className="-right-2 -top-2 ring-[#0284c7]"
                    />
                  ) : null}
                </span>
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-auto mb-6 flex items-center gap-4 rounded-md px-4 py-3.5 text-left text-[15px] hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            Deconectare
          </button>
        </nav>
      </aside>
    </div>
  );
}
