"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDaysISO,
  formatISO,
  isoWeekNumber,
  parseISODate,
  startOfWeekMonday,
  threeWeekMondays,
  todayISO,
} from "@/lib/dates";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import type { ExtraAvailability, Shift } from "@/lib/types";
import { ColorLegend } from "./ColorLegend";
import { WeekGrid } from "./WeekGrid";

export function ThreeWeekSchedule({
  shifts,
  extra,
  view,
}: {
  shifts: Shift[];
  extra: ExtraAvailability[];
  view: "grid" | "list";
}) {
  const today = todayISO();
  const [anchorMonday, setAnchorMonday] = useState(() =>
    formatISO(startOfWeekMonday(new Date())),
  );

  const mondays = useMemo(
    () => threeWeekMondays(anchorMonday),
    [anchorMonday],
  );

  function goToday() {
    setAnchorMonday(formatISO(startOfWeekMonday(new Date())));
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setAnchorMonday(addDaysISO(anchorMonday, -7))}
          className="p-1 text-[#0284c7]"
          aria-label="Săptămâna anterioară"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-slate-800">
          3 săptămâni · S
          {isoWeekNumber(parseISODate(mondays[0]))}–
          {isoWeekNumber(parseISODate(mondays[2]))}
        </div>
        <button
          type="button"
          onClick={() => setAnchorMonday(addDaysISO(anchorMonday, 7))}
          className="p-1 text-[#0284c7]"
          aria-label="Săptămâna următoare"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={goToday}
          className="rounded-md border border-[#0284c7] px-2.5 py-1 text-xs font-semibold text-[#0284c7]"
        >
          Astăzi
        </button>
      </div>

      <ColorLegend />

      {view === "grid" ? (
        <div className="space-y-6">
          {mondays.map((monday) => (
            <section key={monday}>
              <h2 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Săptămâna {isoWeekNumber(parseISODate(monday))}
              </h2>
              <WeekGrid
                mondayISO={monday}
                todayISO={today}
                shifts={shifts}
                extra={extra}
              />
            </section>
          ))}
        </div>
      ) : (
        <ScheduleList mondays={mondays} shifts={shifts} extra={extra} today={today} />
      )}
    </div>
  );
}

function ScheduleList({
  mondays,
  shifts,
  extra,
  today,
}: {
  mondays: string[];
  shifts: Shift[];
  extra: ExtraAvailability[];
  today: string;
}) {
  const days = mondays.flatMap((_, index) =>
    Array.from({ length: 7 }, (__, i) => addDaysISO(mondays[index], i)),
  );

  return (
    <ul className="divide-y divide-slate-100 px-3">
      {days.map((iso) => {
        const dayShifts = shifts.filter((item) => item.date === iso);
        const dayExtra = extra.filter((item) => item.date === iso);
        const date = parseISODate(iso);
        return (
          <li key={iso} className="py-3">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-800">
                {["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"][
                  date.getDay() === 0 ? 6 : date.getDay() - 1
                ]}{" "}
                {date.getDate()}
              </span>
              {iso === today ? (
                <span className="text-[11px] font-semibold text-[#0284c7]">Astăzi</span>
              ) : null}
            </div>
            {dayShifts.length === 0 && dayExtra.length === 0 ? (
              <p className="text-xs text-slate-400">Fără program</p>
            ) : (
              <div className="space-y-1.5">
                {dayShifts.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-md px-2.5 py-2 text-xs ${STATUS_STYLES[item.status]}`}
                  >
                    <div className="font-semibold">
                      {item.start} – {item.end} · {STATUS_LABELS[item.status]}
                    </div>
                    {item.location !== "—" ? (
                      <div className="mt-0.5 opacity-90">{item.location}</div>
                    ) : null}
                  </div>
                ))}
                {dayExtra.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md bg-emerald-500/20 px-2.5 py-2 text-xs text-emerald-900"
                  >
                    Extra disponibilitate {item.start}–{item.end}
                  </div>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
