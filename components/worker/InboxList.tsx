"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import type { InboxAlert } from "@/lib/types";
import { AlertCard } from "./AlertCard";

type Filter = "all" | "document" | "appointment";

export function InboxList({ alerts }: { alerts: InboxAlert[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((item) => item.kind === filter);
  }, [alerts, filter]);

  return (
    <div className="px-3 pb-8">
      <p className="mb-3 text-sm text-slate-500">
        Avizier digital — alertele dispar automat după data programării.
      </p>

      <div className="mb-4 flex gap-2">
        {(
          [
            ["all", "Toate"],
            ["document", "Documente"],
            ["appointment", "Programări"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === id
                ? "bg-[#0284c7] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
          <Inbox className="h-8 w-8" />
          <p className="text-sm">Nicio alertă activă.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((alert) => (
            <li key={alert.id}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
