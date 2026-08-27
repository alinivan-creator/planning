"use client";

import Link from "next/link";
import { Bell, CalendarDays, MapPin } from "lucide-react";
import { formatLongDate, todayISO } from "@/lib/dates";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import { useCurrentWorker, useStore, useWorkerShifts } from "@/lib/store";
import { ColorLegend } from "./ColorLegend";

export function OverviewCards() {
  const worker = useCurrentWorker();
  const { workerAlerts, personalDocs } = useStore();
  const shifts = useWorkerShifts();
  const today = todayISO();
  const todayShifts = shifts.filter((item) => item.date === today);

  return (
    <div className="space-y-4 px-3 pb-8">
      <section className="rounded-2xl bg-[#0284c7] p-4 text-white">
        <p className="text-xs uppercase tracking-wide text-white/80">Angajat</p>
        <h2 className="mt-1 text-lg font-semibold">{worker.name}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
          <MapPin className="h-4 w-4" />
          {worker.role} · {worker.location}
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Astăzi</h3>
        {todayShifts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-400">
            Nu ai tură programată astăzi.
          </p>
        ) : (
          <ul className="space-y-2">
            {todayShifts.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl px-3 py-3 text-sm ${STATUS_STYLES[item.status]}`}
              >
                <div className="font-semibold">
                  {item.start} – {item.end} · {STATUS_LABELS[item.status]}
                </div>
                {item.location !== "—" ? (
                  <div className="mt-0.5 text-xs opacity-90">{item.location}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ColorLegend />

      <Link
        href="/informa"
        className="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-orange-800">
          <Bell className="h-4 w-4" />
          {workerAlerts.length + personalDocs.length} alerte și fișiere personale
        </span>
        <span className="text-xs text-orange-700">Vezi tot</span>
      </Link>

      <Link
        href="/programa"
        className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
      >
        <CalendarDays className="h-4 w-4 text-[#0284c7]" />
        Programă pe 3 săptămâni
      </Link>

      <p className="text-center text-[11px] text-slate-400">
        {formatLongDate(today)}
      </p>
    </div>
  );
}
