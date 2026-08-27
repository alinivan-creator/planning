"use client";

import { Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { parseISODate, weekdayIndexMonday, weekDates } from "@/lib/dates";
import { GRID_END, GRID_START, HOUR_PX } from "@/lib/status";
import type { ExtraAvailability, Shift } from "@/lib/types";
import { ShiftBlock } from "./ShiftBlock";

const hours = Array.from(
  { length: GRID_END - GRID_START },
  (_, i) => GRID_START + i,
);

export function WeekGrid({
  mondayISO,
  todayISO,
  shifts,
  extra,
}: {
  mondayISO: string;
  todayISO: string;
  shifts: Shift[];
  extra: ExtraAvailability[];
}) {
  const days = weekDates(mondayISO);

  return (
    <div className="min-w-0">
      <div
        className="grid border-b border-slate-200"
        style={{ gridTemplateColumns: "28px repeat(7, minmax(0, 1fr))" }}
      >
        <div />
        {days.map((iso) => {
          const date = parseISODate(iso);
          const isToday = iso === todayISO;
          return (
            <div
              key={iso}
              className={cn(
                "py-1.5 text-center text-[11px] leading-tight text-slate-500",
                isToday && "text-[#0284c7]",
              )}
            >
              <div className="lowercase">
                {["lu", "ma", "mi", "jo", "vi", "sâ", "du"][weekdayIndexMonday(iso)]}
              </div>
              <div
                className={cn(
                  "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-semibold",
                  isToday && "bg-[#0284c7] text-white",
                )}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "28px repeat(7, minmax(0, 1fr))" }}
      >
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute right-1 -translate-y-2 text-[10px] text-slate-400"
              style={{ top: (hour - GRID_START) * HOUR_PX }}
            >
              {hour}
            </div>
          ))}
        </div>

        {days.map((iso) => {
          const dayShifts = shifts.filter((item) => item.date === iso);
          const dayExtra = extra.filter((item) => item.date === iso);
          const isToday = iso === todayISO;
          return (
            <div
              key={iso}
              className={cn(
                "relative border-l border-slate-100",
                isToday && "bg-sky-50/60",
              )}
              style={{ height: (GRID_END - GRID_START) * HOUR_PX }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-t border-slate-100"
                  style={{ top: (hour - GRID_START) * HOUR_PX, height: HOUR_PX }}
                />
              ))}
              {dayShifts.map((item) => (
                <ShiftBlock key={item.id} shift={item} />
              ))}
              {dayExtra.map((item) => (
                <div
                  key={item.id}
                  className="absolute inset-x-0.5 z-10 rounded bg-emerald-500/20 px-1 py-0.5 text-[9px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-400/40"
                  style={{
                    top: 4,
                  }}
                >
                  Extra {item.start}–{item.end}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div
        className="grid border-t border-slate-200"
        style={{ gridTemplateColumns: "28px repeat(7, minmax(0, 1fr))" }}
      >
        <div />
        {days.map((iso) => {
          const hasShift = shifts.some((item) => item.date === iso);
          const weekend = [0, 6].includes(parseISODate(iso).getDay());
          if (hasShift || !weekend) {
            return <div key={iso} className="h-8" />;
          }
          return (
            <div
              key={iso}
              className="m-0.5 flex h-8 items-center gap-0.5 rounded bg-slate-100 px-1 text-[9px] text-slate-500"
            >
              <Minus className="h-3 w-3 shrink-0 text-red-500" />
              <span className="truncate">Indisp.</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
