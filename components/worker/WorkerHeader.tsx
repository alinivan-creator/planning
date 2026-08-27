"use client";

import { CalendarDays, List, Menu } from "lucide-react";
import { NotificationBadge } from "./NotificationBadge";

export function WorkerHeader({
  title,
  alertCount,
  onMenu,
  view,
  onViewChange,
}: {
  title: string;
  alertCount: number;
  onMenu: () => void;
  view?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-white px-3">
      <button
        type="button"
        onClick={onMenu}
        className="relative flex h-10 w-10 items-center justify-center rounded-md bg-[#0284c7] text-white shadow-sm"
        aria-label="Deschide meniul"
      >
        <Menu className="h-5 w-5" strokeWidth={2.25} />
        <NotificationBadge count={alertCount} className="ring-white" />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-800">
        {title}
      </h1>

      {onViewChange ? (
        <div className="flex items-center gap-1 text-[#0284c7]">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`rounded p-1.5 ${view === "grid" ? "bg-sky-50" : ""}`}
            aria-label="Vizualizare grilă"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`rounded p-1.5 ${view === "list" ? "bg-sky-50" : ""}`}
            aria-label="Vizualizare listă"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <span className="w-10" />
      )}
    </header>
  );
}
