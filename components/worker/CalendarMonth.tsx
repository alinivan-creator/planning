"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  DAY_SHORT,
  formatISO,
  formatLongDate,
  MONTH_LONG,
  parseISODate,
  todayISO,
  weekdayIndexMonday,
} from "@/lib/dates";
import { STATUS_DOT, STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import type { Shift } from "@/lib/types";

function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const startOffset = weekdayIndexMonday(formatISO(first));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatISO(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export function CalendarMonth({ shifts }: { shifts: Shift[] }) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState(today);

  const rows = useMemo(
    () => monthMatrix(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const shift of shifts) {
      const list = map.get(shift.date) ?? [];
      list.push(shift);
      map.set(shift.date, list);
    }
    return map;
  }, [shifts]);

  const selectedShifts = byDate.get(selected) ?? [];

  function prevMonth() {
    setCursor((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 },
    );
  }

  function nextMonth() {
    setCursor((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 },
    );
  }

  return (
    <div className="px-3 pb-8">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="p-1 text-[#0284c7]" aria-label="Luna anterioară">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-sm font-semibold capitalize text-slate-800">
          {MONTH_LONG[cursor.month]} {cursor.year}
        </h2>
        <button type="button" onClick={nextMonth} className="p-1 text-[#0284c7]" aria-label="Luna următoare">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium uppercase text-slate-400">
        {DAY_SHORT.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg bg-slate-100 p-px">
        {rows.flat().map((iso, index) => {
          if (!iso) {
            return <div key={`empty-${index}`} className="min-h-[52px] bg-white" />;
          }
          const dayShifts = byDate.get(iso) ?? [];
          const isToday = iso === today;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={cn(
                "min-h-[52px] bg-white px-1 py-1 text-left",
                isSelected && "ring-2 ring-inset ring-[#0284c7]",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday && "bg-[#0284c7] font-semibold text-white",
                )}
              >
                {parseISODate(iso).getDate()}
              </span>
              <div className="mt-0.5 flex flex-wrap gap-0.5">
                {dayShifts.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status]}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <section className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          {formatLongDate(selected)}
        </h3>
        {selectedShifts.length === 0 ? (
          <p className="text-sm text-slate-400">Nicio tură în această zi.</p>
        ) : (
          <ul className="space-y-2">
            {selectedShifts.map((item) => (
              <li
                key={item.id}
                className={`rounded-md px-3 py-2.5 text-sm ${STATUS_STYLES[item.status]}`}
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
    </div>
  );
}
