"use client";

import { AlertTriangle, CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatLongDate } from "@/lib/dates";
import type { InboxAlert } from "@/lib/types";

export function AlertCard({ alert }: { alert: InboxAlert }) {
  const isWarning = alert.icon === "warning";

  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl border bg-white p-3.5 shadow-sm",
        isWarning ? "border-orange-200" : "border-red-200",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isWarning ? "bg-orange-50 text-orange-500" : "bg-red-50 text-red-600",
        )}
        aria-hidden
      >
        {isWarning ? (
          <AlertTriangle className="h-5 w-5 fill-orange-400 text-orange-600" />
        ) : (
          <CircleAlert className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none" aria-hidden>
            {isWarning ? "⚠️" : "❗️"}
          </span>
          <h3 className="truncate text-sm font-semibold text-slate-800">
            {alert.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          {alert.kind === "document" ? "Expiră" : "Programare"}:{" "}
          {formatLongDate(alert.relatedDate)}
        </p>
      </div>
    </article>
  );
}
